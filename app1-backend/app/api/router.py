# API 路由聚合
from fastapi import APIRouter

from app.api.entrypoints.estimates_router import router as estimates_router
from app.api.entrypoints.health_router import router as health_router
from app.api.entrypoints.model_router import router as model_router

api_router = APIRouter()

api_router.include_router(estimates_router, prefix="/api/estimates", tags=["Estimates"])
api_router.include_router(model_router, prefix="/api/model-info", tags=["Model"])
api_router.include_router(health_router, prefix="/api/health", tags=["Health"])
