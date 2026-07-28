# API 层共享依赖
from app.core.config import settings
from app.services.model_client import HttpxModelClient, ModelClient

# 进程级单例：复用连接池；测试通过 dependency_overrides 替换为 stub
_model_client = HttpxModelClient(settings.ml_model_url)


def get_model_client() -> ModelClient:
    return _model_client


async def close_model_client() -> None:
    await _model_client.aclose()
