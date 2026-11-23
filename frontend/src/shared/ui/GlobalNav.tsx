import React from "react";
import { SharedThemeToggle } from "../commonUiKit";
import type { ThemeMode } from "../commonUiKit";

interface GlobalNavProps {
  onSelectHome: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}

export const GlobalNav: React.FC<GlobalNavProps> = ({
  onSelectHome,
  sidebarOpen,
  onToggleSidebar,
  themeMode,
  onToggleTheme
}) => {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)"
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px"
        }}
      >
        <a
          href="/"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
              e.preventDefault();
              onSelectHome();
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 800,
            fontSize: "19px",
            letterSpacing: "0.03em",
            color: "var(--accent-primary)",
            textDecoration: "none"
          }}
        >
          <span>EXOHUB</span>
        </a>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <SharedThemeToggle themeMode={themeMode} onToggleTheme={onToggleTheme} />

          <button
            type="button"
            onClick={onToggleSidebar}
            aria-expanded={sidebarOpen}
            aria-label="우측 사이드바 토글"
            title={sidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
            style={{
              width: "38px",
              height: "38px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: sidebarOpen ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
              backgroundColor: sidebarOpen ? "rgba(163, 230, 53, 0.16)" : "var(--bg-canvas)",
              color: sidebarOpen ? "var(--accent-primary)" : "var(--text-primary)",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease"
            }}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
};