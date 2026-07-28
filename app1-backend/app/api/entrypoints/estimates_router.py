# 估算端点：提交估算（表单与对比共用）、历史分页、单条详情
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_model_client
from app.db import get_session
from app.models import Estimate
from app.schemas.request import EstimateBatchParam
from app.schemas.response import (
    EstimateBatchResponse,
    EstimateListResponse,
    EstimateRecord,
)
from app.services import estimates as service
from app.services.model_client import ModelClient

router = APIRouter()


def _to_record(row: Estimate) -> EstimateRecord:
    return EstimateRecord(
        id=row.id,
        created_at=row.created_at,
        features=row.features,
        prediction=row.prediction,
        batch_id=row.batch_id,
    )


@router.post("", response_model=EstimateBatchResponse, status_code=201)
async def create_estimates(
    items: EstimateBatchParam,
    session: AsyncSession = Depends(get_session),
    model_client: ModelClient = Depends(get_model_client),
) -> EstimateBatchResponse:
    batch_id, records = await service.create_estimates(session, model_client, items)
    return EstimateBatchResponse(
        batch_id=batch_id,
        estimates=[_to_record(r) for r in records],
    )


@router.get("", response_model=EstimateListResponse)
async def list_estimates(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
) -> EstimateListResponse:
    total, rows = await service.list_estimates(session, limit, offset)
    return EstimateListResponse(total=total, items=[_to_record(r) for r in rows])


@router.get("/{estimate_id}", response_model=EstimateRecord)
async def get_estimate(
    estimate_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
) -> EstimateRecord:
    row = await service.get_estimate(session, estimate_id)
    if row is None:
        raise HTTPException(status_code=404, detail="估算记录不存在")
    return _to_record(row)
