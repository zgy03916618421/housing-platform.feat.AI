"use client";

// 共享提交 hook：估算/what-if 提交流程（loading / success / error 状态机）
// 泛型化：App 1（createEstimates）与 App 2（postWhatIf）复用同一状态机，注入不同的提交函数
import { useCallback, useState } from "react";
import { toApiError, type ApiError } from "@/lib/api/client";
import type { PropertyFeatures } from "@/lib/schemas/property";

type SubmitState<T> =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; result: T }
  | { status: "error"; error: ApiError };

export function useEstimateSubmit<T>(
  submitFn: (items: PropertyFeatures[]) => Promise<T>,
) {
  const [state, setState] = useState<SubmitState<T>>({ status: "idle" });

  const submit = useCallback(
    async (items: PropertyFeatures[]) => {
      setState({ status: "submitting" });
      try {
        const result = await submitFn(items);
        setState({ status: "success", result });
      } catch (err) {
        setState({ status: "error", error: toApiError(err) });
      }
    },
    [submitFn],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
