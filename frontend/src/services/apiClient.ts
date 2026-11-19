import type { ApiResponse } from "../types/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? `API 요청 실패 (${response.status})`);
  }
  return payload;
}
