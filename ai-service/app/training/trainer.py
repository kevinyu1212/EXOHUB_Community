from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import joblib
import numpy as np
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge
from app.analytics.web_collector import WebSearchRequest, WebSearchResponse, run_web_search

MODEL_DIR = Path(__file__).resolve().parents[2] / "models"
MODEL_PATH = MODEL_DIR / "valuation_ridge_v1.joblib"
BOT_CORPUS_PATH = MODEL_DIR / "bot_search_corpus_v1.joblib"

SEED_DOMAIN_RECORDS: list[dict[str, str]] = [
    {
        "query": "도감 분류 동정 기준",
        "title": "생물 도감 탐색 및 종 확정 동정 원칙",
        "url": "internal://exohub/taxa",
        "snippet": "도감 정보는 개체 탐색·비교 보조용이며, 학명·유사종 구별 및 종 확정 동정은 전문가 검수가 필요합니다.",
        "source": "exohub-seed",
        "verification_status": "EXPERT_REVIEW_REQUIRED",
    },
    {
        "query": "사육 수조 온도 습도 번식",
        "title": "개체·사육장·수조 환경 기록 및 탈피·번식 관리",
        "url": "internal://exohub/care",
        "snippet": "온도·습도·급이·탈피·번식 이력을 기록하되, 질병 의심이나 증상 진단은 수의·전문가 검수를 거쳐야 합니다.",
        "source": "exohub-seed",
        "verification_status": "EXPERT_REVIEW_REQUIRED",
    },
    {
        "query": "가격 비교 시세 이상치",
        "title": "분양·장비·사료·표본 가격 비교 및 이상치 점검",
        "url": "internal://exohub/price",
        "snippet": "배송비 포함 총액과 출처·확인 시각을 비교하고, 비정상 가격·중복 등록은 검수 대상으로 확인합니다.",
        "source": "exohub-seed",
        "verification_status": "UNVERIFIED_EXTERNAL_WEB",
    },
    {
        "query": "표본 박제 보관 법적 증빙",
        "title": "표본·박제 보관 이력 및 법적 거래 허용 확인",
        "url": "internal://exohub/collection",
        "snippet": "보관 환경과 증빙 내역을 정리하되, 법적 거래 허용 여부 및 관련 법령 준수는 반드시 별도로 확인해야 합니다.",
        "source": "exohub-seed",
        "verification_status": "LEGAL_CHECK_REQUIRED",
    },
]


class TrainValuationRequest(BaseModel):
    samples: list[list[float]] = Field(
        default_factory=list,
        description="각 행: [size_cm, stage_code, grade_code, base_price]",
    )
    targets: list[float] = Field(
        default_factory=list,
        description="목표 분양가/시세 값 목록",
    )


class TrainValuationResponse(BaseModel):
    status: str
    sample_count: int
    model_path: str
    trained_at: str
    r2_score: float | None = None
    note: str


class SearchAndTrainRequest(BaseModel):
    queries: list[str] = Field(
        default_factory=lambda: [
            "크레스티드 게코 사육 온도 습도 분양",
            "타란툴라 탈피 사육 환경",
            "곤충 표본 보관 법적 증빙",
        ]
    )
    max_results_per_query: int = Field(default=5, ge=1, le=10)
    include_seed_if_empty: bool = Field(default=True)


class SearchAndTrainResponse(BaseModel):
    status: str
    queries_processed: int
    web_items_collected: int
    total_documents_indexed: int
    corpus_path: str
    trained_at: str
    briefings: list[WebSearchResponse]
    note: str


def train_valuation_model(req: TrainValuationRequest) -> TrainValuationResponse:
    trained_at = datetime.now(timezone.utc).isoformat()
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    if len(req.samples) < 4 or len(req.samples) != len(req.targets):
        return TrainValuationResponse(
            status="SKIPPED_INSUFFICIENT_DATA",
            sample_count=len(req.samples),
            model_path=str(MODEL_PATH),
            trained_at=trained_at,
            r2_score=None,
            note="학습용 샘플이 4건 미만이거나 샘플/타겟 길이가 일치하지 않아 학습을 건너뛰었습니다.",
        )

    x_arr = np.asarray(req.samples, dtype=float)
    y_arr = np.asarray(req.targets, dtype=float)

    model = Ridge(alpha=1.0)
    model.fit(x_arr, y_arr)
    score = float(model.score(x_arr, y_arr))

    joblib.dump(
        {
            "model": model,
            "trained_at": trained_at,
            "sample_count": len(req.samples),
            "r2_score": score,
        },
        MODEL_PATH,
    )

    return TrainValuationResponse(
        status="TRAINED",
        sample_count=len(req.samples),
        model_path=str(MODEL_PATH),
        trained_at=trained_at,
        r2_score=round(score, 4),
        note="자체 학습 모델 가중치를 저장했습니다. 참고용 보조 모델이며 전문가 검수 및 법적 확인을 대체하지 않습니다.",
    )


