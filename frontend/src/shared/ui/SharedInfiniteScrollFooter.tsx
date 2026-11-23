import React, { useEffect, useRef } from "react";

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
      { rootMargin: "180px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div
      ref={sentinelRef}
      style={{
        padding: "14px 8px",
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
          <span>{isLoading ? "다음 피드를 불러오는 중..." : "아래로 스크롤하면 다음 항목이 이어집니다."}</span>
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
        totalCount > 0 && <span>전체 {totalCount}건 피드를 모두 확인했습니다.</span>
      )}
    </div>
  );
};