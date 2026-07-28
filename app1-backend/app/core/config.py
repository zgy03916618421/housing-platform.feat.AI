# 应用配置：通过环境变量覆盖（见仓库根目录 .env.example）
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Task 1 ML 容器地址：本地开发 http://localhost:8000；compose 内 http://ml-model:8000
    ml_model_url: str = "http://localhost:8000"
    # SQLite（aiosqlite 异步驱动）
    database_url: str = "sqlite+aiosqlite:///./estimates.db"
    # 允许的前端源，逗号分隔
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
