# Task 2 开发任务列表

> 范围：Multi-Application Next.js Portal。重点细化 App 1 后端，其余为阶段级规划。
> 分析依据：`app1-backend-analysis.md`（已对照 Task 1 代码核实接口契约）。

---

## Phase 0 — 项目基础设施

- [x] 0.0 `git init` + 创建 `.gitignore`（Python/Node/Java/SQLite/IDE）+ 首次提交规划文档（git 操作逐次确认）
- [x] 0.1 初始化 monorepo 目录结构：`portal/`（Next.js）、`app1-backend/`（FastAPI）、`app2-backend/`（Spring Boot）
- [x] 0.2 编写 `docker-compose.yml`：编排 Task 1 ML 容器（端口 8000）、App 1 后端（8001）、App 2 后端（8080）、Portal（3000），配置服务间网络与环境变量（当前仅含 ml-model，其余服务随 Phase 进度加入）
- [x] 0.3 约定环境变量：`ML_MODEL_URL`（默认 `http://localhost:8000`，compose 中为服务名）等（见 `.env.example`）

## Phase 1 — App 1 后端（FastAPI）

- [x] 1.1 用 uv 初始化项目，添加依赖：fastapi、uvicorn、httpx、sqlmodel、aiosqlite、pydantic-settings、pytest
- [x] 1.2 定义 Pydantic schemas：镜像 Task 1 的 7 字段约束（`square_footage` gt=0、`bedrooms` 1–20、`bathrooms` 0.5–20、`year_built` 1800–当前年、`lot_size` gt=0、`distance_to_city_center` ≥0、`school_rating` 0–10），请求体为数组契约（≥1 元素）
- [x] 1.3 实现 `ModelClient` 抽象（协议类）+ httpx async 实现：connect 2s / read 10s 超时，连接错误重试 1 次，非 2xx → 502，不可达/超时 → 503
- [x] 1.4 实现 SQLite 存储层（SQLModel）：`estimates` 表（id、created_at、features JSON、prediction、batch_id）
- [x] 1.5 实现 `POST /api/estimates`：校验 → 转发 ML 容器 → 原子持久化 N 条（同批共享 batch_id）→ 返回带 id 的预测结果
- [x] 1.6 实现 `GET /api/estimates`（分页 limit/offset）与 `GET /api/estimates/{id}`
- [x] 1.7 实现 `GET /api/model-info`（代理 Task 1 `GET /model`）与 `GET /api/health`（自身存活 + 探测 ML 容器 `/health`）
- [x] 1.8 实现统一错误处理：exception handler 把 Pydantic 422、ML 容器错误、未预期异常包装为 `{ "error": { code, message, details } }` 格式
- [x] 1.9 配置 CORS：允许 Next.js 开发源（`http://localhost:3000`）
- [x] 1.10 编写 pytest 测试：ModelClient 替换为 stub，覆盖校验失败、ML 容器 4xx/5xx/超时、批量提交、历史分页（24 项全通过；另完成真实 ML 容器端到端冒烟）
- [x] 1.11 编写 Dockerfile（Python 3.12+，uv sync，uvicorn 启动）

## Phase 2 — Next.js Portal 骨架

- [x] 2.1 create-next-app（App Router + TypeScript + Tailwind CSS）（Next 16.2.12 / React 19 / Tailwind v4）
- [x] 2.2 共享 layout 与导航：App 1 / App 2 之间切换，一致的设计系统（SiteHeader/SiteFooter，激活态 aria-current，跳转主内容链接）
- [x] 2.3 布局级 loading / error 状态（loading.tsx、error.tsx（Next 16 的 unstable_retry）、global-error.tsx、not-found.tsx）
- [x] 2.4 基础 UI 组件库：按钮、卡片、表单控件（Button/Card/Input/Label/Alert/Spinner，遵循 WCAG 可访问性）

## Phase 3 — App 1 前端（Property Value Estimator）

- [x] 3.1 属性输入表单：react-hook-form + zod，7 字段，客户端校验规则与后端 Pydantic 约束同步
- [x] 3.2 结果展示：表格 + 图表（recharts），附模型 R²/RMSE（来自 `/api/model-info`，RSC 服务端加载）
- [x] 3.3 历史估算页：RSC 服务端分页列表（?page= 导航），单条详情（404 走 not-found 边界）
- [x] 3.4 对比视图：2–5 个属性 side-by-side（useFieldArray，复用 `POST /api/estimates` 数组契约）
- [x] 3.5 API client 封装 + 自定义 hooks（useEstimateSubmit）+ 统一错误/加载态

## Phase 4 — App 2（Property Market Analysis）

- [x] 4.1 Spring Boot 3.4.4 / Java 21 项目初始化
- [x] 4.2 REST 端点：市场分析、聚合统计（基于 housing 数据集）、缓存
- [x] 4.3 集成 ML 容器（what-if 分析）
- [x] 4.4 前端仪表盘：可视化、过滤器、what-if 工具、CSV/PDF 导出、可排序数据表格

## Phase 5 — 端到端验收

- [ ] 5.1 docker-compose 全链路启动验证：Portal → App 1 后端 → ML 容器
- [ ] 5.2 编写根 README：启动步骤、架构图、端口说明

---

**建议执行顺序**：Phase 0 → 1（App 1 后端可独立测试）→ 2 → 3 → 4 → 5。
Phase 1 完成后即可用 curl/Swagger 验证后端全部功能，不依赖前端。
