import Link from "next/link";
import { Card } from "@/components/ui/card";

const APPS = [
  {
    href: "/estimator",
    name: "房产价值估算",
    description:
      "输入属性特征（面积、卧室、建造年份等），由 ML 回归模型给出估价；支持历史估算与多属性对比。",
    tag: "App 1 · FastAPI",
  },
  {
    href: "/analysis",
    name: "房产市场分析",
    description:
      "市场仪表盘、分段筛选、what-if 情景分析与数据导出。",
    tag: "App 2 · Spring Boot",
  },
] as const;

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">房产门户</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          两个独立的应用共享同一个 ML 房价模型。选择一个应用开始。
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {APPS.map((app) => (
          <Link
            key={app.href}
            href={app.href}
            className="group rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
          >
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {app.tag}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{app.name}</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {app.description}
              </p>
              <p className="mt-4 text-sm font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
                进入应用 →
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
