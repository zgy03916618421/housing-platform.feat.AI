# App 1 — Property Value Estimator 后端任务分析 v2（已对照 Task 1 实际代码核实）

> 接口信息来源：`/Users/byter/Documents/Work/python/interview-task/`（README + 实际代码）。
> v1 中的假设 A1–A3 已全部核实/修正，修正处用 **【核实】** 标注。

---

## 0. Task 1 已核实的接口契约（以代码为准，README 有出入）

| 端点 | 请求 | 响应 | 备注 |
|---|---|---|---|
| `POST /predict` | JSON **数组**（≥1 个特征对象） | `{"predictions": [float, ...]}` | 单条预测也传 1 元素数组；**原生支持批量** |
| `GET /model` | — | `{"algorithm", "r2_score", "rmse", "coefficients", "intercept"}` | **【核实】** 实际路径是 `/model`，README 写的 `/model-info` 已过时 |
| `GET /health` | — | `{"status": "Ok"}` | 注意返回的是大写 `"Ok"`，README 写的 `"ok"` |

**特征集（7 个字段，全部为数值型，无类别特征）**——来自 `app/schemas/request.py`，约束为 Task 1 服务端实际执行的校验：

| 字段 | 类型 | 约束 |
|---|---|---|
| `square_footage` | int | `> 0` |
| `bedrooms` | int | `1 ≤ x ≤ 20` |
| `bathrooms` | float | `0.5 ≤ x ≤ 20` |
| `year_built` | int | `1800 ≤ x ≤ 当前年份` |
| `lot_size` | int | `> 0` |
| `distance_to_city_center` | float | `≥ 0`（单位：英里） |
| `school_rating` | float | `0 ≤ x ≤ 10` |

**【核实】v1 假设 A2（Ames Housing，30+ 特征含类别字段）不成立。** 实际是 7 个纯数值特征，这对后端设计是重大简化：
- 无类别编码/枚举校验问题（A3 自动解决）；
- 表单字段、校验规则、对比视图列全部确定为这 7 个字段；
- Task 1 的 `PredictorService` 直接 `pd.DataFrame(model_dump())` 后调用 sklearn，无任何转换层——App 1 后端**纯透传**即可。

**端口**：Task 1 容器默认 `8000`。App 1 后端应使用不同端口（如 `8001`），`ML_MODEL_URL` 默认 `http://localhost:8000`。

---

## 1. 任务拆解（任务书 2b 的三项要求）— 不变

| 要求 | 实质含义 | 工作量评估 |
|---|---|---|
| i. Handle form submissions | 接收前端表单提交，转发给 ML 容器，返回预测结果 | 核心路径，小 |
| ii. Integrate with regression model container | 后端作为 HTTP 客户端调用 ML 容器，处理网络层问题 | 中等，最易出 bug |
| iii. Data validation and error handling | 服务端二次校验，统一错误格式 | 中等，决定 API 质量 |

**关键洞察（不变）**：前端 history / comparison 需求隐含后端**存储职责**。

---

## 2. 建议的 API 端点设计（已按批量契约修正）

| 方法 | 路径 | 用途 | 对应前端需求 |
|---|---|---|---|
| `POST` | `/api/estimates` | 提交单个属性 → 转发 `/predict`（1 元素数组）→ 持久化 → 返回预测 | 表单提交 (1a-i) |
| `GET` | `/api/estimates?limit=&offset=` | 历史估算列表（分页） | 历史功能 (1a-iv) |
| `GET` | `/api/estimates/{id}` | 单条历史详情 | 历史详情/复现 |
| `GET` | `/api/model-info` | 代理 Task 1 的 `GET /model`，向前端暴露 R²/RMSE 等指标 | 结果页/仪表盘展示模型可信度（加分项） |
| `GET` | `/api/health` | 自身存活 + 探测 ML 容器 `/health` | 布局级错误处理 (1a-d) |

**compare 的取舍 ——【核实后结论改变】**：Task 1 的 `/predict` 原生接受数组，因此对比视图**不需要**专门的批量端点，也不需要前端循环调用。推荐方案：
- `POST /api/estimates` 的请求体直接设计为**数组**（与 ML 容器契约同构），单条估算就是 1 元素数组，对比就是 N 元素数组；
- 后端一次转发给 ML 容器，一次原子化持久化 N 条记录，响应里每条带各自 id；
- 前端表单提交和对比视图共用同一个端点，逻辑最简。

