import { Skeleton } from "@/components/ui/skeleton";

/** Market Analysis 段（/analysis/*）局部加载骨架 */
export default function Loading() {
  return (
    <div className="space-y-6">
      {/* 页标题占位 */}
      <Skeleton className="h-8 w-56" />

      {/* KPI 卡片占位 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>

      {/* 图表卡片占位 */}
      <div className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>

      {/* 第二个图表/数据卡片占位 */}
      <div className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
