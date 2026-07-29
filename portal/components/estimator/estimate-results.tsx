// 估算结果展示：表格 + 图表（供表单页与对比页复用）
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PredictionChart } from "@/components/estimator/prediction-chart";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { EstimateBatchResponse } from "@/lib/types";

const TH =
  "px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400";
const TD = "px-4 py-2 text-sm";

export function EstimateResults({ result }: { result: EstimateBatchResponse }) {
  const multiple = result.estimates.length > 1;
  const chartData = result.estimates.map((e, i) => ({
    name: multiple ? `Property ${i + 1}` : "Estimate",
    prediction: e.prediction,
  }));

  return (
    <div className="space-y-6" aria-live="polite">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">
          Estimated {multiple ? "values" : "value"}
        </h2>
        <PredictionChart data={chartData} />
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                {multiple ? <th className={TH}>#</th> : null}
                <th className={TH}>Sqft</th>
                <th className={TH}>Bed</th>
                <th className={TH}>Bath</th>
                <th className={TH}>Year</th>
                <th className={TH}>Estimate</th>
                <th className={TH}>
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {result.estimates.map((e, i) => (
                <tr
                  key={e.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  {multiple ? <td className={TD}>{i + 1}</td> : null}
                  <td className={TD}>{formatNumber(e.features.square_footage)}</td>
                  <td className={TD}>{e.features.bedrooms}</td>
                  <td className={TD}>{e.features.bathrooms}</td>
                  <td className={TD}>{e.features.year_built}</td>
                  <td className={`${TD} font-semibold text-indigo-700 dark:text-indigo-300`}>
                    {formatCurrency(e.prediction)}
                  </td>
                  <td className={`${TD} text-right`}>
                    <Link
                      href={`/estimator/history/${e.id}`}
                      className="text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-indigo-400"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Saved to history (batch {result.batch_id.slice(0, 8)}…).{" "}
        <Link
          href="/estimator/history"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          View all estimates
        </Link>
      </p>
    </div>
  );
}
