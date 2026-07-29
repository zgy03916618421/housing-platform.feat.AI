"use client";

// What-if 工具：调整特征 → Java 后端 → ML 预测，并与数据集均价/同 bedroom 段均价对比
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { PropertyForm } from "@/components/estimator/property-form";
import { useEstimateSubmit } from "@/hooks/use-estimate-submit";
import { postWhatIf } from "@/lib/api/analysis";
import { formatCurrency } from "@/lib/format";
import type { PropertyFeatures } from "@/lib/schemas/property";
import type { OverviewStats, SegmentStat, WhatIfResponse } from "@/lib/types";

function pctDiff(value: number, baseline: number): string {
  const pct = ((value - baseline) / baseline) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

type WhatIfClientProps = {
  overview: OverviewStats | null;
  bedroomSegments: SegmentStat[] | null;
};

export function WhatIfClient({ overview, bedroomSegments }: WhatIfClientProps) {
  const { state, submit } = useEstimateSubmit<WhatIfResponse>(postWhatIf);
  // 记录最近一次提交的输入，用于定位同 bedroom 分段
  const [lastSubmitted, setLastSubmitted] = useState<PropertyFeatures | null>(
    null,
  );

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Scenario input</h2>
        <PropertyForm
          onSubmit={(values) => {
            setLastSubmitted(values);
            submit([values]);
          }}
          submitting={state.status === "submitting"}
        />
      </Card>

      {state.status === "error" ? (
        <Alert
          variant="error"
          title={state.error.message}
          description={
            state.error.details.length > 0
              ? state.error.details
                  .map((d) => (d.field ? `${d.field}: ${d.issue}` : d.issue))
                  .join("; ")
              : undefined
          }
        />
      ) : null}

      {state.status === "success" ? (
        <WhatIfResult
          prediction={state.result.predictions[0]}
          bedrooms={lastSubmitted?.bedrooms ?? null}
          overview={overview}
          bedroomSegments={bedroomSegments}
        />
      ) : null}
    </div>
  );
}

function WhatIfResult({
  prediction,
  bedrooms,
  overview,
  bedroomSegments,
}: {
  prediction: number;
  bedrooms: number | null;
  overview: OverviewStats | null;
  bedroomSegments: SegmentStat[] | null;
}) {
  // 与同 bedroom 分段均价对比（分段键形如 "3 bed"）
  const segment =
    bedrooms !== null
      ? bedroomSegments?.find((s) => s.segment === `${bedrooms} bed`)
      : undefined;

  return (
    <Card aria-live="polite">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Predicted value
      </p>
      <p className="mt-1 text-3xl font-bold text-indigo-700 dark:text-indigo-300">
        {formatCurrency(prediction)}
      </p>

      {overview ? (
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">
              vs. market average ({formatCurrency(overview.avgPrice)})
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {pctDiff(prediction, overview.avgPrice)}
            </dd>
          </div>
          {segment ? (
            <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                vs. {segment.segment} average ({formatCurrency(segment.avgPrice)}
                , n={segment.count})
              </dt>
              <dd className="mt-1 text-lg font-semibold">
                {pctDiff(prediction, segment.avgPrice)}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Market baseline unavailable (statistics could not be loaded).
        </p>
      )}
    </Card>
  );
}
