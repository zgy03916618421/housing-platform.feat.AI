# 响应 schema
import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.request import PropertyFeatures


class EstimateRecord(BaseModel):
    """一条已持久化的估算记录。"""

    id: uuid.UUID
    created_at: datetime
    features: PropertyFeatures
    prediction: float
    batch_id: uuid.UUID


class EstimateBatchResponse(BaseModel):
    """POST /api/estimates 的响应：同一批请求共享 batch_id（供对比视图分组）。"""

    batch_id: uuid.UUID
    estimates: list[EstimateRecord]


class EstimateListResponse(BaseModel):
    """GET /api/estimates 的分页响应。"""

    total: int
    items: list[EstimateRecord]


class ModelInfoResponse(BaseModel):
    """代理自 ML 容器 GET /model 的模型元信息。"""

    algorithm: str
    r2_score: float
    rmse: float
    coefficients: list[float]
    intercept: float


class HealthResponse(BaseModel):
    status: str
    ml_model_reachable: bool
