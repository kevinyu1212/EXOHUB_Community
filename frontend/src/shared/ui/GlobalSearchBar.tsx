import React from "react";
import { CATEGORY_LIST } from "../commonCategories";
import type { CategoryCode } from "../commonTypes";

interface GlobalSearchBarProps {
  query: string;
  selectedCategory: CategoryCode | "ALL";
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: CategoryCode | "ALL") => void;
  onSubmitSearch: () => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  query,
  selectedCategory,
  onQueryChange,
  onCategoryChange,
  onSubmitSearch
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitSearch();
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 1fr) 210px auto",
        gap: "10px",
        padding: "16px",
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)"
      }}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="국명·학명·유통명·별칭·상품명 검색"
        aria-label="국명·학명·유통명·별칭·상품명 검색"
        style={{
          padding: "10px 12px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-canvas)",
          color: "var(--text-primary)",
          fontSize: "14px"
        }}
      />

      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value as CategoryCode | "ALL")}
        aria-label="대분류 필터"
        style={{
          padding: "10px 12px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-canvas)",
          color: "var(--text-primary)",
          fontSize: "14px"
        }}
      >
        <option value="ALL">전체 8개 분야</option>
        {CATEGORY_LIST.map((cat) => (
          <option key={cat.code} value={cat.code}>
            {cat.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        style={{
          padding: "10px 18px",
          borderRadius: "var(--radius-sm)",
          border: "none",
          backgroundColor: "var(--accent-primary)",
          color: "#111827",
          fontWeight: 700,
          fontSize: "14px",
          cursor: "pointer"
        }}
      >
        검색
      </button>
    </form>
  );
};