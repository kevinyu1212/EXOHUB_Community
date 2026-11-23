import React, { useState } from "react";

export const SharedNoticeBanner: React.FC<{
  title: string;
  items: string[];
  accentColor?: string;
}> = ({ title, items, accentColor = "var(--accent-secondary)" }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <section
      aria-label={title}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderTop: `3px solid ${accentColor}`,
        borderRadius: "var(--radius-md)",
        padding: "14px 18px"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "999px",
              backgroundColor: "rgba(56, 189, 248, 0.14)",
              color: accentColor,
              fontSize: "11px",
              fontWeight: 800
            }}
          >
            이용 안내
          </span>
          <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>{title}</strong>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          style={{
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-canvas)",
            color: "var(--text-muted)",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {collapsed ? "안내 펼치기" : "안내 접기"}
        </button>
      </div>

      {!collapsed && (
        <ul
          style={{
            margin: "10px 0 0",
            paddingLeft: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "12px",
            color: "var(--text-muted)",
            lineHeight: 1.55
          }}
        >
          {items.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  );
};