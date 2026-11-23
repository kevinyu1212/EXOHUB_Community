export interface ChatAssistApiResponse {
  reply: string;
  suggested_routes: string[];
  confidence: number;
  caution_note: string;
}

const DEFAULT_AI_BASE_URL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_AI_SERVICE_URL ??
  "http://127.0.0.1:8000";

export async function requestAiChatAssist(
  message: string,
  contextPath: string
): Promise<ChatAssistApiResponse | null> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 1800);
    const res = await fetch(`${DEFAULT_AI_BASE_URL}/api/v1/ai/chat-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context_path: contextPath }),
      signal: controller.signal
    });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as ChatAssistApiResponse;
  } catch {
    return null;
  }
}