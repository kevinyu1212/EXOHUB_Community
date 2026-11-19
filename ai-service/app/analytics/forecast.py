from pydantic import BaseModel, Field


class PricePoint(BaseModel):
    timestamp: str
    price: float = Field(ge=0)


class PriceForecastRequest(BaseModel):
    taxon_id: str
    horizon_days: int = Field(default=30, ge=1, le=180)
    history: list[PricePoint] = Field(default_factory=list)


class PriceForecastResponse(BaseModel):
    taxon_id: str
    horizon_days: int
    predicted_mean_price: float
    trend_direction: str
    model_version: str = "forecast-baseline-v0.1"


def forecast_market_price(req: PriceForecastRequest) -> PriceForecastResponse:
    if not req.history:
        return PriceForecastResponse(
            taxon_id=req.taxon_id,
            horizon_days=req.horizon_days,
            predicted_mean_price=0.0,
            trend_direction="INSUFFICIENT_DATA",
        )

    prices = [p.price for p in req.history]
    avg_price = round(sum(prices) / len(prices), 2)
    direction = "FLAT"
    if len(prices) >= 2:
        delta = prices[-1] - prices[0]
        if delta > 0:
            direction = "UP"
        elif delta < 0:
            direction = "DOWN"

    return PriceForecastResponse(
        taxon_id=req.taxon_id,
        horizon_days=req.horizon_days,
        predicted_mean_price=avg_price,
        trend_direction=direction,
    )