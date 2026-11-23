from datetime import datetime, timezone
from html import unescape
import os
import re
from urllib.parse import quote_plus, unquote
import httpx
from pydantic import BaseModel, Field


class WebSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    max_results: int = Field(default=6, ge=1, le=10)


class WebSearchResultItem(BaseModel):
    title: str
    url: str
    snippet: str
    source: str


class WebSearchResponse(BaseModel):
    query: str
    collected_at: str
    verification_status: str
    briefing_summary: str
    highlights: list[str]
    results: list[WebSearchResultItem]
    diagnostics: list[str]
    disclaimer: str


def _clean_html_text(raw: str) -> str:
    no_tags = re.sub(r"<[^>]+>", " ", raw)
    return re.sub(r"\s+", " ", unescape(no_tags)).strip()


def _extract_ddg_url(href: str) -> str:
    cleaned = unescape(href).strip()
    if cleaned.startswith("//"):
        cleaned = "https:" + cleaned
    match = re.search(r"[?&]uddg=([^&]+)", cleaned)
    if match:
        return unquote(match.group(1))
    return cleaned


def _search_naver(query: str, max_results: int, client: httpx.Client) -> list[WebSearchResultItem]:
    naver_id = os.getenv("NAVER_CLIENT_ID", "").strip()
    naver_secret = os.getenv("NAVER_CLIENT_SECRET", "").strip()
    if not naver_id or not naver_secret:
        return []

    resp = client.get(
        "https://openapi.naver.com/v1/search/webkr.json",
        params={"query": query, "display": min(max_results, 10)},
        headers={
            "X-Naver-Client-Id": naver_id,
            "X-Naver-Client-Secret": naver_secret,
        },
    )
    resp.raise_for_status()
    payload = resp.json()
    items: list[WebSearchResultItem] = []
    for row in payload.get("items", [])[:max_results]:
        title = _clean_html_text(str(row.get("title", "")))
        url = str(row.get("link", "")).strip()
        snippet = _clean_html_text(str(row.get("description", "")))
        if title and url:
            items.append(
                WebSearchResultItem(
                    title=title,
                    url=url,
                    snippet=snippet,
                    source="naver-webkr",
                )
            )
    return items


def _search_ddg_instant_json(query: str, max_results: int, client: httpx.Client) -> list[WebSearchResultItem]:
    resp = client.get(
        "https://api.duckduckgo.com/",
        params={"q": query, "format": "json", "no_redirect": "1", "no_html": "1"},
    )
    resp.raise_for_status()
    data = resp.json()
    items: list[WebSearchResultItem] = []

    abstract_text = str(data.get("AbstractText", "")).strip()
    abstract_url = str(data.get("AbstractURL", "")).strip()
    heading = str(data.get("Heading", "")).strip() or query
    if abstract_text and abstract_url:
        items.append(
            WebSearchResultItem(
                title=heading,
                url=abstract_url,
                snippet=abstract_text,
                source="duckduckgo-api",
            )
        )

    for topic in data.get("RelatedTopics", []):
        if len(items) >= max_results:
            break
        if isinstance(topic, dict) and topic.get("FirstURL") and topic.get("Text"):
            items.append(
                WebSearchResultItem(
                    title=str(topic.get("Text", ""))[:80],
                    url=str(topic.get("FirstURL", "")),
                    snippet=str(topic.get("Text", "")),
                    source="duckduckgo-api",
                )
            )
    return items


def _search_wikipedia_ko(query: str, max_results: int, client: httpx.Client) -> list[WebSearchResultItem]:
    resp = client.get(
        "https://ko.wikipedia.org/w/api.php",
        params={
            "action": "opensearch",
            "search": query,
            "limit": min(max_results, 10),
            "namespace": "0",
            "format": "json",
        },
    )
    resp.raise_for_status()
    arr = resp.json()
    if not isinstance(arr, list) or len(arr) < 4:
        return []
    titles = arr[1] or []
    snippets = arr[2] or []
    urls = arr[3] or []
    items: list[WebSearchResultItem] = []
    for idx in range(min(len(titles), len(urls), max_results)):
        t = str(titles[idx]).strip()
        u = str(urls[idx]).strip()
        s = str(snippets[idx]).strip() if idx < len(snippets) else f"위키피디아 '{t}' 항목"
        if t and u:
            items.append(
                WebSearchResultItem(
                    title=t,
                    url=u,
                    snippet=s or f"위키피디아 '{t}' 참고 문서",
                    source="wikipedia-ko",
                )
            )
    return items


