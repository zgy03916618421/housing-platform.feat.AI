# AGENTS.md — ai-interview

> 面向 AI 编码 agent 的项目说明。阅读前假设你对本项目一无所知。

## 项目概述

本仓库是一个面试任务（interview task）的工作目录，目标是构建一个 **Multi-Application Next.js Portal**，包含两个应用：

- **App 1 — Property Value Estimator**：Next.js 前端 + FastAPI 后端，集成已有的 ML 回归模型容器（Task 1），提供房产估价表单、历史估算、多属性对比功能。
- **App 2 — Property Market Analysis**：Next.js 前端 + Spring Boot 后端，提供市场分析仪表盘与 what-if 分析（规划阶段，细节未定）。

**当前状态：项目尚处于规划阶段，仓库中没有任何代码。** 仅有两份中文规划文档：

- `app1-backend-analysis.md` — App 1 后端的任务分析（v2，已对照 Task 1 实际代码核实接口契约），是所有后端设计决策的权威依据。
- `dev-task-list.md` — 分阶段开发任务列表（Phase 0–5），是当前事实上的开发路线图。

做与 App 1 后端相关的决策时，先读 `app1-backend-analysis.md`；安排工作顺序时，先读 `dev-task-list.md`。

## 外部依赖：Task 1 ML 容器

App 1 后端是一个薄代理层，依赖外部的 Task 1 代码库（路径：`/Users/byter/Documents/Work/python/interview-task/`，**不在本仓库内**）。已核实的接口契约（以其代码为准，其 README 有出入）：

| 端点 | 请求 | 响应 |
|---|---|---|
| `POST /predict` | JSON 数组（≥1 个特征对象），原生支持批量 | `{"predictions": [float, ...]}` |
| `GET /model` | — | `{"algorithm", "r2_score", "rmse", "coefficients", "intercept"}`（注意：路径是 `/model`，不是 README 写的 `/model-info`） |
| `GET /health` | — | `{"status": "Ok"}`（大写 `"Ok"`） |

特征集为 **7 个纯数值字段**（无类别特征，无编码/转换层）：

| 字段 | 类型 | 约束 |
|---|---|---|
| `square_footage` | int | `> 0` |
| `bedrooms` | int | `1 ≤ x ≤ 20` |
| `bathrooms` | float | `0.5 ≤ x ≤ 20` |
| `year_built` | int | `1800 ≤ x ≤ 当前年份`（动态计算） |
| `lot_size` | int | `> 0` |
| `distance_to_city_center` | float | `≥ 0`（英里） |
| `school_rating` | float | `0 ≤ x ≤ 10` |

注意：Task 1 的 README 与代码存在多处不一致（`/model-info` vs `/model`、`"ok"` vs `"Ok"` 等），**集成时一律以代码为准**。

## 规划中的架构与技术栈

计划采用 monorepo 布局（**尚未创建**）：

```
portal/         # Next.js（App Router + TypeScript + Tailwind CSS）
app1-backend/   # FastAPI（Python 3.12+）
app2-backend/   # Spring Boot 3.4.4 / Java 21
docker-compose.yml
```

- **App 1 后端**：FastAPI、Pydantic v2、httpx（async）、SQLModel + aiosqlite（SQLite 存储）、pydantic-settings、pytest；用 **uv** 管理依赖。
- **前端**：Next.js App Router、TypeScript、Tailwind CSS、react-hook-form + zod（校验规则与后端 Pydantic 约束保持同步）、recharts。
- **编排**：docker-compose，端口分配：ML 容器 8000、App 1 后端 8001、App 2 后端 8080、Portal 3000。
- **环境变量**：`ML_MODEL_URL` 默认 `http://localhost:8000`，compose 中使用服务名。

## App 1 后端的设计约定（实现时必须遵守）

以下约定来自 `app1-backend-analysis.md`，实现 App 1 后端时不得偏离：

- **API 端点**：`POST /api/estimates`（请求体为**数组契约**，与 ML 容器同构；单条=1 元素数组，对比=N 元素数组，表单与对比共用一个端点）、`GET /api/estimates`（limit/offset 分页）、`GET /api/estimates/{id}`、`GET /api/model-info`（代理 Task 1 的 `GET /model`）、`GET /api/health`（自身存活 + 探测 ML 容器）。
- **校验**：用 Pydantic v2 在 App 1 边界镜像 Task 1 的 7 字段约束（不要只透传 ML 容器的 422），让前端只消费一套错误格式。
- **统一错误格式**：
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [ {"field": "square_footage", "issue": "must be > 0"} ] } }
  ```
  状态码约定：422 = App 1 自身校验失败；502 = ML 容器返回非 2xx；503 = ML 容器不可达/超时；500 = 其他未预期错误。
- **ML 集成**：抽象 `ModelClient` 协议便于测试替换 stub；httpx 超时 connect 2s / read 10s；仅连接错误重试 1 次，不重试 4xx/5xx；转发为纯透传（`model_dump()` 列表原样 POST 给 `/predict`，零字段映射）。
- **存储**：SQLite + SQLModel，`estimates` 表字段为 `id (uuid)`、`created_at`、`features (JSON)`、`prediction (float)`、`batch_id (uuid，同一批请求共享，供对比视图分组)`。批量请求拆成 N 行原子化持久化。
- **预测值不做后处理**（例如不做 `max(0, x)`），保持忠实于模型；R²/RMSE 通过 `/api/model-info` 提供给前端展示置信度。
- **CORS**：允许 Next.js 开发源 `http://localhost:3000`。

## 构建与测试

**当前没有可运行的构建/测试命令**（尚无代码）。规划中的约定：

- 后端用 `uv` 初始化和同步依赖，uvicorn 启动，Dockerfile 基于 Python 3.12+。
- 测试用 pytest；`ModelClient` 替换为 stub，需覆盖：校验失败、ML 容器 4xx/5xx/超时、批量提交、历史分页。
- Phase 1（App 1 后端）完成后即可用 curl/Swagger 独立验证，不依赖前端。

## 开发流程约定

- 按 `dev-task-list.md` 的 Phase 0 → 1 → 2 → 3 → 4 → 5 顺序执行；完成一项勾掉对应 checkbox，保持该文件与实际进度同步。
- 项目文档和注释使用**中文**；代码标识符、API 契约、库名保持英文原样。
- 文档中标注 **【核实】** 的结论是已对照 Task 1 实际代码验证过的事实，不要基于 Task 1 的 README 推翻它们。
