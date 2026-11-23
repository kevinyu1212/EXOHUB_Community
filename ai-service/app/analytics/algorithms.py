import re
from pydantic import BaseModel, Field
from app.analytics.conversational_bot import (
    ConversationalChatRequest,
    ConversationalChatResponse,
    ConversationTurn,
    MatchedSourceRef,
    generate_conversational_reply,
)

ChatAssistRequest = ConversationalChatRequest
ChatAssistResponse = ConversationalChatResponse
MatchedCorpusSource = MatchedSourceRef


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


def run_chat_assist(req: ConversationalChatRequest) -> ConversationalChatResponse:
  return generate_conversational_reply(req)