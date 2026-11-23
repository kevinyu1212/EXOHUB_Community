import React, { useEffect, useRef } from "react";
import { CATEGORY_LIST } from "./index";
import type { CategoryCode, CommonCardItem } from "./commonTypes";
import { ListingCardShell } from "./ui/ListingCardShell";
import { TrustMetaBar } from "./ui/TrustMetaBar";

export { ListingCardShell, TrustMetaBar };

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
      padding: "18px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px"
    }}
  >
    <div>
      <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent-secondary)" }}>{eyebrow}</div>
      <h1 style={{ margin: "4px 0", fontSize: "20px", letterSpacing: "-0.01em" }}>{title}</h1>
      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>{description}</p>
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

export const SharedCategoryFilterBar: React.FC<{
  selectedCategory: CategoryCode | "ALL";
  onSelectCategory: (cat: CategoryCode | "ALL") => void;
}> = ({ selectedCategory, onSelectCategory }) => (
  <section
    aria-label="공통 8개 분야 필터"
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      padding: "12px 14px",
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)"
    }}
  >
    <button
      type="button"
      onClick={() => onSelectCategory("ALL")}
      style={{
        padding: "6px 12px",
        borderRadius: "999px",
        border: selectedCategory === "ALL" ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
        backgroundColor: selectedCategory === "ALL" ? "rgba(163, 230, 53, 0.14)" : "var(--bg-canvas)",
        color: selectedCategory === "ALL" ? "var(--accent-primary)" : "var(--text-muted)",
        fontSize: "12px",
        fontWeight: 700,
        cursor: "pointer"
      }}
    >
      전체 분야
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
            padding: "6px 12px",
            borderRadius: "999px",
            border: active ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
            backgroundColor: active ? "rgba(163, 230, 53, 0.14)" : "var(--bg-canvas)",
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

export const SharedInfiniteScrollFooter: React.FC<{
  hasMore: boolean;
  isLoading: boolean;
  remainingCount: number;
  totalCount: number;
  onLoadMore: () => void;
}> = ({ hasMore, isLoading, remainingCount, totalCount, onLoadMore }) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "160px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div
      ref={sentinelRef}
      style={{
        padding: "12px 4px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        color: "var(--text-muted)"
      }}
    >
      {hasMore ? (
        <>
          <span>{isLoading ? "다음 항목을 불러오는 중..." : "스크롤 시 다음 항목이 이어집니다."}</span>
          <button
            type="button"
            onClick={onLoadMore}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            더 보기 ({remainingCount}건 남음)
          </button>
        </>
      ) : (
        totalCount > 0 && <span>모든 항목을 불러왔습니다.</span>
      )}
    </div>
  );
};

export const SharedListingCard: React.FC<{
  item: CommonCardItem;
  onSelect?: (id: string) => void;
}> = ({ item, onSelect }) => <ListingCardShell item={item} onSelect={onSelect} />;