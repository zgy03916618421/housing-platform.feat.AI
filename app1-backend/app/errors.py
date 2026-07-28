# 统一错误处理：把所有异常包装为 { "error": { code, message, details } } 格式
#
# 状态码约定：
#   422 VALIDATION_ERROR   本服务自身的请求校验失败
#   502 MODEL_ERROR        ML 容器返回非 2xx 或违反契约
#   503 MODEL_UNAVAILABLE  ML 容器不可达 / 超时
#   404 NOT_FOUND          资源不存在
#   500 INTERNAL_ERROR     未预期错误
import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.services.model_client import ModelResponseError, ModelUnavailableError

logger = logging.getLogger("app1")


def _payload(code: str, message: str, details: list[dict[str, Any]] | None = None) -> dict:
    return {"error": {"code": code, "message": message, "details": details or []}}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
        details = [
            {
                # loc 形如 ("body", 0, "square_footage")，去掉 "body" 前缀后拼成字段路径
                "field": ".".join(str(p) for p in e["loc"] if p != "body") or None,
                "issue": e["msg"],
            }
            for e in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content=_payload("VALIDATION_ERROR", "请求参数校验失败", details),
        )

    @app.exception_handler(ModelUnavailableError)
    async def unavailable_handler(_request: Request, exc: ModelUnavailableError) -> JSONResponse:
        return JSONResponse(status_code=503, content=_payload("MODEL_UNAVAILABLE", str(exc)))

    @app.exception_handler(ModelResponseError)
    async def model_error_handler(_request: Request, exc: ModelResponseError) -> JSONResponse:
        return JSONResponse(
            status_code=502,
            content=_payload(
                "MODEL_ERROR",
                f"ML 容器返回错误（HTTP {exc.status_code}）",
                [{"issue": exc.message}],
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_handler(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = "NOT_FOUND" if exc.status_code == 404 else "HTTP_ERROR"
        return JSONResponse(status_code=exc.status_code, content=_payload(code, str(exc.detail)))

    @app.exception_handler(Exception)
    async def unhandled_handler(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("未预期错误: %s", exc)
        return JSONResponse(status_code=500, content=_payload("INTERNAL_ERROR", "服务器内部错误"))
