# app2-backend

App 2（Property Market Analysis）的 Spring Boot 后端（Java 21 / Spring Boot 3.4.4）。

职责：市场统计 REST API、housing 数据集聚合统计（内存数据集，50 行静态 CSV）、ML 容器集成（what-if）、Caffeine 缓存。设计依据见仓库根目录 `phase4-analysis.md`。

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/stats/overview` | 总览聚合：样本数、均价/中位数/极值、平均面积等（缓存） |
| `GET` | `/api/stats/segments?by=bedrooms` | 分段聚合：`bedrooms` / `decade` / `school_band` / `distance_band`（按参数缓存） |
| `GET` | `/api/properties?sort=price&order=desc&bedrooms=3` | 明细数据：排序（白名单字段）+ bedrooms 筛选（缓存） |
| `POST` | `/api/whatif` | what-if 分析：数组契约透传 ML 容器 `POST /predict`（不缓存，实时推理） |
| `GET` | `/api/health` | 自身存活 + ML 容器可达性 |

错误响应统一为 `{ "error": { "code", "message", "details" } }`（与 app1-backend 一致）：400 参数/校验错误 / 502 ML 容器返回错误 / 503 ML 容器不可达或超时 / 500 未预期错误。

## 本地开发

需要 JDK 21。无需安装 Maven（使用随库 wrapper）：

```bash
./mvnw spring-boot:run   # http://localhost:8080
```

前提：Task 1 ML 容器已在 `http://localhost:8000` 运行（或用 `APP_MLMODELURL` 环境变量覆盖）。

## 测试

```bash
./mvnw verify
```

`@WebMvcTest`/`@SpringBootTest` + MockMvc；ModelClient 用 Mockito stub，无需起真实 ML 容器；含缓存命中行为测试。

## Docker

```bash
docker build -t app2-backend .
# 或在仓库根目录：
docker compose up --build app2-backend
```
