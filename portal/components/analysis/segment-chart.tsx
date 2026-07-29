"use client";

// 分段均价图：维度切换器（= 分段筛选器）+ 柱状图，切换后浏览器侧重新取数
import { useState, useTransition } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { getSegments } from "@/lib/api/analysis";
import { toApiError, type ApiError } from "@/lib/api/client";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SegmentDimension, SegmentStat } from "@/lib/types";

const DIMENSIONS: Array<{ value: SegmentDimension; label: string }> = [
  { value: "bedrooms", label: "Bedrooms" },
  { value: "decade", label: "Decade built" },
  { value: "school_band", label: "School rating" },
  { value: "distance_band", label: "Distance to center" },
];

type SegmentChartProps = {
  initialBy: SegmentDimension;
  initialData: SegmentStat[];
};

export function SegmentChart({ initialBy, initialData }: SegmentChartProps) {
  const [by, setBy] = useState<SegmentDimension>(initialBy);
  const [data, setData] = useState<SegmentStat[]>(initialData);
  const [error, setError] = useState<ApiError | null>(null);
  const [isPending, startTransition] = useTransition();

  function switchDimension(next: SegmentDimension) {
    if (next === by) return;
    setBy(next);
    startTransition(async () => {
      try {
        setData(await getSegments(next));
        setError(null);
      } catch (err) {
        setError(toApiError(err));
      }
    });
  }

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Segment dimension"
        className="flex flex-wrap gap-2"
      >
        {DIMENSIONS.map((d) => (
          <button
            key={d.value}
            type="button"
            aria-pressed={by === d.value}
            onClick={() => switchDimension(d.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
              by === d.value
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {error ? (
        <Alert variant="error" title="Could not load segments" description={error.message} />
      ) : isPending ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner label="Loading segments" />
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="segment" tickLine={false} />
              <YAxis
                width={72}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCompactCurrency(Number(v))}
              />
              <Tooltip
                formatter={(value, _name, item) => [
                  `${formatCurrency(Number(value))} (n=${(item.payload as SegmentStat).count})`,
                  "Avg. price",
                ]}
              />
              <Bar dataKey="avgPrice" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Average price per segment; hover a bar to see its sample size (n).
      </p>
    </div>
  );
}
