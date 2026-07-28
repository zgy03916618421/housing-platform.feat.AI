# portal

统一门户前端（Next.js App Router + TypeScript + Tailwind CSS v4）。

承载 App 1（Property Value Estimator，`/estimator`）与 App 2（Property Market Analysis，`/analysis`）两个应用的前端界面。

## 结构约定

- `app/` — App Router 路由；布局级状态：`loading.tsx`、`error.tsx`（`unstable_retry`）、`global-error.tsx`、`not-found.tsx`
- `components/layout/` — 共享导航与页脚（激活态用 `aria-current="page"`，含"跳转到主要内容"链接）
- `components/ui/` — 设计系统基础组件（Button、Card、Input、Label、Alert、Spinner），遵循 WCAG
- `lib/config.ts` — 后端服务地址（`NEXT_PUBLIC_APP1_API_URL` / `NEXT_PUBLIC_APP2_API_URL` 可覆盖）

## 本地开发

```bash
npm run dev   # http://localhost:3000
```

## 构建与检查

```bash
npm run build
npm run lint
```

## Docker

```bash
docker build -t portal .
# 或在仓库根目录：
docker compose up --build portal
```
