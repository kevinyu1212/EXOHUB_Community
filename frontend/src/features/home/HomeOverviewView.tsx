import React, { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_LIST, ListingCardShell, TrustMetaBar } from "../../shared";
import type { CategoryCode } from "../../shared";
import { MOCK_CAFE_FEED_ITEMS } from "../../mocks/exohubMockData";
import type { CafeBoardTab } from "../../mocks/exohubMockData";

interface HomeOverviewViewProps {
  selectedCategory: CategoryCode | "ALL";
  onSelectCategory: (cat: CategoryCode | "ALL") => void;
  onNavigate: (path: string) => void;
}

const BOARD_MENUS: { key: CafeBoardTab; label: string }[] = [
  { key: "ALL", label: "전체 피드" },
  { key: "MARKET_PRICE", label: "분양·가격 비교" },
  { key: "CARE_BREED", label: "사육·번식·수조" },
  { key: "QNA_TIPS", label: "질문·노하우" },
  { key: "COLLECTION", label: "표본·박제" }
];

const PAGE_SIZE = 4;

export const HomeOverviewView: React.FC<HomeOverviewViewProps> = ({
  selectedCategory,
  onSelectCategory,
  onNavigate
}) => {
  const [activeBoard, setActiveBoard] = useState<CafeBoardTab>("ALL");
  const [bannerOpen, setBannerOpen] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filteredItems = useMemo(() => {
    return MOCK_CAFE_FEED_ITEMS.filter((item) => {
      const matchBoard = activeBoard === "ALL" || item.board === activeBoard;
      const matchCategory = selectedCategory === "ALL" || item.categoryCode === selectedCategory;
      return matchBoard && matchCategory;
    });
  }, [activeBoard, selectedCategory]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeBoard, selectedCategory]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );

  const hasMore = visibleCount < filteredItems.length;

  const loadNextBatch = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredItems.length));
      setIsLoadingMore(false);
    }, 180);
  };

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNextBatch();
        }
      },
      { rootMargin: "160px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, filteredItems.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* 상단 스토어·플랫폼 안내 배너 */}
      <section
        aria-label="사이트 소개 및 안내 배너"
        style={{
          padding: "16px 20px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderLeft: "4px solid var(--accent-primary)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "999px",
                backgroundColor: "rgba(163, 230, 53, 0.14)",
                color: "var(--accent-primary)"
              }}
            >
              EXOHUB 안내
            </span>
            <h1 style={{ margin: 0, fontSize: "18px", letterSpacing: "-0.01em" }}>
              특수생물 도감 · 가격 비교 · 사육·수조 · 표본/박제 컬렉션
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setBannerOpen((prev) => !prev)}
            style={{
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-muted)",
              fontSize: "12px",
              padding: "4px 10px",
              cursor: "pointer"
            }}
          >
            {bannerOpen ? "안내 접기" : "안내 펼치기"}
          </button>
        </div>

        {bannerOpen && (
          <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.55 }}>
            <div>
              · 국명·학명·유통명·별칭으로 생물 도감과 판매/시세 카드를 비교하고, 사육·수조 기록과 표본·박제 컬렉션을 함께 둘러보세요.
            </div>
            <div style={{ marginTop: "4px", fontSize: "12px" }}>
              · 카테고리는 탐색·관리 목적이며 법적 거래 허용 여부를 확정하지 않습니다. 오래된 가격이나 표본·박제·보호/규제 대상은 출처·검수 상태 및 별도 법령·증빙 확인이 필요합니다.
            </div>
          </div>
        )}
      </section>

      {/* 스토어형 수평 카테고리 스트립 */}
      <section
        aria-label="8개 분야 카테고리 바"
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
          전체 8개 분야
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

      {/* 좌측 피드 메뉴 + 중앙 카드/피드(무한스크롤) + 우측 빠른 메뉴 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(185px, 215px) minmax(0, 1fr) minmax(200px, 240px)",
          gap: "16px",
          alignItems: "start"
        }}
      >
        <aside
          aria-label="피드 메뉴"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-secondary)", padding: "4px 8px" }}>
            탐색 메뉴
          </div>
          {BOARD_MENUS.map((menu) => {
            const active = activeBoard === menu.key;
            return (
              <button
                key={menu.key}
                type="button"
                onClick={() => setActiveBoard(menu.key)}
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
                {menu.label}
              </button>
            );
          })}
        </aside>

        <section aria-label="메인 피드 스트림" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              fontSize: "13px"
            }}
          >
            <div>
              <strong>{BOARD_MENUS.find((m) => m.key === activeBoard)?.label}</strong> ·{" "}
              <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>
                {selectedCategory === "ALL"
                  ? "전체 분야"
                  : CATEGORY_LIST.find((c) => c.code === selectedCategory)?.label}
              </span>
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {visibleItems.length} / {filteredItems.length}건
            </span>
          </div>

          {visibleItems.length === 0 ? (
            <div
              style={{
                padding: "28px 18px",
                textAlign: "center",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-muted)",
                fontSize: "13px"
              }}
            >
              조건에 맞는 항목이 없습니다.{" "}
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
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                초기화
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {visibleItems.map((entry) => {
                if (entry.cardItem) {
                  return (
                    <ListingCardShell
                      key={entry.id}
                      item={entry.cardItem}
                      onSelect={() => onNavigate(entry.targetPath)}
                    />
                  );
                }

                return (
                  <article
                    key={entry.id}
                    style={{
                      padding: "16px",
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "12px" }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "var(--accent-secondary)" }}>{entry.boardLabel}</span>
                        <span style={{ color: "var(--text-muted)" }}> · {entry.categoryLabel}</span>
                      </div>
                      <span style={{ color: "var(--text-muted)" }}>
                        {entry.authorOrSource} · {entry.postedAt}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                      <h2 style={{ margin: 0, fontSize: "15px", lineHeight: 1.4 }}>{entry.title}</h2>
                      {entry.metricTag && (
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)" }}>
                          {entry.metricTag}
                        </span>
                      )}
                    </div>

                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                      {entry.excerpt}
                    </p>

                    {entry.trust && <TrustMetaBar trust={entry.trust} />}

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
                        상세 이동 →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

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
                <span>{isLoadingMore ? "다음 항목을 불러오는 중..." : "스크롤 시 다음 항목이 이어집니다."}</span>
                <button
                  type="button"
                  onClick={loadNextBatch}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  더 보기 ({filteredItems.length - visibleItems.length}건 남음)
                </button>
              </>
            ) : (
              filteredItems.length > 0 && <span>모든 항목을 확인했습니다.</span>
            )}
          </div>
        </section>

        <aside aria-label="빠른 바로가기" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              padding: "14px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-primary)" }}>바로 가기</div>
            {[
              ["/taxa", "생물 도감"],
              ["/price", "가격 비교"],
              ["/market", "마켓 · 판매처"],
              ["/care", "사육 · 수조"],
              ["/collection", "표본 · 박제"],
              ["/me", "마이페이지"]
            ].map(([path, label]) => (
              <button
                key={path}
                type="button"
                onClick={() => onNavigate(path)}
                style={{
                  textAlign: "left",
                  padding: "7px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-canvas)",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {label} →
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};