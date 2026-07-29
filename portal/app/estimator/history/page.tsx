// 历史估算列表（RSC）：服务端按页获取，分页通过 URL ?page= 导航（无客户端 JS 依赖）
import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { toApiError, type ApiError } from "@/lib/api/client";
import { listEstimates } from "@/lib/api/estimates";
import { APP1_API_URL_SERVER } from "@/lib/config";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EstimateListResponse } from "@/lib/types";

export const metadata: Metadata = {
  title: "Estimate history",
};

const PAGE_SIZE = 10;

const TH =
  "px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400";
const TD = "px-4 py-2 text-sm";

type HistoryPageProps = {
  // Next 16：searchParams 是 Promise，必须 await
  searchParams: Promise<{ page?: string }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const { page } = await searchParams;
  const current = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  let data: EstimateListResponse | null = null;
  let error: ApiError | null = null;
  try {
    data = await listEstimates(
      PAGE_SIZE,
      (current - 1) * PAGE_SIZE,
      APP1_API_URL_SERVER,
    );
  } catch (err) {
    error = toApiError(err);
  }

  if (error || !data) {
    return (
      <Alert
        variant="error"
        title="Could not load estimate history"
        description={error?.message ?? "An unexpected error occurred."}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  const pageLinkClass = (enabled: boolean) =>
    cn(
      "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
      enabled
        ? "bg-zinc-100 text-foreground hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        : "pointer-events-none bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600",
    );

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {data.total} estimate{data.total === 1 ? "" : "s"} in total, newest
        first.
      </p>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className={TH}>Date</th>
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
              {data.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    No estimates yet.{" "}
                    <Link
                      href="/estimator"
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Create your first estimate
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                data.items.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className={TD}>{formatDateTime(e.created_at)}</td>
                    <td className={TD}>
                      {formatNumber(e.features.square_footage)}
                    </td>
                    <td className={TD}>{e.features.bedrooms}</td>
                    <td className={TD}>{e.features.bathrooms}</td>
                    <td className={TD}>{e.features.year_built}</td>
                    <td
                      className={`${TD} font-semibold text-indigo-700 dark:text-indigo-300`}
                    >
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <nav
        aria-label="History pagination"
        className="flex items-center justify-between"
      >
        {current > 1 ? (
          <Link
            href={`/estimator/history?page=${current - 1}`}
            className={pageLinkClass(true)}
          >
            ← Previous
          </Link>
        ) : (
          <span aria-disabled="true" className={pageLinkClass(false)}>
            ← Previous
          </span>
        )}
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Page {current} of {totalPages}
        </span>
        {current < totalPages ? (
          <Link
            href={`/estimator/history?page=${current + 1}`}
            className={pageLinkClass(true)}
          >
            Next →
          </Link>
        ) : (
          <span aria-disabled="true" className={pageLinkClass(false)}>
            Next →
          </span>
        )}
      </nav>
    </div>
  );
}
