import React, { useState } from "react";
import { CATEGORY_LIST } from "../../shared";
import type { CategoryCode } from "../../shared";
import { SharedPageHeader, SharedPanelCard } from "../../shared/commonUiKit";

export const SearchPage: React.FC<{
  selectedCategory: CategoryCode | "ALL";
  searchQuery: string;
}> = ({ selectedCategory, searchQuery }) => {
  const [group, setGroup] = useState<"ALL" | "TAXA" | "PRODUCTS" | "SELLERS" | "POSTS">("ALL");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <SharedPageHeader
        eyebrow="SEARCH PAGE"
        title="통합 검색"
        description={`검색어: ${searchQuery || "전체"} · 분야: ${
          selectedCategory === "ALL"
            ? "전체 8개 분야"
            : CATEGORY_LIST.find((c) => c.code === selectedCategory)?.label
        }`}
      />
      <SharedPanelCard>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
          {(
            [
              ["ALL", "전체"],
              ["TAXA", "생물(taxa)"],
              ["PRODUCTS", "상품(products)"],
              ["SELLERS", "판매처(sellers)"],
              ["POSTS", "게시글(posts)"]
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setGroup(key)}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                border: group === key ? "1px solid var(--accent-secondary)" : "1px solid var(--border-subtle)",
                backgroundColor: group === key ? "rgba(56, 189, 248, 0.14)" : "transparent",
                color: group === key ? "var(--accent-secondary)" : "var(--text-primary)",
                fontSize: "12px",
                fontWeight: group === key ? 700 : 500,
                cursor: "pointer"
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          현재 선택 그룹: <strong>{group}</strong> — 생물·상품·판매처·게시글 단위로 결과를 구분합니다.
        </div>
      </SharedPanelCard>
    </div>
  );
};