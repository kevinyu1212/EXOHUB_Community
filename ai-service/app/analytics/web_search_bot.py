from datetime import datetime, timezone
from pydantic import BaseModel, Field
from app.analytics.web_collector import WebSearchRequest, run_web_search


class WebBotEnrichmentResult(BaseModel):
  expanded_queries: list[str] = Field(default_factory=list)
  web_points: list[str] = Field(default_factory=list)
  sources: list[dict[str, str]] = Field(default_factory=list)
  collected_at: str
  verification_status: str = "UNVERIFIED_EXTERNAL_WEB"
  briefing_summary: str = ""


def build_expanded_queries(message: str) -> list[str]:
  base = message.strip()
  if not base:
    return []
  queries = [base]
  if any(k in base for k in ["가격", "시세", "분양", "장비", "사료"]):
    queries.append(f"{base} 분양가 시세 비교")
  elif any(k in base for k in ["사육", "수조", "온도", "습도", "탈피", "번식"]):
    queries.append(f"{base} 사육 환경 관리")
  elif any(k in base for k in ["표본", "박제", "법", "증빙"]):
    queries.append(f"{base} 보관 법적 확인")
  else:
    queries.append(f"{base} 사육 특징 주의사항")
  return queries[:2]


def enrich_chat_with_web_search(
    message: str,
    max_results_per_query: int = 3,
    deep_search: bool = False,
) -> WebBotEnrichmentResult:
  collected_at = datetime.now(timezone.utc).isoformat()
  queries = build_expanded_queries(message)
  if not deep_search and queries:
    queries = queries[:1]

  web_points: list[str] = []
  sources: list[dict[str, str]] = []
  seen_urls: set[str] = set()
  summaries: list[str] = []

  for q in queries:
    try:
      res = run_web_search(WebSearchRequest(query=q, max_results=max_results_per_query))
      valid = [r for r in res.results if r.source != "collector-fallback"]
      if valid:
        summaries.append(res.briefing_summary)
      for hl in res.highlights[:2]:
        if hl not in web_points:
          web_points.append(hl)
      for item in valid:
        if item.url and item.url not in seen_urls:
          seen_urls.add(item.url)
          sources.append(
              {
                  "title": item.title,
                  "url": item.url,
                  "source": item.source,
                  "snippet": item.snippet[:180],
                  "collected_at": res.collected_at,
                  "verification_status": res.verification_status,
              }
          )
    except Exception:
      continue

  return WebBotEnrichmentResult(
      expanded_queries=queries,
      web_points=web_points[:4],
      sources=sources[:4],
      collected_at=collected_at,
      verification_status="UNVERIFIED_EXTERNAL_WEB",
      briefing_summary=" / ".join(summaries),
  )