这比 v1 的"单条端点 + 可选批量端点"更简单，且与 ML 容器契约天然对齐。

---

## 3. 数据验证设计（要求 iii）— 按实际字段修正

App 1 后端用 Pydantic v2 **镜像 Task 1 的 7 字段约束**（`Field(gt=0)`、`Field(ge=1, le=20)` 等，见 §0 表）：

- **为什么要重复校验而不是依赖 ML 容器**：让 422 发生在 App 1 边界，前端只需消费 App 1 的统一错误格式；若透传 ML 容器的 422，错误格式是 FastAPI 默认的 `{"detail": [...]}`，与 App 1 自身校验错误格式不一致，前端要处理两套。
- **比 Task 1 多做的**：统一错误包装（见下）；`year_built` 上限用当前年份动态计算（Task 1 也是这么做的，直接镜像即可）。
- 无需类别枚举校验（特征全数值）。

**错误响应统一格式**：
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [ {"field": "square_footage", "issue": "must be > 0"} ] } }
```
- 422 → App 1 自身校验失败
- 502 → ML 容器返回非 2xx（透传其 message 便于调试）
- 503 → ML 容器不可达/超时
- 500 → 其他未预期错误

---

## 4. 与 ML 容器集成（要求 ii）— 不变，补充细节

- `httpx` async client；超时 connect 2s / read 10s。
- 仅连接错误重试 1 次；不重试 4xx/5xx。
- 错误映射：`ConnectError/TimeoutException` → 503；非 2xx → 502。
- 抽象 `ModelClient` 协议便于测试替换 stub。
- 环境变量 `ML_MODEL_URL`，默认 `http://localhost:8000`；docker-compose 部署时用服务名。
- **【核实补充】** 数组契约意味着转发逻辑零转换：App 1 请求体验证通过后 `model_dump()` 列表原样 POST 给 `/predict`，无需字段映射。

---

## 5. 存储设计 — 不变

SQLite + SQLModel/SQLAlchemy（推荐）。表结构：`id (uuid)`、`created_at`、`features (JSON)`、`prediction (float)`。
批量请求拆成 N 行存储（每行一个属性），但可记录同一批的 `batch_id (uuid, 可选)` 以便历史页按"一次对比"分组展示——这是对 v1 的小增强，成本低、对 comparison 视图有用。

---

## 6. 技术栈 — 不变

Python 3.12+（约束满足；Task 1 用 3.13，App 1 可用 3.12+ 任意版本）、FastAPI、Pydantic v2、httpx、SQLModel + aiosqlite、pydantic-settings。

---

## 7. 剩余风险与开放问题（大幅收敛）

1. ~~接口契约~~ ✅ 已核实（§0）。
2. ~~预处理归属~~ ✅ 已解决——无类别特征，纯透传。
3. ~~字段全集~~ ✅ 已核实——7 个数值字段。
4. ~~模型元信息端点~~ ✅ 已解决——`GET /model` 存在，建议 App 1 代理之。
5. **新发现**：README 与代码存在三处不一致（`/model-info` vs `/model`、`"ok"` vs `"Ok"`、目录结构 `endpoints/` vs `entrypoints/`、`model_loader` vs `model_load`）。**集成时以代码为准**；若 Task 1 后续被重构（README "Future Improvements" 提到 preprocessing pipeline、model versioning），App 1 的 `ModelClient` 抽象层可以隔离变化。
6. **回归值合理性**：`LinearRegression` 可能输出负价格（极端输入下）。App 1 后端是否对预测值做后处理（如 `max(0, x)`）？建议**不做**——保持忠实于模型，但可在响应中附带模型 R²/RMSE 供前端提示置信度。

---

## 8. 结论

对照 Task 1 实际代码后，App 1 后端比 v1 预估的**更简单**：
- 7 个纯数值字段、约束现成可镜像 → 校验层工作量小；
- `/predict` 原生批量 → 表单与对比共用一个端点，无需批量转发编排；
- 无需特征转换层 → 集成是纯透传 + 错误映射。

核心工作量集中在：统一错误格式、历史存储（SQLite）、`ModelClient` 的容错（超时/重试/错误映射）、以及 docker-compose 中的网络配置。如需要，下一步可产出可直接动工的实现计划（目录结构 + 逐文件清单）。
