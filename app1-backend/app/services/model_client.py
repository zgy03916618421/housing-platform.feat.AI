# ML 容器客户端：协议抽象 + httpx 异步实现
#
# 集成约定（见 app1-backend-analysis.md）：
# - 纯透传：feature dict 列表原样 POST 给 /predict，零字段映射
# - 超时：connect 2s / read 10s
# - 仅连接错误重试 1 次；不重试 4xx/5xx
# - 错误映射：不可达/超时 → ModelUnavailableError（503）；非 2xx → ModelResponseError（502）
from typing import Any, Protocol

import httpx


class ModelUnavailableError(Exception):
    """ML 容器不可达或超时（映射为 503）。"""


class ModelResponseError(Exception):
    """ML 容器返回非 2xx 或响应不符合契约（映射为 502）。"""

    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(message)


class ModelClient(Protocol):
    """ML 容器客户端抽象：测试时替换为 stub，无需起真实容器。"""

    async def predict(self, features: list[dict[str, Any]]) -> list[float]: ...
    async def get_model_info(self) -> dict[str, Any]: ...
    async def is_reachable(self) -> bool: ...


class HttpxModelClient:
    def __init__(self, base_url: str):
        self._client = httpx.AsyncClient(
            base_url=base_url,
            timeout=httpx.Timeout(10.0, connect=2.0),
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    async def _request(self, method: str, url: str, **kwargs: Any) -> httpx.Response:
        last_error: httpx.ConnectError | None = None
        for attempt in range(2):  # 首次 + 重试 1 次，仅针对连接错误
            try:
                return await self._client.request(method, url, **kwargs)
            except httpx.ConnectError as exc:  # 含 ConnectTimeout
                last_error = exc
                if attempt == 1:
                    break
            except httpx.TimeoutException as exc:  # ReadTimeout 等：重试无意义
                raise ModelUnavailableError("ML 模型容器请求超时") from exc
        raise ModelUnavailableError("ML 模型容器不可达") from last_error

    @staticmethod
    def _ensure_ok(resp: httpx.Response) -> None:
        if resp.status_code != 200:
            raise ModelResponseError(resp.status_code, resp.text[:500])

    async def predict(self, features: list[dict[str, Any]]) -> list[float]:
        resp = await self._request("POST", "/predict", json=features)
        self._ensure_ok(resp)
        return resp.json()["predictions"]

    async def get_model_info(self) -> dict[str, Any]:
        resp = await self._request("GET", "/model")
        self._ensure_ok(resp)
        return resp.json()

    async def is_reachable(self) -> bool:
        try:
            resp = await self._request("GET", "/health")
        except ModelUnavailableError:
            return False
        return resp.status_code == 200
