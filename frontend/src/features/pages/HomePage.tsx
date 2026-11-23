import React, { useEffect, useMemo, useState } from "react";
import { CATEGORY_LIST } from "../../shared";
import type { CategoryCode } from "../../shared";
import {
  SharedCategoryFilterBar,
  SharedInfiniteScrollFooter,
  SharedListingCard,
  SharedPageHeader,
  SharedPanelCard,
  TrustMetaBar
} from "../../shared/commonUiKit";
import { MOCK_CAFE_FEED_ITEMS } from "../../mocks/exohubMockData";
import type { CafeBoardTab } from "../../mocks/exohubMockData";

interface HomePageProps {
  selectedCategory: CategoryCode | "ALL";
  onSelectCategory: (cat: CategoryCode | "ALL") => void;
  onNavigate: (path: string) => void;
}

const BOARD_TABS: { key: CafeBoardTab; label: string }[] = [
  { key: "ALL", label: "전체 피드" },
  { key: "MARKET_PRICE", label: "분양·가격 비교" },
  { key: "CARE_BREED", label: "사육·번식·수조" },
  { key: "QNA_TIPS", label: "질문·노하우" },
  { key: "COLLECTION", label: "표본·박제" }
];

const PAGE_SIZE = 4;

export const HomePage: React.FC<HomePageProps> = ({
  selectedCategory,
  onSelectCategory,
  onNavigate
}) => {
  const [activeBoard, setActiveBoard] = useState<CafeBoardTab>("ALL");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const filtered = useMemo(
    () =>
      MOCK_CAFE_FEED_ITEMS.filter(
        (item) =>
          (activeBoard === "ALL" || item.board === activeBoard) &&
          (selectedCategory === "ALL" || item.categoryCode === selectedCategory)
      ),
    [activeBoard, selectedCategory]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeBoard, selectedCategory]);

  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
      setIsLoadingMore(false);
    }, 150);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <SharedPageHeader
        eyebrow="EXOHUB HOME"
        title="특수생물 도감 · 가격 비교 · 사육·수조 · 표본/박제 컬렉션"
        description="상단 탭으로 전용 페이지를 분리해 관리하며, 공통 UI/UX 요소는 공용 모듈에서 일괄 제어합니다. 카테고리는 탐색·관리 목적이며 법적 거래 허용 여부를 확정하지 않습니다."
      />

      <SharedCategoryFilterBar selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 210px) minmax(0, 1fr)",
          gap: "16px",
          alignItems: "start"
        }}
      >
        <SharedPanelCard style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-secondary)", padding: "4px 8px" }}>
            홈 피드 분류
          </div>
          {BOARD_TABS.map((tab) => {
            const active = activeBoard === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveBoard(tab.key)}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  backgroundColor: active ? "rgba(56, 189, 248, 0.14)" : "transparent",
                  color: active ? "var(--accent-secondary)" : "var(--text-primary)",
                  fontSize: "13px",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer"
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </SharedPanelCard>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <SharedPanelCard style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
            <span>
              <strong>{BOARD_TABS.find((t) => t.key === activeBoard)?.label}</strong> ·{" "}
              <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>
                {selectedCategory === "ALL"
                  ? "전체 분야"
                  : CATEGORY_LIST.find((c) => c.code === selectedCategory)?.label}
              </span>
            </span>
            <span style={{ color: "var(--text-muted)" }}>
              {visibleItems.length} / {filtered.length}건
            </span>
          </SharedPanelCard>

          {visibleItems.map((entry) =>
            entry.cardItem ? (
              <SharedListingCard key={entry.id} item={entry.cardItem} onSelect={() => onNavigate(entry.targetPath)} />
            ) : (
              <SharedPanelCard key={entry.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--accent-secondary)", fontWeight: 700 }}>
                    {entry.boardLabel} · {entry.categoryLabel}
                  </span>
                  <span>
                    {entry.authorOrSource} · {entry.postedAt}
                  </span>
                </div>
                <h2 style={{ margin: "6px 0", fontSize: "16px" }}>{entry.title}</h2>
                <p style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--text-muted)" }}>{entry.excerpt}</p>
                {entry.trust && <TrustMetaBar trust={entry.trust} />}
              </SharedPanelCard>
            )
          )}

          <SharedInfiniteScrollFooter
            hasMore={hasMore}
            isLoading={isLoadingMore}
            remainingCount={filtered.length - visibleItems.length}
            totalCount={filtered.length}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>
    </div>
  );
};