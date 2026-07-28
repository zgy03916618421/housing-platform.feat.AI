# 业务服务层：估算记录的创建与查询
import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Estimate
from app.schemas.request import PropertyFeatures
from app.services.model_client import ModelClient, ModelResponseError


async def create_estimates(
    session: AsyncSession,
    model_client: ModelClient,
    items: list[PropertyFeatures],
) -> tuple[uuid.UUID, list[Estimate]]:
    """校验通过的请求纯透传给 ML 容器，预测结果连同输入原子化持久化。"""
    payload = [item.model_dump() for item in items]
    predictions = await model_client.predict(payload)
    if len(predictions) != len(payload):
        # ML 容器违反契约（返回数量与请求不一致），视为上游错误
        raise ModelResponseError(502, "ML 容器返回的预测数量与请求不一致")

    batch_id = uuid.uuid4()
    records = [
        Estimate(features=feature, prediction=prediction, batch_id=batch_id)
        for feature, prediction in zip(payload, predictions)
    ]
    session.add_all(records)
    await session.commit()
    for record in records:
        await session.refresh(record)
    return batch_id, records


async def list_estimates(
    session: AsyncSession, limit: int, offset: int
) -> tuple[int, list[Estimate]]:
    """按创建时间倒序分页返回，total 为全量条数。"""
    total = (
        await session.execute(select(func.count()).select_from(Estimate))
    ).scalar_one()
    rows = (
        await session.execute(
            select(Estimate)
            .order_by(Estimate.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    ).scalars().all()
    return total, list(rows)


async def get_estimate(session: AsyncSession, estimate_id: uuid.UUID) -> Estimate | None:
    return await session.get(Estimate, estimate_id)