def _search_google_html(query: str, max_results: int, client: httpx.Client) -> list[WebSearchResultItem]:
    encoded_q = quote_plus(query)
    url = f"https://www.google.com/search?q={encoded_q}&hl=ko&num={min(max_results, 10)}"
    resp = client.get(url)
    resp.raise_for_status()
    html_body = resp.text

    items: list[WebSearchResultItem] = []
    for raw_href, raw_title in re.findall(
        r'<a[^>]*href="(/url\?q=[^"&]+|https?://[^"&]+)"[^>]*>(.*?)</a>',
        html_body,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        title = _clean_html_text(raw_title)
        if not title or len(title) < 3 or "google.com" in raw_href.lower():
            continue
        if raw_href.startswith("/url?q="):
            target_url = unquote(raw_href.split("/url?q=", 1)[1].split("&", 1)[0])
        else:
            target_url = unescape(raw_href)
        if not target_url.startswith("http"):
            continue
        items.append(
            WebSearchResultItem(
                title=title,
                url=target_url,
                snippet="구글 검색 결과 출처 링크입니다. 원문 내용을 확인해 주세요.",
                source="google-web",
            )
        )
        if len(items) >= max_results:
            break
    return items


def _search_duckduckgo_html(query: str, max_results: int, client: httpx.Client) -> list[WebSearchResultItem]:
    encoded_q = quote_plus(query)
    search_url = f"https://html.duckduckgo.com/html/?q={encoded_q}"
    resp = client.get(search_url)
    resp.raise_for_status()
    html_body = resp.text

    title_matches = re.findall(
        r'<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
        html_body,
        flags=re.IGNORECASE | re.DOTALL,
    )
    snippet_matches = re.findall(
        r'<(?:a|div)[^>]*class="[^"]*result__snippet[^"]*"[^>]*>(.*?)</(?:a|div)>',
        html_body,
        flags=re.IGNORECASE | re.DOTALL,
    )

    items: list[WebSearchResultItem] = []
    for idx, (raw_href, raw_title) in enumerate(title_matches[:max_results]):
        title = _clean_html_text(raw_title)
        url = _extract_ddg_url(raw_href)
        snippet = _clean_html_text(snippet_matches[idx]) if idx < len(snippet_matches) else ""
        if title and url:
            items.append(
                WebSearchResultItem(
                    title=title,
                    url=url,
                    snippet=snippet,
                    source="duckduckgo-web",
                )
            )
    return items


def _build_briefing(query: str, items: list[WebSearchResultItem]) -> tuple[str, list[str]]:
    valid_items = [it for it in items if it.source != "collector-fallback"]
    if not valid_items:
        return (
            f"'{query}'에 대한 외부 검색 결과를 확보하지 못했습니다. 네트워크/프록시 상태 또는 네이버 API 키 설정을 확인해 주세요.",
            ["외부 검색 결과 없음 · 출처 원문 확인 필요"],
        )

    sources = sorted({it.source for it in valid_items})
    highlights: list[str] = []
    for it in valid_items[:4]:
        short_snip = it.snippet[:110] + ("..." if len(it.snippet) > 110 else "")
        if short_snip:
            highlights.append(f"[{it.source}] {it.title}: {short_snip}")
        else:
            highlights.append(f"[{it.source}] {it.title}")

    summary = (
        f"'{query}' 검색으로 총 {len(valid_items)}건의 출처({', '.join(sources)})를 수집했습니다. "
        f"수집된 요약·스니펫을 바탕으로 브리핑을 생성했으며, 세부 수치와 법적·전문가 검수는 출처 원문으로 별도 확인해야 합니다."
    )
    return summary, highlights


def run_web_search(req: WebSearchRequest) -> WebSearchResponse:
    query = req.query.strip()
    collected_at = datetime.now(timezone.utc).isoformat()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    merged: list[WebSearchResultItem] = []
    seen_urls: set[str] = set()
    diagnostics: list[str] = []

    def _append_unique(rows: list[WebSearchResultItem]) -> None:
        for r in rows:
            if r.url and r.url not in seen_urls and len(merged) < req.max_results:
                seen_urls.add(r.url)
                merged.append(r)

    with httpx.Client(timeout=8.0, follow_redirects=True, headers=headers) as client:
        for label, fn in (
            ("naver", lambda: _search_naver(query, req.max_results, client)),
            ("ddg-api", lambda: _search_ddg_instant_json(query, req.max_results, client)),
            ("wiki-ko", lambda: _search_wikipedia_ko(query, req.max_results, client)),
            ("google-html", lambda: _search_google_html(query, req.max_results, client)),
            ("ddg-html", lambda: _search_duckduckgo_html(query, req.max_results, client)),
        ):
            if len(merged) >= req.max_results:
                break
            try:
                found = fn()
                diagnostics.append(f"{label}: {len(found)}건")
                _append_unique(found)
            except Exception as exc:
                diagnostics.append(f"{label}: 오류({type(exc).__name__}: {exc})")

    if not merged:
        merged.append(
            WebSearchResultItem(
                title="외부 검색 수집 결과 없음 (네트워크/차단 또는 API 키 확인 필요)",
                url=f"https://ko.wikipedia.org/w/index.php?search={quote_plus(query)}",
                snippet=" | ".join(diagnostics) if diagnostics else "검색 응답이 비어 있습니다.",
                source="collector-fallback",
            )
        )

    briefing_summary, highlights = _build_briefing(query, merged)

    return WebSearchResponse(
        query=query,
        collected_at=collected_at,
        verification_status="UNVERIFIED_EXTERNAL_WEB",
        briefing_summary=briefing_summary,
        highlights=highlights,
        results=merged,
        diagnostics=diagnostics,
        disclaimer="외부 인터넷 검색으로 자동 수집된 브리핑이며, 출처 원문과 법적 거래 허용·종 확정 동정·질병 진단은 별도 확인 및 검수가 필요합니다.",
    )