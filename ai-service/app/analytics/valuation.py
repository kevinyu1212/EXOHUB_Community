from pydantic import BaseModel, Field


class ValuationRequest(BaseModel):
    taxon_name: str = Field(..., min_length=1)
    category_code: str = Field(default="GENERAL")
    stage: str = Field(default="JUVENILE")
    size_cm: float = Field(default=5.0, ge=0.0)
    grade: str = Field(default="STANDARD")
    recent_prices: list[float] = Field(default_factory=list)


class ValuationResponse(BaseModel):
    taxon_name: str
    estimated_price: float
    min_price: float
    max_price: float
    confidence: float
    method: str
    disclaimer: str


def estimate_valuation(req: ValuationRequest) -> ValuationResponse:
    stage_multiplier = {
        "SLING": 0.65,
        "JUVENILE": 1.0,
        "SUBADULT": 1.25,
        "ADULT": 1.5,
    }.get(req.stage.upper(), 1.0)

    grade_multiplier = {
        "STANDARD": 1.0,
        "HIGH_GRADE": 1.35,
        "LINEBRED": 1.5,
    }.get(req.grade.upper(), 1.0)

    if req.recent_prices:
        base = float(sum(req.recent_prices) / len(req.recent_prices))
        method = "MEAN_RECENT_HISTORY_BASELINE"
        confidence = 0.65 if len(req.recent_prices) >= 3 else 0.45
    else:
        base = 45000.0
        method = "HEURISTIC_FALLBACK"
        confidence = 0.25

    size_factor = 1.0 + min(max(req.size_cm, 0.0) * 0.015, 0.45)
    estimated = round(base * stage_multiplier * grade_multiplier * size_factor, -2)

    return ValuationResponse(
        taxon_name=req.taxon_name,
        estimated_price=estimated,
        min_price=round(estimated * 0.85, -2),
        max_price=round(estimated * 1.18, -2),
        confidence=confidence,
        method=method,
        disclaimer="참고용 산정치이며 실제 거래가·법적 거래 허용 여부는 별도 확인이 필요합니다.",
    )