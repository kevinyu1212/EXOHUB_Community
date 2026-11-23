from pydantic import BaseModel, Field


class PriceForecastRequest(BaseModel):
    item_key: str = Field(..., min_length=1)
    series: list[float] = Field(default_factory=list)
    horizon_days: int = Field(default=14, ge=1, le=90)


class PriceForecastResponse(BaseModel):
    item_key: str
    horizon_days: int
    predicted_prices: list[float]
    trend: str
    confidence: float
    disclaimer: str


def forecast_prices(req: PriceForecastRequest) -> PriceForecastResponse:
    if not req.series:
        return PriceForecastResponse(
            item_key=req.item_key,
            horizon_days=req.horizon_days,
            predicted_prices=[],
            trend="INSUFFICIENT_DATA",
            confidence=0.0,
            disclaimer="시계열 이력이 부족해 예측을 생략했습니다.",
        )

    last_val = float(req.series[-1])
    if len(req.series) >= 2:
        delta = (float(req.series[-1]) - float(req.series[0])) / max(len(req.series) - 1, 1)
        step_delta = delta * 0.35
    else:
        step_delta = 0.0

    preds: list[float] = []
    for i in range(1, req.horizon_days + 1):
        val = max(0.0, round(last_val + step_delta * i, -2))
        preds.append(val)

    if step_delta > 150:
        trend = "UPWARD"
    elif step_delta < -150:
        trend = "DOWNWARD"
    else:
        trend = "STABLE"

    confidence = min(0.75, 0.35 + 0.05 * len(req.series))
    return PriceForecastResponse(
        item_key=req.item_key,
        horizon_days=req.horizon_days,
        predicted_prices=preds,
        trend=trend,
        confidence=round(confidence, 2),
        disclaimer="과거 가격 이력 기반 참고 추세이며 시장 변동 및 검수 상태에 따라 달라질 수 있습니다.",
    )