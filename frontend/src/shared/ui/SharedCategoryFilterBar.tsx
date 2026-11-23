import React from "react";
import { CATEGORY_LIST } from "../index";
import type { CategoryCode } from "../commonTypes";

export const SharedCategoryFilterBar: React.FC<{
  selectedCategory: CategoryCode | "ALL";
  onSelectCategory: (cat: CategoryCode | "ALL") => void;
}> = ({ selectedCategory, onSelectCategory }) => (
  <section
    aria-label="공통 8개 분야 필터"
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "8px",
      padding: "10px 14px",
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)"
    }}
  >
    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginRight: "4px" }}>
      분야
    </span>
    <button
      type="button"
      onClick={() => onSelectCategory("ALL")}
      style={{
        padding: "5px 11px",
        borderRadius: "999px",
        border: selectedCategory === "ALL" ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
        backgroundColor: selectedCategory === "ALL" ? "rgba(163, 230, 53, 0.16)" : "var(--bg-canvas)",
        color: selectedCategory === "ALL" ? "var(--accent-primary)" : "var(--text-muted)",
        fontSize: "12px",
        fontWeight: 700,
        cursor: "pointer"
      }}
    >
      전체
    </button>
    {CATEGORY_LIST.map((cat) => {
      const active = selectedCategory === cat.code;
      return (
        <button
          key={cat.code}
          type="button"
          onClick={() => onSelectCategory(cat.code)}
          title={cat.examples}
          style={{
            padding: "5px 11px",
            borderRadius: "999px",
            border: active ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
            backgroundColor: active ? "rgba(163, 230, 53, 0.16)" : "var(--bg-canvas)",
            color: active ? "var(--accent-primary)" : "var(--text-primary)",
            fontSize: "12px",
            fontWeight: active ? 700 : 500,
            cursor: "pointer"
          }}
        >
          {cat.label}
        </button>
      );
    })}
  </section>
);