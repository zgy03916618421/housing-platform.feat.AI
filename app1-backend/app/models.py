# ORM 模型：历史估算记录
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class Estimate(SQLModel, table=True):
    __tablename__ = "estimates"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    # 特征存 JSON 而非打平列：特征集随 Task 1 演化时无需迁移
    features: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    prediction: float
    # 同一批请求（一次表单提交 / 一次对比）共享 batch_id，供对比视图分组
    batch_id: uuid.UUID = Field(index=True)
