export interface ChatAssistApiResponse {
  reply: string;
  suggested_routes: string[];
  confidence: number;
  caution_note: string;
}

export interface WebSearchResultApiItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface WebSearchApiResponse {
  query: string;
  collected_at: string;
  verification_status: string;
  briefing_summary: string;
  highlights: string[];
  results: WebSearchResultApiItem[];
  disclaimer: string;
}

const DEFAULT_AI_BASE_URL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_AI_SERVICE_URL ??
  "http://127.0.0.1:8000";

async function postJson<T>(path: string, payload: unknown, timeoutMs = 6000): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${DEFAULT_AI_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function requestAiChatAssist(
  message: string,
  contextPath: string
): Promise<ChatAssistApiResponse | null> {
  return postJson<ChatAssistApiResponse>("/api/v1/ai/chat-assist", {
    message,
    context_path: contextPath
  });
}

export async function requestAiWebSearch(
  query: string,
  maxResults = 6
): Promise<WebSearchApiResponse | null> {
  return postJson<WebSearchApiResponse>("/api/v1/ai/web-search", {
    query,
    max_results: maxResults
  });
}