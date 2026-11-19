from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
import json

import joblib
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split

ARTIFACTS_DIR = Path(__file__).resolve().parents[2] / "artifacts"


class TrainingSample(BaseModel):
    category_code: str
    grade: str | None = None
    origin_type: str | None = None
    size_value: float = Field(default=0.0, ge=0.0)
    history_count: int = Field(default=1, ge=1)
    recent_median_price: float = Field(ge=0.0)
    target_price: float = Field(ge=0.0)


class AutoTrainRequest(BaseModel):
    task_type: Literal["VALUATION", "PRICE_FORECAST"] = "VALUATION"
    model_family: Literal["RIDGE", "RANDOM_FOREST"] = "RANDOM_FOREST"
    min_samples: int = Field(default=10, ge=4)
    samples: list[TrainingSample] = Field(default_factory=list)


class AutoTrainResponse(BaseModel):
    status: Literal["TRAINED", "SKIPPED_INSUFFICIENT_DATA"]
    task_type: str
    model_family: str
    sample_count: int
    mae: float | None = None
    rmse: float | None = None
    artifact_path: str | None = None
    trained_at: str


def _encode_features(samples: list[TrainingSample]) -> tuple[pd.DataFrame, np.ndarray]:
    rows = []
    targets = []
    grade_map = {"STANDARD": 1.0, "A": 1.1, "PREMIUM": 1.15, "S": 1.25, "ULTRA": 1.3, "HIGH_GRADE": 1.25}
    origin_map = {"CB": 1.0, "CBB": 1.05, "WC": 0.9, "CAPTIVE_BRED": 1.0}

    for item in samples:
        g_score = grade_map.get((item.grade or "STANDARD").upper(), 1.0)
        o_score = origin_map.get((item.origin_type or "CB").upper(), 1.0)
        rows.append(
            {
                "category_hash": float(sum(ord(ch) for ch in item.category_code.upper()) % 97),
                "grade_score": g_score,
                "origin_score": o_score,
                "size_value": float(item.size_value),
                "history_count": float(item.history_count),
                "recent_median_price": float(item.recent_median_price),
            }
        )
        targets.append(float(item.target_price))

    return pd.DataFrame(rows), np.array(targets, dtype=float)


def run_auto_training(req: AutoTrainRequest) -> AutoTrainResponse:
    now_iso = datetime.now(timezone.utc).isoformat()
    if len(req.samples) < req.min_samples:
        return AutoTrainResponse(
            status="SKIPPED_INSUFFICIENT_DATA",
            task_type=req.task_type,
            model_family=req.model_family,
            sample_count=len(req.samples),
            artifact_path=None,
            trained_at=now_iso,
        )

    X, y = _encode_features(req.samples)
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

    if req.model_family == "RIDGE":
        model = Ridge(alpha=1.0)
    else:
        model = RandomForestRegressor(n_estimators=100, random_state=42)

    model.fit(X_train, y_train)
    preds = model.predict(X_val)

    mae = round(float(mean_absolute_error(y_val, preds)), 2)
    rmse = round(float(np.sqrt(mean_squared_error(y_val, preds))), 2)

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    ts_tag = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    model_file = ARTIFACTS_DIR / f"{req.task_type.lower()}_{req.model_family.lower()}_{ts_tag}.joblib"
    meta_file = ARTIFACTS_DIR / f"{req.task_type.lower()}_{req.model_family.lower()}_{ts_tag}.json"

    joblib.dump({"model": model, "columns": list(X.columns), "task_type": req.task_type}, model_file)
    meta_file.write_text(
        json.dumps(
            {
                "task_type": req.task_type,
                "model_family": req.model_family,
                "sample_count": len(req.samples),
                "mae": mae,
                "rmse": rmse,
                "artifact_path": str(model_file),
                "trained_at": now_iso,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    return AutoTrainResponse(
        status="TRAINED",
        task_type=req.task_type,
        model_family=req.model_family,
        sample_count=len(req.samples),
        mae=mae,
        rmse=rmse,
        artifact_path=str(model_file),
        trained_at=now_iso,
    )