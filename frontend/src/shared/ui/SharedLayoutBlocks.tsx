import React from "react";

export const SharedPageHeader: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
  rightSlot?: React.ReactNode;
}> = ({ eyebrow, title, description, rightSlot }) => (
  <section
    style={{
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderLeft: "4px solid var(--accent-primary)",
      borderRadius: "var(--radius-md)",
      padding: "16px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px"
    }}
  >
    <div style={{ maxWidth: "920px" }}>
      <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.04em", color: "var(--accent-secondary)" }}>
        {eyebrow}
      </div>
      <h1 style={{ margin: "4px 0", fontSize: "20px", letterSpacing: "-0.015em", lineHeight: 1.3 }}>
        {title}
      </h1>
      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.55 }}>
        {description}
      </p>
    </div>
    {rightSlot}
  </section>
);

export const SharedPanelCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <article
    style={{
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      padding: "16px 18px",
      ...style
    }}
  >
    {children}
  </article>
);