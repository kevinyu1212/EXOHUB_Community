import React from "react";
import type { ThemeMode } from "./viewportAndTheme";

export const SharedThemeToggle: React.FC<{
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}> = ({ themeMode, onToggleTheme }) => {
  const isDark = themeMode === "dark";

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={isDark ? "현재 다크 모드 · 클릭 시 라이트 모드" : "현재 라이트 모드 · 클릭 시 다크 모드"}
      style={{
        height: "38px",
        padding: "0 12px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-canvas)",
        color: "var(--text-primary)",
        fontSize: "12px",
        fontWeight: 700,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        whiteSpace: "nowrap"
      }}
    >
      <span>{isDark ? "🌙 다크" : "☀️ 라이트"}</span>
    </button>
  );
};