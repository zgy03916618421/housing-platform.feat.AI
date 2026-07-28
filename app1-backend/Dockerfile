FROM python:3.12-slim

# 防止 Python 生成 pyc 文件
ENV PYTHONDONTWRITEBYTECODE=1

# 日志立即输出
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 安装 uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# 先复制依赖文件（利用 Docker Layer Cache）
COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev

# 再复制项目源码
COPY . .

EXPOSE 8001

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
