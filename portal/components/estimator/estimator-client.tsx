"use client";

// 估算页客户端主体：表单 → 提交 → 结果（含统一错误展示）
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EstimateResults } from "@/components/estimator/estimate-results";
import { PropertyForm } from "@/components/estimator/property-form";
import { useEstimateSubmit } from "@/hooks/use-estimate-submit";
import { createEstimates } from "@/lib/api/estimates";

export function EstimatorClient() {
  const { state, submit } = useEstimateSubmit(createEstimates);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Property details</h2>
        <PropertyForm
          onSubmit={(values) => submit([values])}
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
        <EstimateResults result={state.result} />
      ) : null}
    </div>
  );
}
