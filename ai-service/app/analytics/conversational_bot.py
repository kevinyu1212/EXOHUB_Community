from pathlib import Path
from typing import Any, Literal
import joblib
from pydantic import BaseModel, Field
from sklearn.metrics.pairwise import cosine_similarity
from app.analytics.web_search_bot import enrich_chat_with_web_search

CORPUS_PATH = Path(__file__).resolve().parents[2] / "models" / "bot_search_corpus_v1.joblib"


class ConversationTurn(BaseModel):
  role: Literal["user", "assistant"]
  content: str = Field(..., min_length=1)


class MatchedSourceRef(BaseModel):
  title: str
  url: str
  source: str
  score: float
  snippet: str
  verification_status: str = "UNVERIFIED_EXTERNAL_WEB"
  collected_at: str | None = None


class ConversationalChatRequest(BaseModel):
  message: str = Field(..., min_length=1)
  history: list[ConversationTurn] = Field(default_factory=list)
  context_path: str = Field(default="/")
  enable_live_web_fallback: bool = Field(default=True)
  deep_web_search: bool = Field(default=False)


class ConversationalChatResponse(BaseModel):
  reply: str
  suggested_routes: list[str]
  follow_ups: list[str] = Field(default_factory=list)
  confidence: float
  matched_sources: list[MatchedSourceRef] = Field(default_factory=list)
  expanded_queries: list[str] = Field(default_factory=list)
  live_briefing_summary: str | None = None
  collected_at: str | None = None
  verification_status: str = "UNVERIFIED_EXTERNAL_WEB"
  caution_note: str


def _extract_last_user_topic(history: list[ConversationTurn]) -> str:
  for turn in reversed(history):
    if turn.role == "user" and turn.content.strip():
      return turn.content.strip()
  return ""


def _build_contextual_query(message: str, history: list[ConversationTurn]) -> str:
  curr = message.strip()
  prev_user = _extract_last_user_topic(history)
  if not prev_user or prev_user == curr:
    return curr

  follow_markers = [
      "더", "그거", "그것", "이거", "이것", "추가", "자세히", "다른", "비교",
      "시세", "가격", "사육", "검색", "브리핑", "이어서", "계속", "왜", "어떻게"
  ]
  is_follow_up = len(curr) <= 24 or any(m in curr for m in follow_markers)
  if is_follow_up:
    return f"{prev_user} {curr}".strip()
  return curr


def _retrieve_corpus_matches(query: str, top_k: int = 3) -> list[MatchedSourceRef]:
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

    matches: list[MatchedSourceRef] = []
    for idx in ranked_indices:
      score = float(sims[idx])
      if score <= 0.0:
        continue
      rec = records[idx]
      matches.append(
          MatchedSourceRef(
              title=str(rec.get("title", "제목 없음")),
              url=str(rec.get("url", "")),
              source=str(rec.get("source", "corpus")),
              score=round(score, 3),
              snippet=str(rec.get("snippet", ""))[:180],
              verification_status=str(rec.get("verification_status", "UNVERIFIED_EXTERNAL_WEB")),
              collected_at=str(rec.get("collected_at", "")) or None,
          )
      )
    return matches
  except Exception:
    return []


