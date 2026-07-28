# 健康检查端点：自身存活 + 探测 ML 容器可达性
from fastapi import APIRouter, Depends

from app.api.deps import get_model_client
from app.schemas.response import HealthResponse
from app.services.model_client import ModelClient

router = APIRouter()


@router.get("", response_model=HealthResponse)
async def health(model_client: ModelClient = Depends(get_model_client)) -> HealthResponse:
    return HealthResponse(status="ok", ml_model_reachable=await model_client.is_reachable())
