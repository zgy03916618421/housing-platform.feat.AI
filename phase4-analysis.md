# Phase 4 分析 — App 2：Property Market Analysis（Java 后端）

> 仅分析，不含实施。事实已对照 Task 1 代码与本机环境核实。

---

## 1. 任务拆解

**后端（Java，任务书 3b 四条）：**

| 要求 | 实质含义 | 工作量 |
|---|---|---|
| i. REST API for market analysis | 统计/明细数据端点 | 中 |
| ii. Aggregate statistics from the housing dataset | 从 CSV 计算聚合（总量/均值/分段） | 中 |
| iii. Integrate with ML model container | Java 作为 HTTP 客户端调 `/predict`（what-if） | 小（契约已知） |
| iv. Caching | Spring Cache + Caffeine，任务书点名必须展示 | 小 |

**前端（任务书 3a 五条）：**

| 要求 | 对应设计 | 可复用资产 |
|---|---|---|
| i. 交互式仪表盘 | KPI 卡片 + 多图表 | recharts、Card |
| ii. 分段筛选器 | 维度切换（bedrooms/年代/评分档） | 子导航模式 |
| iii. what-if 工具 | 表单调 Java 后端 → ML | `PropertyForm`、`useEstimateSubmit` 模式 |
| iv. CSV/PDF 导出 | 前端生成 | 无（新写） |
| v. 可排序/筛选数据表 | 客户端排序状态 | 历史页表格样式 |

---

## 2. 已核实的关键事实

1. **数据集**：`House Price Dataset.csv`（**带空格的文件名**，与 Task 1 README 写的 `data/housing.csv` 不符——这是 Task 1 README/代码的第四处不一致）。**仅 50 行**，9 列：`id, square_footage, bedrooms, bathrooms, year_built, lot_size, distance_to_city_center, school_rating, price`。文件开头有 **BOM**（Java 解析需处理，否则首列名变成 `\uFEFFid`）。
2. **ML 契约**（沿用 Phase 1 核实结论）：`POST /predict` 数组契约、`GET /model`、`GET /health`。what-if 直接复用。
3. **本机 Java 环境不满足约束**：仅 Temurin **18**，无 Maven/Gradle。任务要求 Java 21。**这是 Phase 4 的阻塞性前置决策**（见 §5）。
4. **前端一致性红利**：如果 Java 后端沿用 App 1 的统一错误格式 `{ error: { code, message, details } }`，portal 的 `apiFetch`/`ApiError`/Alert 链路**零改动复用**。强烈建议保持一致。

---

## 3. 后端设计要点（Spring Boot 3.4.4 / Java 21）

**关键简化：无数据库。** 数据集是 50 行静态 CSV，启动时加载进内存（`@PostConstruct` 解析为 `List<Property>`）即可，引入 JPA 属于过度设计。这也让"缓存"的演示更纯粹（见下）。

**分层**（与 Task 1 的 router/service/core 风格对齐）：`controller → service → dataset(内存) / modelClient`。

**端点草案**（统一前缀 `/api`）：

| 方法 | 路径 | 说明 | 缓存 |
|---|---|---|---|
| GET | `/api/stats/overview` | 总览：样本数、均价/中位数/极值、平均面积等 | ✅ |
| GET | `/api/stats/segments?by=bedrooms` | 分段聚合：每段的数量/均价/平均面积。维度：`bedrooms`、`decade`（year_built）、`school_band`、`distance_band` | ✅ 按参数 |
| GET | `/api/properties?sort=price&order=desc&bedrooms=3` | 明细数据：排序 + 等值筛选（表格页用；50 行不分页，全量返回） | ✅ 按参数 |
| POST | `/api/whatif` | 数组契约透传 ML `/predict`（同 App 1） | ❌（实时推理，缓存无意义且容易误导） |
| GET | `/api/health` | 自身 + ML 可达性 | ❌ |

