import React, { useEffect, useMemo, useState } from "react";
import { CATEGORY_LIST } from "../../shared";
import type { CategoryCode } from "../../shared";
import {
  SharedInfiniteScrollFooter,
  SharedListingCard,
  SharedNoticeBanner,
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

const BOARD_TABS: { key: CafeBoardTab; label: string; hint: string }[] = [
  { key: "ALL", label: "전체 피드", hint: "시세·사육·질문·표본 최신 흐름" },
  { key: "MARKET_PRICE", label: "분양·가격 비교", hint: "판매처·옵션·수집 시점 확인" },
  { key: "CARE_BREED", label: "사육·수조·번식", hint: "개체·군체·사육장·수질 기록" },
  { key: "QNA_TIPS", label: "질문·노하우", hint: "경험 공유 및 기초 사육 팁" },
  { key: "COLLECTION", label: "표본·박제", hint: "라벨·보존·법적 증빙 검수 상태" }
];

const HOME_GUIDE_ITEMS = [
  "상단 검색창에서 국명·학명·유통명·별칭·상품명을 입력하고 분야를 좁혀 도감, 가격 비교, 사육 기록, 표본·박제 컬렉션으로 이어집니다.",
  "카테고리 분류는 탐색·관리 목적이며 실제 법적 거래 허용 여부는 관련 법령·허가 및 출처 확인이 필요합니다.",
  "모든 시세·도감·표본 정보는 출처, 수집/확인 시각, 검증 상태를 함께 표시하며, AI 보조 결과는 전문가 검수나 법적 판단을 대체하지 않습니다."
];

const PAGE_SIZE = 5;

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
    }, 140);
  };

  const activeCategoryLabel =
    selectedCategory === "ALL"
      ? "전체 8개 분야"
      : CATEGORY_LIST.find((c) => c.code === selectedCategory)?.label ?? "전체 8개 분야";

  const currentTabMeta = BOARD_TABS.find((t) => t.key === activeBoard) ?? BOARD_TABS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <SharedNoticeBanner
        title="EXOHUB 이용 안내 및 데이터·법적 유의사항"
        items={HOME_GUIDE_ITEMS}
      />

      <SharedPanelCard style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px"
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {BOARD_TABS.map((tab) => {
              const active = activeBoard === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveBoard(tab.key)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    border: active ? "1px solid var(--accent-secondary)" : "1px solid var(--border-subtle)",
                    backgroundColor: active ? "rgba(56, 189, 248, 0.16)" : "var(--bg-canvas)",
                    color: active ? "var(--accent-secondary)" : "var(--text-primary)",
                    fontSize: "12px",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            <span style={{ color: "var(--accent-primary)" }}>{activeCategoryLabel}</span> · {visibleItems.length} /{" "}
            {filtered.length}건
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text-primary)" }}>{currentTabMeta.label}</strong> — {currentTabMeta.hint}
        </div>
      </SharedPanelCard>

      {filtered.length === 0 ? (
        <SharedPanelCard style={{ textAlign: "center", padding: "28px 18px", color: "var(--text-muted)", fontSize: "13px" }}>
          선택한 조건에 맞는 피드가 없습니다.{" "}
          <button
            type="button"
            onClick={() => {
              onSelectCategory("ALL");
              setActiveBoard("ALL");
            }}
            style={{
              marginLeft: "6px",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--accent-primary)",
              backgroundColor: "transparent",
              color: "var(--accent-primary)",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            필터 초기화
          </button>
        </SharedPanelCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {visibleItems.map((entry) =>
            entry.cardItem ? (
              <SharedListingCard
                key={entry.id}
                item={entry.cardItem}
                onSelect={() => onNavigate(entry.targetPath)}
              />
            ) : (
              <SharedPanelCard key={entry.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    fontSize: "12px",
                    color: "var(--text-muted)"
                  }}
                >
                  <span>
                    <strong style={{ color: "var(--accent-secondary)" }}>{entry.boardLabel}</strong> ·{" "}
                    {entry.categoryLabel}
                  </span>
                  <span>
                    {entry.authorOrSource} · {entry.postedAt}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "6px"
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: "16px", lineHeight: 1.35 }}>{entry.title}</h2>
                  {entry.metricTag && (
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)" }}>
                      {entry.metricTag}
                    </span>
                  )}
                </div>

                <p style={{ margin: "6px 0 10px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.55 }}>
                  {entry.excerpt}
                </p>

                {entry.trust && <TrustMetaBar trust={entry.trust} />}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={() => onNavigate(entry.targetPath)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--bg-canvas)",
                      color: "var(--text-primary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    해당 페이지 열기 →
                  </button>
                </div>
              </SharedPanelCard>
            )
          )}
        </div>
      )}

      <SharedInfiniteScrollFooter
        hasMore={hasMore}
        isLoading={isLoadingMore}
        remainingCount={filtered.length - visibleItems.length}
        totalCount={filtered.length}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
};