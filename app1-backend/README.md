# app1-backend

App 1（Property Value Estimator）的 FastAPI 后端：表单校验、转发 Task 1 ML 容器、历史估算存储（SQLite）、统一错误格式。

设计依据：见仓库根目录 `app1-backend-analysis.md`。

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/estimates` | 提交估算。请求体为特征对象数组（≥1）：单条=1 元素，对比=N 元素。纯透传给 ML 容器 `POST /predict`，结果持久化后返回（同批共享 `batch_id`） |
| `GET` | `/api/estimates?limit=&offset=` | 历史估算分页列表（按创建时间倒序） |
| `GET` | `/api/estimates/{id}` | 单条估算详情 |
| `GET` | `/api/model-info` | 代理 ML 容器 `GET /model`（R²/RMSE 等） |
| `GET` | `/api/health` | 自身存活 + ML 容器可达性 |

特征字段与校验约束镜像 Task 1（`square_footage` gt=0、`bedrooms` 1–20、`bathrooms` 0.5–20、`year_built` 1800–当前年、`lot_size` gt=0、`distance_to_city_center` ≥0、`school_rating` 0–10）。

错误响应统一为 `{ "error": { "code", "message", "details" } }`：422 本服务校验失败 / 502 ML 容器返回错误 / 503 ML 容器不可达或超时 / 500 未预期错误。

## 本地开发

```bash
uv sync
uv run uvicorn app.main:app --reload --port 8001
```

前提：Task 1 ML 容器已在 `http://localhost:8000` 运行（或用 `ML_MODEL_URL` 指向其他地址）。

Swagger 文档：http://localhost:8001/docs

## 测试

```bash
uv run pytest
```

测试用内存 SQLite + stub ModelClient，无需起真实 ML 容器。

## Docker

```bash
docker build -t app1-backend .
# 在仓库根目录用 compose 一并启动（含 ML 容器）：
docker compose up --build ml-model app1-backend
```