def generate_conversational_reply(req: ConversationalChatRequest) -> ConversationalChatResponse:
  raw_q = req.message.strip()
  effective_q = _build_contextual_query(raw_q, req.history)
  prev_user = _extract_last_user_topic(req.history)
  turn_count = len(req.history) + 1

  if any(k in effective_q for k in ["가격", "시세", "분양", "장비", "사료"]):
    routes = ["/price", "/market", "/ai-lab"]
    domain_lead = (
        f"이전 '{prev_user}' 대화에 이어 '{raw_q}' 관점에서 보면, "
        if prev_user and effective_q != raw_q
        else ""
    ) + (
        f"'{effective_q}' 관련 분양가·시세 흐름은 가격 비교(/price)와 마켓(/market)에서 출처·수집 시각·검수 상태를 함께 대조해 보시는 것이 좋습니다. "
        "단일 게시물 가격이나 추정치는 참고 지표로만 활용하고 실제 거래 조건과 법적 허용 여부는 별도로 확인해 주세요."
    )
    follow_ups = [
        f"{effective_q} 가격 이상치 기준 알려줘",
        f"{effective_q} 웹 검색 브리핑 더 찾아줘",
        "비슷한 개체 사육 환경도 알려줘",
    ]
  elif any(k in effective_q for k in ["사육", "수조", "온도", "습도", "탈피", "번식", "표본", "박제"]):
    routes = ["/care", "/collection", "/community"]
    domain_lead = (
        f"방금 말씀하신 '{prev_user}' 맥락을 이어 '{raw_q}' 부분을 짚어보면, "
        if prev_user and effective_q != raw_q
        else ""
    ) + (
        f"'{effective_q}' 관련 개체·사육장·수조 환경 변화는 사육 관리(/care)에서 시계열로 기록하고, "
        "표본·박제 보관이나 증빙 내역은 컬렉션(/collection)에서 함께 관리할 수 있습니다. "
        "이상 징후·질병 의심이나 법적 거래 가능 여부는 AI가 판단하지 않으며 전문가 검수 및 법령 확인이 필요합니다."
    )
    follow_ups = [
        f"{effective_q} 초보자 주의사항 정리해줘",
        f"{effective_q} 관련 웹 자료 더 검색해줘",
        "분양가나 사육장비 시세도 볼래",
    ]
  else:
    routes = ["/taxa", "/search", "/ai-lab"]
    domain_lead = (
        f"'{prev_user}'에서 이어지는 '{raw_q}' 질문에 대해 말씀드리면, "
        if prev_user and effective_q != raw_q
        else ""
    ) + (
        f"'{effective_q}'는 생물 도감(/taxa)과 통합 검색(/search)에서 후보 정보와 유사 개체를 함께 살펴보실 수 있습니다. "
        "유사종 구별이나 종 확정 동정은 전문가 검수가 필요하니 참고용 탐색 단서로 활용해 주세요."
    )
    follow_ups = [
        f"{effective_q} 사육 온도·습도 조건 알려줘",
        f"{effective_q} 최근 분양·시세 검색해줘",
        "유사한 종이나 다른 화면으로 이동할래",
    ]

  corpus_hits = _retrieve_corpus_matches(effective_q, top_k=3)
  top_score = corpus_hits[0].score if corpus_hits else 0.0

  live_summary: str | None = None
  expanded_queries: list[str] = []
  collected_at: str | None = None
  verification_status = "UNVERIFIED_EXTERNAL_WEB"

  wants_live = any(k in raw_q for k in ["최신", "검색", "브리핑", "뉴스", "실시간", "웹", "더"])
  if req.enable_live_web_fallback and (req.deep_web_search or top_score < 0.14 or wants_live):
    enriched = enrich_chat_with_web_search(
        effective_q,
        max_results_per_query=3,
        deep_search=req.deep_web_search or wants_live,
    )
    expanded_queries = enriched.expanded_queries
    collected_at = enriched.collected_at
    verification_status = enriched.verification_status
    if enriched.briefing_summary:
      live_summary = enriched.briefing_summary

    existing_urls = {m.url for m in corpus_hits if m.url}
    for src in enriched.sources:
      u = src.get("url", "")
      if u and u in existing_urls:
        continue
      if u:
        existing_urls.add(u)
      corpus_hits.append(
          MatchedSourceRef(
              title=src.get("title", "외부 출처"),
              url=u,
              source=src.get("source", "external-web"),
              score=0.34 if req.deep_web_search else 0.25,
              snippet=src.get("snippet", ""),
              verification_status=src.get("verification_status", "UNVERIFIED_EXTERNAL_WEB"),
              collected_at=src.get("collected_at"),
          )
      )

  parts: list[str] = [domain_lead]
  if effective_q != raw_q:
    parts.append(f"[대화 문맥 반영 질의] {effective_q} (대화 {turn_count}턴)")
  if live_summary:
    parts.append(f"[검색 기반 대화 브리핑]\n{live_summary}")
  if corpus_hits:
    lines = [
        f"- [{h.source} · 관련도 {h.score}] {h.title}: {h.snippet}"
        for h in corpus_hits[:4]
    ]
    parts.append("[참고 근거]\n" + "\n".join(lines))
    confidence = min(0.92, round(0.6 + max(top_score, 0.2 if live_summary else 0.0) * 0.32, 2))
  else:
    confidence = 0.68

  return ConversationalChatResponse(
      reply="\n\n".join(parts),
      suggested_routes=routes,
      follow_ups=follow_ups,
      confidence=confidence,
      matched_sources=corpus_hits[:4],
      expanded_queries=expanded_queries,
      live_briefing_summary=live_summary,
      collected_at=collected_at,
      verification_status=verification_status,
      caution_note="종 확정 동정, 질병 진단, 법적 거래 허용 여부는 AI가 단독 확정하지 않으며 전문가 검수 및 관련 법령 확인이 필요합니다.",
  )