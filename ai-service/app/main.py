from fastapi import FastAPI
from app.analytics.forecast import PriceForecastRequest, PriceForecastResponse, forecast_market_price
from app.analytics.valuation import ValuationRequest, ValuationResponse, estimate_individual_price

app = FastAPI(title="EXOHUB AI Service", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": "exohub-ai-service", "status": "UP"}


@app.post("/api/v1/ai/valuation", response_model=ValuationResponse)
def valuation(req: ValuationRequest) -> ValuationResponse:
    return estimate_individual_price(req)


@app.post("/api/v1/ai/forecast", response_model=PriceForecastResponse)
def forecast(req: PriceForecastRequest) -> PriceForecastResponse:
    return forecast_market_price(req)