def train_bot_from_web_search(req: SearchAndTrainRequest) -> SearchAndTrainResponse:
    trained_at = datetime.now(timezone.utc).isoformat()
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    existing_records: list[dict[str, Any]] = []
    if BOT_CORPUS_PATH.exists():
        try:
            loaded = joblib.load(BOT_CORPUS_PATH)
            if isinstance(loaded, dict) and isinstance(loaded.get("records"), list):
                existing_records = list(loaded["records"])
        except Exception:
            existing_records = []

    seen_urls = {str(r.get("url", "")) for r in existing_records if r.get("url")}
    briefings: list[WebSearchResponse] = []
    added_web_count = 0
    added_seed_count = 0

    for raw_q in req.queries:
        q = raw_q.strip()
        if not q:
            continue
        search_res = run_web_search(WebSearchRequest(query=q, max_results=req.max_results_per_query))
        briefings.append(search_res)

        for item in search_res.results:
            if item.source == "collector-fallback":
                continue
            if item.url in seen_urls:
                continue
            seen_urls.add(item.url)
            existing_records.append(
                {
                    "query": q,
                    "title": item.title,
                    "url": item.url,
                    "snippet": item.snippet,
                    "source": item.source,
                    "collected_at": search_res.collected_at,
                    "verification_status": search_res.verification_status,
                }
            )
            added_web_count += 1

    if added_web_count == 0 and req.include_seed_if_empty:
        for seed in SEED_DOMAIN_RECORDS:
            if seed["url"] in seen_urls:
                continue
            seen_urls.add(seed["url"])
            existing_records.append(
                {
                    **seed,
                    "collected_at": trained_at,
                }
            )
            added_seed_count += 1

    if not existing_records:
        return SearchAndTrainResponse(
            status="SKIPPED_NO_SEARCH_DATA",
            queries_processed=len(briefings),
            web_items_collected=added_web_count,
            total_documents_indexed=0,
            corpus_path=str(BOT_CORPUS_PATH),
            trained_at=trained_at,
            briefings=briefings,
            note="수집된 외부 검색 문서 및 시드 문서가 없어 봇 지식 인덱스 저장을 건너뛰었습니다.",
        )

    texts = [
        f"{r.get('query', '')} {r.get('title', '')} {r.get('snippet', '')}".strip()
        for r in existing_records
    ]
    vectorizer = TfidfVectorizer(token_pattern=r"(?u)\b\w+\b", max_features=4096)
    tfidf_matrix = vectorizer.fit_transform(texts)

    joblib.dump(
        {
            "vectorizer": vectorizer,
            "tfidf_matrix": tfidf_matrix,
            "records": existing_records,
            "trained_at": trained_at,
            "added_web_in_last_run": added_web_count,
            "added_seed_in_last_run": added_seed_count,
        },
        BOT_CORPUS_PATH,
    )

    mode_label = (
        "TRAINED_FROM_SEARCH_AND_SEED"
        if added_web_count > 0 and added_seed_count > 0
        else ("TRAINED_FROM_SEARCH" if added_web_count > 0 else "TRAINED_FROM_SEED_FALLBACK")
    )

    return SearchAndTrainResponse(
        status=mode_label,
        queries_processed=len(briefings),
        web_items_collected=added_web_count,
        total_documents_indexed=len(existing_records),
        corpus_path=str(BOT_CORPUS_PATH),
        trained_at=trained_at,
        briefings=briefings,
        note=(
            f"외부 검색 {added_web_count}건·시드 {added_seed_count}건 반영, 총 {len(existing_records)}건으로 봇 코퍼스를 학습했습니다. "
            "(종 동정·질병·법적 거래 허용은 별도 검수 필요)"
        ),
    )