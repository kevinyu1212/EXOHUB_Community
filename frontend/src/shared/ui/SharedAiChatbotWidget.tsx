import React, { useState } from "react";
import { generateLocalChatReply } from "../ai/aiAlgorithms";
import { requestAiChatAssist } from "../ai/aiServiceClient";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  routes?: Array<{ path: string; label: string }>;
}

const ROUTE_LABELS: Record<string, string> = {
  "/": "홈",
  "/search": "통합 검색",
  "/taxa": "생물 도감",
  "/price": "가격 비교",
  "/market": "마켓",
  "/care": "사육 관리",
  "/collection": "표본·박제 컬렉션",
  "/community": "커뮤니티",
  "/ai-lab": "AI LAB"
};

export const SharedAiChatbotWidget: React.FC<{
  activePath: string;
  onNavigate: (path: string) => void;
}> = ({ activePath, onNavigate }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "EXOHUB AI 어시스턴트입니다. 생물 도감, 시세/가격 비교, 사육·수조 관리, 표본·박제 컬렉션 이동과 탐색을 도와드려요. (종 동정·질병·법적 허용 여부는 전문가 검수 필요)"
    }
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    const fallback = generateLocalChatReply(trimmed, activePath);
    const remote = await requestAiChatAssist(trimmed, activePath);

    const botText = remote
      ? `${remote.reply}\n\n[${remote.caution_note}]`
      : fallback.reply;

    const botRoutes = remote?.suggested_routes?.length
      ? remote.suggested_routes.map((path) => ({
          path,
          label: ROUTE_LABELS[path] ?? path
        }))
      : fallback.quickRoutes;

    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: botText,
        routes: botRoutes
      }
    ]);
    setSending(false);
  };

  return (
    <div style={{ position: "fixed", right: "20px", bottom: "20px", zIndex: 40 }}>
      {open && (
        <section
          aria-label="EXOHUB AI 챗봇"
          style={{
            width: "min(360px, calc(100vw - 32px))",
            maxHeight: "480px",
            marginBottom: "10px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px"
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--accent-primary)" }}>
                EXOHUB AI 챗봇
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                탐색·비교·기록 안내 보조
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="AI 챗봇 닫기"
              style={{
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-canvas)",
                color: "var(--text-muted)",
                fontSize: "11px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "12px"
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "stretch",
                  maxWidth: m.role === "user" ? "85%" : "100%",
                  padding: "9px 11px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor:
                    m.role === "user" ? "rgba(56, 189, 248, 0.16)" : "var(--bg-canvas)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  whiteSpace: "pre-line",
                  lineHeight: 1.5
                }}
              >
                <div>{m.text}</div>
                {m.routes && m.routes.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                    {m.routes.map((r) => (
                      <button
                        key={r.path}
                        type="button"
                        onClick={() => {
                          onNavigate(r.path);
                          setOpen(false);
                        }}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--accent-secondary)",
                          backgroundColor: "transparent",
                          color: "var(--accent-secondary)",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        {r.label} →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            style={{
              padding: "10px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              gap: "6px"
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="질문이나 찾을 주제를 입력..."
              style={{
                flex: 1,
                padding: "7px 10px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-canvas)",
                color: "var(--text-primary)",
                fontSize: "12px"
              }}
            />
            <button
              type="submit"
              disabled={sending}
              style={{
                padding: "7px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--accent-primary)",
                backgroundColor: "rgba(163, 230, 53, 0.16)",
                color: "var(--accent-primary)",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {sending ? "..." : "전송"}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="EXOHUB AI 챗봇 토글"
        style={{
          padding: "10px 15px",
          borderRadius: "999px",
          border: "1px solid var(--accent-primary)",
          backgroundColor: "var(--bg-surface)",
          color: "var(--accent-primary)",
          fontSize: "12px",
          fontWeight: 800,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.28)",
          cursor: "pointer"
        }}
      >
        {open ? "✕ 챗봇 닫기" : "🤖 AI 챗봇"}
      </button>
    </div>
  );
};