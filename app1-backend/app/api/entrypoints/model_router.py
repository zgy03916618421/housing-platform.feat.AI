# 模型元信息端点：代理 ML 容器 GET /model（注意：Task 1 实际路径是 /model）
from fastapi import APIRouter, Depends

from app.api.deps import get_model_client
from app.schemas.response import ModelInfoResponse
from app.services.model_client import ModelClient

router = APIRouter()


@router.get("", response_model=ModelInfoResponse)
async def model_info(model_client: ModelClient = Depends(get_model_client)) -> ModelInfoResponse:
    info = await model_client.get_model_info()
    return ModelInfoResponse(**info)
