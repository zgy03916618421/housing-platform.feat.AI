# 测试夹具：内存 SQLite + stub ModelClient（无需起真实 ML 容器）
import asyncio

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel

import app.db as db_module
from app import models  # noqa: F401  注册表元数据
from app.api.deps import get_model_client
from app.db import get_session
from app.main import app
from app.services.model_client import ModelResponseError, ModelUnavailableError

# 合法请求样本（与 Task 1 README 示例一致）
SAMPLE_FEATURES = {
    "square_footage": 1550,
    "bedrooms": 3,
    "bathrooms": 2.5,
    "year_built": 1997,
    "lot_size": 6800,
    "distance_to_city_center": 4.1,
    "school_rating": 7.6,
}


class StubModelClient:
    """可编程的 ML 容器 stub：默认正常，可注入错误。"""

    def __init__(self) -> None:
        self.reachable = True
        self.predict_error: Exception | None = None
        self.info_error: Exception | None = None

    async def predict(self, features):
        if self.predict_error:
            raise self.predict_error
        return [100000.0 + f["square_footage"] for f in features]

    async def get_model_info(self):
        if self.info_error:
            raise self.info_error
        return {
            "algorithm": "LinearRegression",
            "r2_score": 0.91,
            "rmse": 31245.63,
            "coefficients": [1.0] * 7,
            "intercept": 51320.76,
        }

    async def is_reachable(self):
        return self.reachable


@pytest.fixture
def stub_client() -> StubModelClient:
    return StubModelClient()


@pytest.fixture
def client(stub_client: StubModelClient, monkeypatch: pytest.MonkeyPatch):
    # 每个测试用独立的内存数据库（StaticPool 保证多连接共享同一内存库）
    test_engine = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    test_session = async_sessionmaker(test_engine, expire_on_commit=False)

    async def override_session():
        async with test_session() as session:
            yield session

    app.dependency_overrides[get_session] = override_session
    app.dependency_overrides[get_model_client] = lambda: stub_client

    # lifespan 里的 init_db 使用 app.db 模块级 engine，替换为测试引擎避免产生真实文件
    monkeypatch.setattr(db_module, "engine", test_engine)

    async def create_tables() -> None:
        async with test_engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)

    asyncio.run(create_tables())

    with TestClient(app) as test_client:  # with 语法触发 lifespan
        yield test_client

    app.dependency_overrides.clear()


__all__ = [
    "SAMPLE_FEATURES",
    "ModelResponseError",
    "ModelUnavailableError",
    "StubModelClient",
]