- **聚合实现**：Java Stream `groupingBy` + `Collectors.averagingDouble`，维度参数用枚举校验，非法维度 → 400。
- **缓存**：`@EnableCaching` + Caffeine；`overview`/`segments`/`properties` 按参数缓存（数据集静态，永不过期也可，但演示 TTL=10min 更像"优化"）。`@CacheEvict` 用不上（无写操作），答辩时说明即可。
- **HTTP 客户端**：`RestClient`（Spring Boot 3.2+ 标配，同步即可——Spring MVC 本来就是线程池模型，不需要 WebFlux）。
- **错误映射**：与 App 1 相同语义——400 参数错误 / 502 ML 返回错误 / 503 ML 不可达 / 500 其他，`@RestControllerAdvice` 统一包装。
- **CORS**：允许 `http://localhost:3000`。
- **数据集获取**：复制 CSV 到 `app2-backend/src/main/resources/data/`（自包含；Task 1 在仓库外，不能依赖其路径）。解析时跳过 BOM。
- **测试**：`@WebMvcTest` + `MockMvc` 覆盖端点；ModelClient 用 stub/`MockRestServiceServer`；一个缓存命中行为测试。

---

## 4. 前端设计要点

- **`/analysis` 布局 + 子导航**（复用 App 1 模式）：`Dashboard` / `What-if` / `Data`。
- **Dashboard（RSC 初始加载 overview + 默认分段）**：KPI 卡片（样本数/均价/中位数/平均面积）+ 三个图：分段均价柱状图（维度切换器=筛选器要求 ii）、价格分布直方图、面积-价格散点图。筛选维度切换后客户端重新取数（client component）。
- **What-if**：复用 `PropertyForm` 提交到 Java `/api/whatif`；**亮点设计**：把预测值与数据集均价/同 bedroom 分段均价对比展示（"比同段均价高 12%"），把 stats 与 ML 两个后端能力串起来。
- **Data 页**：50 行全量表格，点击表头排序（升/降/默认三态，`aria-sort`）、bedrooms 筛选下拉；**导出**：CSV 用 Blob 纯前端生成（数据已在手）；PDF 建议 **jsPDF + autotable**（真正的文件下载；`window.print()` 不算交付"PDF 导出"）。
- 新依赖仅 `jspdf` + `jspdf-autotable`，其余全部复用。

---

## 5. 阻塞性决策：JDK 21 环境

| 方案 | 说明 | 取舍 |
|---|---|---|
| A. 安装 JDK 21（sdkman/Homebrew） | 本地 `mvnw spring-boot:run`，dev 体验好，IDE 可识别 | 改系统环境，需你确认；面试展示本地热重载方便 |
| B. Docker-only 开发 | 多阶段 `maven:3.9-eclipse-temurin-21` 镜像构建运行，本机零安装 | 每次改动都要 rebuild，调试慢；不污染环境 |
| C. A+B 混合 | Docker 验证为主，需要快速迭代时临时容器挂卷跑 `mvnw` | 折中 |

**我的倾向：A**（作业后续调试/演示都受益），但 B 完全可行。Maven wrapper（`mvnw`）无论哪种方案都会生成并入库，评审者无需装 Maven。

---

## 6. 风险清单

- **R1**：JDK 21 缺失（§5，开工前必须先定）。
- **R2**：BOM + 带空格文件名，CSV 解析的第一个坑（已预判，低成本）。
- **R3**：**只有 50 行数据**——分段后每段样本个位数，"市场分析"的统计意义有限。应对：图表上显示每段样本量（`n=7`），答辩时主动说明这是演示数据。这不是缺陷但会被问。
- **R4**：jsPDF 与 React 19/Next 16 兼容性未验证（广泛使用，风险低，但要在 Phase 4 早期验证导出按钮能跑通）。
- **R5**：Java 镜像构建慢（Maven 依赖下载量大），compose 全链路首次 `up --build` 时间会明显拉长——Phase 5 验收时要预留时间。
- **R6**：Spring Boot 3.4.4 相对旧认知的小版本差异（RestClient、Caffeine 配置），以官方文档为准。

---

## 7. 建议执行顺序（细化 dev-task-list 的 4.1–4.4）

1. 定 JDK 方案 → 生成 Spring Boot 脚手架（initializr，Maven + wrapper，Java 21，依赖：web / cache / caffeine / validation / actuator（可选））
2. CSV 复制入库 + 内存 Dataset 加载器（含 BOM 处理）+ stats 端点
3. ModelClient（RestClient）+ `/api/whatif` + Caffeine 缓存 + 统一错误 advice + CORS
4. MockMvc 测试
5. Dockerfile（多阶段）+ compose 服务（8080）
6. 前端：Dashboard → What-if → Data（排序/筛选/导出）
7. 端到端冒烟后提交

工作量评估：后端 ≈ App 1 后端的 1.5 倍（聚合+缓存是新增工作量，透传部分已有成熟模式）；前端 ≈ App 1 前端的 0.8 倍（大量复用）。
