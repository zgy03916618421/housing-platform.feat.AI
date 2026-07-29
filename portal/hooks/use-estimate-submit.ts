"use client";

// 共享提交 hook：表单页与对比页共用的估算提交流程（loading / success / error 状态机）
import { useCallback, useState } from "react";
import { toApiError, type ApiError } from "@/lib/api/client";
import { createEstimates } from "@/lib/api/estimates";
import type { PropertyFeatures } from "@/lib/schemas/property";
import type { EstimateBatchResponse } from "@/lib/types";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; result: EstimateBatchResponse }
  | { status: "error"; error: ApiError };

export function useEstimateSubmit() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const submit = useCallback(async (items: PropertyFeatures[]) => {
    setState({ status: "submitting" });
    try {
      const result = await createEstimates(items);
      setState({ status: "success", result });
    } catch (err) {
      setState({ status: "error", error: toApiError(err) });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
