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
from app.analytics.web_collector import WebSearchRequest, WebSearchResponse, run_web_search
from app.training.trainer import (
    SearchAndTrainRequest,
    SearchAndTrainResponse,
    TrainValuationRequest,
    TrainValuationResponse,
    train_bot_from_web_search,
    train_valuation_model,
)

app = FastAPI(title="EXOHUB AI Service", version="0.5.0")


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


@app.post("/api/v1/ai/web-search", response_model=WebSearchResponse)
def api_web_search(req: WebSearchRequest) -> WebSearchResponse:
    return run_web_search(req)


@app.post("/api/v1/ai/train", response_model=TrainValuationResponse)
def api_train(req: TrainValuationRequest) -> TrainValuationResponse:
    return train_valuation_model(req)


@app.post("/api/v1/ai/search-and-train", response_model=SearchAndTrainResponse)
def api_search_and_train(req: SearchAndTrainRequest) -> SearchAndTrainResponse:
    return train_bot_from_web_search(req)