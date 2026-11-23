from fastapi import FastAPI
from app.analytics.valuation import ValuationRequest, ValuationResponse, estimate_valuation
from app.analytics.forecast import PriceForecastRequest, PriceForecastResponse, forecast_prices
from app.analytics.algorithms import (
    AnomalyCheckRequest,
    AnomalyCheckResponse,
    ChatAssistRequest,
    ChatAssistResponse,
    NormalizeItem,
    NormalizeRequest,
    run_anomaly_check,
    run_chat_assist,
    run_normalize,
)

app = FastAPI(title="EXOHUB AI Service", version="0.2.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "exohub-ai-service"}


@app.post("/api/v1/ai/valuation", response_model=ValuationResponse)
def api_valuation(req: ValuationRequest) -> ValuationResponse:
    return estimate_valuation(req)


@app.post("/api/v1/ai/forecast", response_model=PriceForecastResponse)
def api_forecast(req: PriceForecastRequest) -> PriceForecastResponse:
    return forecast_prices(req)


@app.post("/api/v1/ai/normalize", response_model=list[NormalizeItem])
def api_normalize(req: NormalizeRequest) -> list[NormalizeItem]:
    return run_normalize(req)


@app.post("/api/v1/ai/anomaly-check", response_model=AnomalyCheckResponse)
def api_anomaly_check(req: AnomalyCheckRequest) -> AnomalyCheckResponse:
    return run_anomaly_check(req)


@app.post("/api/v1/ai/chat-assist", response_model=ChatAssistResponse)
def api_chat_assist(req: ChatAssistRequest) -> ChatAssistResponse:
    return run_chat_assist(req)