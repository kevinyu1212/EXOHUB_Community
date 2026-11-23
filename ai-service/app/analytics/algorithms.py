import re
from typing import Any
from pydantic import BaseModel, Field


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


class ChatAssistResponse(BaseModel):
    reply: str
    suggested_routes: list[str]
    confidence: float
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


def run_chat_assist(req: ChatAssistRequest) -> ChatAssistResponse:
    q = req.message.strip()
    routes = ["/taxa", "/price", "/care", "/collection"]
    if any(k in q for k in ["가격", "시세", "분양", "장비", "사료"]):
        reply = (
            f"'{q}' 관련 가격·분양가 흐름은 가격 비교(/price)와 마켓(/market)에서 출처·수집 시각·검수 상태와 함께 확인할 수 있습니다. "
            "분양가 산정/시세 예측 API(/api/v1/ai/valuation, /api/v1/ai/forecast)를 참고용으로 활용할 수 있습니다."
        )
        routes = ["/price", "/market", "/ai-lab"]
    elif any(k in q for k in ["사육", "수조", "온도", "습도", "번식", "표본", "박제"]):
        reply = (
            f"'{q}' 관련 개체·수조·환경 기록은 사육 관리(/care)에서, 보관 및 증빙 내역은 표본·박제 컬렉션(/collection)에서 관리할 수 있습니다."
        )
        routes = ["/care", "/collection", "/community"]
    else:
        reply = (
            f"'{q}'에 대한 생물 도감 정보와 유사종 비교는 생물 도감(/taxa)과 통합 검색(/search)에서 찾아보실 수 있습니다. "
            "AI 응답은 탐색·비교 보조용이며 전문가 검수가 필요한 항목은 별도 확인이 필요합니다."
        )
        routes = ["/taxa", "/search", "/ai-lab"]

    return ChatAssistResponse(
        reply=reply,
        suggested_routes=routes,
        confidence=0.68,
        caution_note="종 확정 동정, 질병 진단, 법적 거래 허용 여부는 AI가 단독 확정하지 않으며 전문가 검수 및 관련 법령 확인이 필요합니다.",
    )