export interface ChatHistoryTurn {
  role: "user" | "assistant";
  content: string;
}

export interface MatchedCorpusSourceItem {
  title: string;
  url: string;
  source: string;
  score: number;
  snippet: string;
  verification_status?: string;
  collected_at?: string | null;
}

export interface ChatAssistApiResponse {
  reply: string;
  suggested_routes: string[];
  follow_ups?: string[];
  confidence: number;
  matched_sources?: MatchedCorpusSourceItem[];
  expanded_queries?: string[];
  live_briefing_summary?: string | null;
  collected_at?: string | null;
  verification_status?: string;
  ollama_used?: boolean;
  ollama_model?: string | null;
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

async function postJson<T>(path: string, payload: unknown, timeoutMs = 10000): Promise<T | null> {
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
  contextPath: string,
  deepWebSearch = false,
  history: ChatHistoryTurn[] = []
): Promise<ChatAssistApiResponse | null> {
  return postJson<ChatAssistApiResponse>("/api/v1/ai/chat-assist", {
    message,
    history: history.slice(-8),
    context_path: contextPath,
    enable_live_web_fallback: true,
    deep_web_search: deepWebSearch,
    use_ollama: true
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