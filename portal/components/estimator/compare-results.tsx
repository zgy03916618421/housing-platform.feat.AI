// 对比结果：特征行 × 属性列 的 side-by-side 表格 + 预测柱状图
import { Card } from "@/components/ui/card";
import { PredictionChart } from "@/components/estimator/prediction-chart";
import { formatCurrency, formatNumber } from "@/lib/format";
import { PROPERTY_FIELDS } from "@/lib/schemas/property";
import type { EstimateBatchResponse } from "@/lib/types";

export function CompareResults({ result }: { result: EstimateBatchResponse }) {
  const chartData = result.estimates.map((e, i) => ({
    name: `Property ${i + 1}`,
    prediction: e.prediction,
  }));

  // 找出最高预测值用于高亮
  const maxPrediction = Math.max(...result.estimates.map((e) => e.prediction));

  return (
    <div className="space-y-6" aria-live="polite">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Estimated values</h2>
        <PredictionChart data={chartData} />
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Feature
                </th>
                {result.estimates.map((e, i) => (
                  <th
                    key={e.id}
                    scope="col"
                    className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                  >
                    Property {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROPERTY_FIELDS.map((field) => (
                <tr
                  key={field.name}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <th
                    scope="row"
                    className="px-4 py-2 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    {field.label}
                    {field.hint ? ` (${field.hint})` : ""}
                  </th>
                  {result.estimates.map((e) => (
                    <td key={e.id} className="px-4 py-2 text-right text-sm">
                      {field.step === "1"
                        ? formatNumber(e.features[field.name])
                        : e.features[field.name]}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-indigo-50 dark:bg-indigo-950">
                <th
                  scope="row"
                  className="px-4 py-2.5 text-left text-sm font-semibold"
                >
                  Estimate
                </th>
                {result.estimates.map((e) => (
                  <td
                    key={e.id}
                    className={`px-4 py-2.5 text-right text-sm font-bold text-indigo-700 dark:text-indigo-300 ${
                      e.prediction === maxPrediction
                        ? "underline decoration-2 underline-offset-4"
                        : ""
                    }`}
                  >
                    {formatCurrency(e.prediction)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Highest estimate is underlined. Saved to history as batch{" "}
        {result.batch_id.slice(0, 8)}….
      </p>
    </div>
  );
}
