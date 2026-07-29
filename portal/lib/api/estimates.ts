// app1-backend 的 API 函数
// 默认走浏览器可访问地址；RSC 服务端调用时传入 APP1_API_URL_SERVER
import { APP1_API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api/client";
import type { PropertyFeatures } from "@/lib/schemas/property";
import type {
  EstimateBatchResponse,
  EstimateListResponse,
  EstimateRecord,
  ModelInfo,
} from "@/lib/types";

export function createEstimates(
  items: PropertyFeatures[],
  baseUrl: string = APP1_API_URL,
): Promise<EstimateBatchResponse> {
  return apiFetch<EstimateBatchResponse>(baseUrl, "/api/estimates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
}

export function listEstimates(
  limit: number,
  offset: number,
  baseUrl: string = APP1_API_URL,
): Promise<EstimateListResponse> {
  // 历史数据实时性优先，禁用缓存
  return apiFetch<EstimateListResponse>(
    baseUrl,
    `/api/estimates?limit=${limit}&offset=${offset}`,
    { cache: "no-store" },
  );
}

export function getEstimate(
  id: string,
  baseUrl: string = APP1_API_URL,
): Promise<EstimateRecord> {
  return apiFetch<EstimateRecord>(baseUrl, `/api/estimates/${id}`, {
    cache: "no-store",
  });
}

export function getModelInfo(
  baseUrl: string = APP1_API_URL,
): Promise<ModelInfo> {
  return apiFetch<ModelInfo>(baseUrl, "/api/model-info", {
    cache: "no-store",
  });
}
