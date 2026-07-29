// 单条估算详情（RSC）：404 走 not-found 边界，其余错误用 Alert 展示
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { toApiError } from "@/lib/api/client";
import { getEstimate } from "@/lib/api/estimates";
import { APP1_API_URL_SERVER } from "@/lib/config";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { PROPERTY_FIELDS } from "@/lib/schemas/property";
import type { EstimateRecord } from "@/lib/types";

export const metadata: Metadata = {
  title: "Estimate detail",
};

type EstimateDetailPageProps = {
  // Next 16：params 是 Promise，必须 await
  params: Promise<{ id: string }>;
};

export default async function EstimateDetailPage({
  params,
}: EstimateDetailPageProps) {
  const { id } = await params;

  let estimate: EstimateRecord;
  try {
    estimate = await getEstimate(id, APP1_API_URL_SERVER);
  } catch (err) {
    const apiError = toApiError(err);
    if (apiError.status === 404) {
      notFound(); // 交给 not-found.tsx 边界
    }
    return (
      <Alert
        variant="error"
        title="Could not load this estimate"
        description={apiError.message}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Estimated value
        </p>
        <p className="mt-1 text-3xl font-bold text-indigo-700 dark:text-indigo-300">
          {formatCurrency(estimate.prediction)}
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Created {formatDateTime(estimate.created_at)} · Batch{" "}
          {estimate.batch_id.slice(0, 8)}…
        </p>
      </Card>

      <Card className="p-0">
        <table className="w-full border-collapse">
          <tbody>
            {PROPERTY_FIELDS.map((field) => (
              <tr
                key={field.name}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <th
                  scope="row"
                  className="w-1/2 px-4 py-2.5 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400"
                >
                  {field.label}
                  {field.hint ? ` (${field.hint})` : ""}
                </th>
                <td className="px-4 py-2.5 text-sm">
                  {estimate.features[field.name]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Link
        href="/estimator/history"
        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-indigo-400"
      >
        ← Back to history
      </Link>
    </div>
  );
}
