import { Skeleton } from "@/components/ui/skeleton";

/** Estimate history 段（/estimator/history/*）局部加载骨架 */
export default function Loading() {
  return (
    <div className="space-y-4">
      {/* 统计行占位 */}
      <Skeleton className="h-5 w-48" />

      {/* 表格占位 */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className="px-4 py-2 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, row) => (
              <tr
                key={row}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                {Array.from({ length: 7 }).map((__, col) => (
                  <td key={col} className="px-4 py-2">
                    <Skeleton className="h-4 w-16" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页占位 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
