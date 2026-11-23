from pathlib import Path
import re
from typing import Any
import joblib
from pydantic import BaseModel, Field
from sklearn.metrics.pairwise import cosine_similarity
from app.analytics.web_collector import WebSearchRequest, run_web_search

CORPUS_PATH = Path(__file__).resolve().parents[2] / "models" / "bot_search_corpus_v1.joblib"


def normalize_label(raw: str) -> str:
  cleaned = re.sub(r"[\[\]()【】·/\\_-]+", " ", raw.lower()).strip()
  return re.sub(r"\s+", " ", cleaned)


class NormalizeRequest(BaseModel):
  names: list[str] = Field(default_factory=list)


class NormalizeItem(BaseModel):
  original: str
  normalized: str
  tokens: list[str]


class AnomalyCheckRequest(BaseModel):
  prices: list[float] = Field(default_factory=list)


class AnomalyCheckResponse(BaseModel):
  mean_price: float
  median_price: float
  flagged_indices: list[int]


class ChatAssistRequest(BaseModel):
  message: str = Field(..., min_length=1)
  context_path: str = Field(default="/")
  enable_live_web_fallback: bool = Field(default=True)


class MatchedCorpusSource(BaseModel):
  title: str
  url: str
  source: str
  score: float
  snippet: str
  verification_status: str = "UNVERIFIED_EXTERNAL_WEB"


class ChatAssistResponse(BaseModel):
  reply: str
  suggested_routes: list[str]
  confidence: float
  matched_sources: list[MatchedCorpusSource] = Field(default_factory=list)
  live_briefing_summary: str | None = None
  caution_note: str


def run_normalize(req: NormalizeRequest) -> list[NormalizeItem]:
  items: list[NormalizeItem] = []
  for raw in req.names:
    norm = normalize_label(raw)
    tokens = [t for t in norm.split(" ") if t]
    items.append(NormalizeItem(original=raw, normalized=norm, tokens=tokens))
  return items


def run_anomaly_check(req: AnomalyCheckRequest) -> AnomalyCheckResponse:
  if not req.prices:
    return AnomalyCheckResponse(mean_price=0.0, median_price=0.0, flagged_indices=[])
  sorted_p = sorted(req.prices)
  n = len(sorted_p)
  median = sorted_p[n // 2] if n % 2 == 1 else (sorted_p[n // 2 - 1] + sorted_p[n // 2]) / 2.0
  mean = sum(req.prices) / n
  flagged: list[int] = []
  if median > 0:
    for idx, p in enumerate(req.prices):
      if p < median * 0.45 or p > median * 2.2:
        flagged.append(idx)
  return AnomalyCheckResponse(
      mean_price=round(mean, 2),
      median_price=round(median, 2),
      flagged_indices=flagged,
  )


def _retrieve_corpus_matches(query: str, top_k: int = 3) -> list[MatchedCorpusSource]:
  if not CORPUS_PATH.exists():
    return []
  try:
    bundle = joblib.load(CORPUS_PATH)
    if not isinstance(bundle, dict):
      return []
    vectorizer = bundle.get("vectorizer")
    tfidf_matrix = bundle.get("tfidf_matrix")
    records: list[dict[str, Any]] = bundle.get("records") or []
    if vectorizer is None or tfidf_matrix is None or not records:
      return []

    q_vec = vectorizer.transform([query])
    sims = cosine_similarity(q_vec, tfidf_matrix).flatten()
    ranked_indices = sims.argsort()[::-1][:top_k]

    matches: list[MatchedCorpusSource] = []
    for idx in ranked_indices:
      score = float(sims[idx])
      if score <= 0.0:
        continue
      rec = records[idx]
      matches.append(
          MatchedCorpusSource(
              title=str(rec.get("title", "제목 없음")),
              url=str(rec.get("url", "")),
              source=str(rec.get("source", "corpus")),
              score=round(score, 3),
              snippet=str(rec.get("snippet", ""))[:180],
              verification_status=str(rec.get("verification_status", "UNVERIFIED_EXTERNAL_WEB")),
          )
      )
    return matches
  except Exception:
    return []


def run_chat_assist(req: ChatAssistRequest) -> ChatAssistResponse:
  q = req.message.strip()
  routes = ["/taxa", "/price", "/care", "/collection"]

  if any(k in q for k in ["가격", "시세", "분양", "장비", "사료"]):
    base_reply = (
        f"'{q}' 관련 가격·분양가 흐름은 가격 비교(/price)와 마켓(/market)에서 출처·수집 시각·검수 상태와 함께 확인할 수 있습니다. "
        "이상치·중복 항목과 시세 추정치는 참고용으로 활용해 주세요."
    )
    routes = ["/price", "/market", "/ai-lab"]
  elif any(k in q for k in ["사육", "수조", "온도", "습도", "탈피", "번식", "표본", "박제"]):
    base_reply = (
        f"'{q}' 관련 개체·수조·환경 기록은 사육 관리(/care)에서, 보관 및 증빙 내역은 표본·박제 컬렉션(/collection)에서 관리할 수 있습니다."
    )
    routes = ["/care", "/collection", "/community"]
  else:
    base_reply = (
        f"'{q}'에 대한 생물 도감 정보와 유사종 비교는 생물 도감(/taxa)과 통합 검색(/search)에서 찾아보실 수 있습니다."
    )
    routes = ["/taxa", "/search", "/ai-lab"]

  corpus_hits = _retrieve_corpus_matches(q, top_k=3)
  top_score = corpus_hits[0].score if corpus_hits else 0.0
  live_summary: str | None = None

  wants_live = any(k in q for k in ["최신", "검색", "브리핑", "뉴스", "실시간"])
  if req.enable_live_web_fallback and (top_score < 0.12 or wants_live):
    try:
      web_res = run_web_search(WebSearchRequest(query=q, max_results=3))
      valid_web = [it for it in web_res.results if it.source != "collector-fallback"]
      if valid_web:
        live_summary = web_res.briefing_summary
        existing_urls = {m.url for m in corpus_hits if m.url}
        for w in valid_web:
          if w.url in existing_urls:
            continue
          existing_urls.add(w.url)
          corpus_hits.append(
              MatchedCorpusSource(
                  title=w.title,
                  url=w.url,
                  source=w.source,
                  score=0.25,
                  snippet=w.snippet[:180],
                  verification_status=web_res.verification_status,
              )
          )
    except Exception:
      pass

  sections: list[str] = [base_reply]
  if live_summary:
    sections.append(f"[실시간 검색 브리핑]\n{live_summary}")
  if corpus_hits:
    hit_lines = [
        f"- [{h.source} · 관련도 {h.score}] {h.title}: {h.snippet}"
        for h in corpus_hits[:4]
    ]
    sections.append("[참고 출처 요약]\n" + "\n".join(hit_lines))
    confidence = min(0.9, round(0.55 + max(top_score, 0.15 if live_summary else 0.0) * 0.35, 2))
  else:
    confidence = 0.65

  return ChatAssistResponse(
      reply="\n\n".join(sections),
      suggested_routes=routes,
      confidence=confidence,
      matched_sources=corpus_hits[:4],
      live_briefing_summary=live_summary,
      caution_note="종 확정 동정, 질병 진단, 법적 거래 허용 여부는 AI가 단독 확정하지 않으며 전문가 검수 및 관련 법령 확인이 필요합니다.",
  )