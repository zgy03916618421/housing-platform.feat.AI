# FastAPI 应用入口
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  确保 ORM 表元数据已注册
from app.api.deps import close_model_client
from app.api.router import api_router
from app.core.config import settings
from app.db import init_db
from app.errors import register_exception_handlers


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    yield
    await close_model_client()


app = FastAPI(title="App 1 — Property Value Estimator API", lifespan=lifespan)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
