from pydantic import BaseModel, Field


class ValuationRequest(BaseModel):
    taxon_id: str
    category_code: str
    sex: str | None = None
    life_stage: str | None = None
    size_value: float | None = None
    size_unit: str | None = None
    grade: str | None = None
    origin_type: str | None = None
    recent_median_price: float = Field(ge=0)


class ValuationResponse(BaseModel):
    taxon_id: str
    estimated_fair_price: float
    lower_bound_price: float
    upper_bound_price: float
    confidence: float = Field(ge=0.0, le=1.0)
    model_version: str = "valuation-baseline-v0.1"


def estimate_individual_price(req: ValuationRequest) -> ValuationResponse:
    base = req.recent_median_price
    multiplier = 1.0

    if req.grade:
        g = req.grade.upper()
        if g in {"S", "ULTRA", "HIGH_GRADE"}:
            multiplier *= 1.25
        elif g in {"A", "PREMIUM"}:
            multiplier *= 1.1

    if req.origin_type and req.origin_type.upper() == "WC":
        multiplier *= 0.9

    fair = round(base * multiplier, 2)
    return ValuationResponse(
        taxon_id=req.taxon_id,
        estimated_fair_price=fair,
        lower_bound_price=round(fair * 0.85, 2),
        upper_bound_price=round(fair * 1.15, 2),
        confidence=0.45,
    )