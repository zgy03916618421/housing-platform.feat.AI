// 模型指标卡片：展示 ML 模型的可信度（数据来自 /api/model-info）
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { ModelInfo } from "@/lib/types";

export function ModelInfoCard({ info }: { info: ModelInfo }) {
  const items = [
    { label: "Algorithm", value: info.algorithm },
    { label: "R² score", value: info.r2_score.toFixed(3) },
    { label: "RMSE", value: formatCurrency(info.rmse) },
  ];

  return (
    <Card className="py-4">
      <dl className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {item.label}
            </dt>
            <dd className="mt-1 text-lg font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
