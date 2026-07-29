// 统一 fetch 封装：把后端的 { error: { code, message, details } } 转成 ApiError
export type ApiErrorDetail = { field: string | null; issue: string };

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  return new ApiError(
    0,
    "UNKNOWN_ERROR",
    err instanceof Error ? err.message : "An unexpected error occurred",
  );
}

export async function apiFetch<T>(
  baseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, init);
  } catch {
    // 网络层失败（后端未启动 / CORS / DNS）
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      `Cannot reach the backend at ${baseUrl}. Is it running?`,
    );
  }

  if (!res.ok) {
    let code = "HTTP_ERROR";
    let message = `Request failed (HTTP ${res.status})`;
    let details: ApiErrorDetail[] = [];
    try {
      const body = await res.json();
      if (body?.error) {
        code = body.error.code ?? code;
        message = body.error.message ?? message;
        details = body.error.details ?? [];
      }
    } catch {
      // 非 JSON 错误体：保留默认 message
    }
    throw new ApiError(res.status, code, message, details);
  }

  return res.json() as Promise<T>;
}
