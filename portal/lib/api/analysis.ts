// app2-backend（Spring Boot）的 API 函数
// 默认走浏览器可访问地址；RSC 服务端调用时传入 APP2_API_URL_SERVER
import { APP2_API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api/client";
import type { PropertyFeatures } from "@/lib/schemas/property";
import type {
  DatasetProperty,
  OverviewStats,
  SegmentDimension,
  SegmentStat,
  WhatIfResponse,
} from "@/lib/types";

export function getOverview(
  baseUrl: string = APP2_API_URL,
): Promise<OverviewStats> {
  return apiFetch<OverviewStats>(baseUrl, "/api/stats/overview", {
    cache: "no-store",
  });
}

export function getSegments(
  by: SegmentDimension,
  baseUrl: string = APP2_API_URL,
): Promise<SegmentStat[]> {
  return apiFetch<SegmentStat[]>(baseUrl, `/api/stats/segments?by=${by}`, {
    cache: "no-store",
  });
}

export function getProperties(
  baseUrl: string = APP2_API_URL,
): Promise<DatasetProperty[]> {
  return apiFetch<DatasetProperty[]>(baseUrl, "/api/properties", {
    cache: "no-store",
  });
}

export function postWhatIf(
  items: PropertyFeatures[],
  baseUrl: string = APP2_API_URL,
): Promise<WhatIfResponse> {
  return apiFetch<WhatIfResponse>(baseUrl, "/api/whatif", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
}
