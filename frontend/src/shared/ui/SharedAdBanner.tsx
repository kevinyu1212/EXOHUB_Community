import React, { useState } from "react";

export const SharedAdBanner: React.FC<{
  badgeText?: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  onCtaClick: () => void;
}> = ({
  badgeText = "AD · 파트너 안내",
  headline,
  subtext,
  ctaLabel,
  onCtaClick
}) => {
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (dismissed) {
    return null;
  }

  return (
    <section
      aria-label="광고 및 파트너 배너"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "11px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", minWidth: 0 }}>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: "999px",
            border: "1px solid var(--accent-secondary)",
            backgroundColor: "rgba(56, 189, 248, 0.12)",
            color: "var(--accent-secondary)",
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.03em",
            flexShrink: 0
          }}
        >
          {badgeText}
        </span>
        <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>{headline}</strong>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{subtext}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <button
          type="button"
          onClick={onCtaClick}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--accent-primary)",
            backgroundColor: "rgba(163, 230, 53, 0.14)",
            color: "var(--accent-primary)",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {ctaLabel} →
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="광고 배너 닫기"
          title="배너 숨기기"
          style={{
            padding: "5px 8px",
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
    </section>
  );
};