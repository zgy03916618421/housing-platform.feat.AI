// KPI 卡片行：总览统计（样本量、均价、中位数、平均面积）
import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { OverviewStats } from "@/lib/types";

export function KpiCards({ stats }: { stats: OverviewStats }) {
  const items = [
    { label: "Listings", value: formatNumber(stats.count) },
    { label: "Average price", value: formatCurrency(stats.avgPrice) },
    { label: "Median price", value: formatCurrency(stats.medianPrice) },
    {
      label: "Price range",
      value: `${formatCurrency(stats.minPrice)} – ${formatCurrency(stats.maxPrice)}`,
    },
    {
      label: "Avg. size",
      value: `${formatNumber(Math.round(stats.avgSquareFootage))} sqft`,
    },
    { label: "Avg. school rating", value: stats.avgSchoolRating.toFixed(1) },
  ];

  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {item.label}
          </dt>
          <dd className="mt-1 text-lg font-semibold">{item.value}</dd>
        </Card>
      ))}
    </dl>
  );
}
