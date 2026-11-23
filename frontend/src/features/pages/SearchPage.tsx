import React, { useEffect, useMemo, useState } from "react";
import type { CategoryCode, CommonCardItem } from "../../shared";
import {
  SharedListingCard,
  SharedNoticeBanner,
  SharedPageHeader,
  SharedPanelCard
} from "../../shared/commonUiKit";
import { recommendFeedItems } from "../../shared/ai/aiAlgorithms";
import { requestAiWebSearch } from "../../shared/ai/aiServiceClient";
import type { WebSearchApiResponse } from "../../shared/ai/aiServiceClient";
import { MOCK_CAFE_FEED_ITEMS } from "../../mocks/exohubMockData";

export const SearchPage: React.FC<{
  selectedCategory: CategoryCode | "ALL";
  searchQuery: string;
}> = ({ selectedCategory, searchQuery }) => {
  const [webLoading, setWebLoading] = useState<boolean>(false);
  const [webData, setWebData] = useState<WebSearchApiResponse | null>(null);

  const candidateCards: CommonCardItem[] = useMemo(() => {
    const list: CommonCardItem[] = [];
    for (const entry of MOCK_CAFE_FEED_ITEMS) {
      if (entry.cardItem) {
        list.push(entry.cardItem);
      } else {
        list.push({
          id: entry.id,
          title: entry.title,
          categoryCode: entry.categoryCode,
          categoryLabel: entry.categoryLabel,
          sourceName: entry.authorOrSource,
          updatedAt: entry.postedAt,
          summary: entry.excerpt
        } as unknown as CommonCardItem);
      }
    }
    return list;
  }, []);

  const items = useMemo<CommonCardItem[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    return candidateCards.filter((item) => {
      const rec = item as unknown as Record<string, unknown>;
      const catVal = String(rec.categoryCode ?? rec.category ?? "").toUpperCase();
      const catMatch =
        selectedCategory === "ALL" || catVal === String(selectedCategory).toUpperCase();
      const qMatch =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        JSON.stringify(item).toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [candidateCards, selectedCategory, searchQuery]);

  const recommended = useMemo<CommonCardItem[]>(
    () => recommendFeedItems(candidateCards, selectedCategory, searchQuery, 3),
    [candidateCards, selectedCategory, searchQuery]
  );

  const handleRunWebSearch = async () => {
    const effectiveQuery = searchQuery.trim() || "특수생물 사육 분양 시세";
    setWebLoading(true);
    const res = await requestAiWebSearch(effectiveQuery, 6);
    setWebData(res);
    setWebLoading(false);
  };

  useEffect(() => {
    setWebData(null);
  }, [searchQuery, selectedCategory]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <SharedPageHeader
        eyebrow="SEARCH & BRIEFING"
        title="통합 검색 및 외부 검색 브리핑"
        description={`검색어: "${searchQuery || "전체"}" · 내부 피드 추천과 외부 웹 검색 브리핑을 함께 제공합니다.`}
        rightSlot={
          <button
            type="button"
            onClick={handleRunWebSearch}
            disabled={webLoading}
            style={{
              padding: "7px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--accent-secondary)",
              backgroundColor: "rgba(56, 189, 248, 0.14)",
              color: "var(--accent-secondary)",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {webLoading ? "검색 브리핑 생성 중..." : "인터넷 검색 브리핑 실행"}
          </button>
        }
      />

      <SharedNoticeBanner
        title="검색 및 외부 웹 브리핑 안내"
        items={[
          "외부 웹 브리핑은 ai-service(/api/v1/ai/web-search)가 실행 중일 때 검색 결과를 수집·요약하며, 출처 원문과 수집시각·검수 상태를 함께 확인해야 합니다.",
          "종 확정 동정, 질병 진단, 법적 거래 허용 여부는 AI 결과만으로 확정하지 않습니다."
        ]}
      />

      {webData && (
        <SharedPanelCard>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--accent-primary)", marginBottom: "6px" }}>
            외부 검색 브리핑 ({webData.query}) · 수집시각 {webData.collected_at}
          </div>
          <p style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.55 }}>
            {webData.briefing_summary}
          </p>
          {webData.highlights.length > 0 && (
            <ul style={{ margin: "0 0 10px", paddingLeft: "18px", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              {webData.highlights.map((hl, i) => (
                <li key={i}>{hl}</li>
              ))}
            </ul>
          )}
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px" }}>
            검수 상태: {webData.verification_status} · {webData.disclaimer}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {webData.results.map((r, idx) => (
              <div
                key={`${r.url}-${idx}`}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-canvas)"
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--accent-secondary)", marginBottom: "2px" }}>
                  출처: {r.source}
                </div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-primary)", textDecoration: "none" }}
                >
                  {r.title} ↗
                </a>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>{r.snippet}</p>
              </div>
            ))}
          </div>
        </SharedPanelCard>
      )}

      <SharedPanelCard>
        <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--accent-primary)", marginBottom: "8px" }}>
          알고리즘 추천 항목
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
          {recommended.map((item) => (
            <SharedListingCard key={`rec-${item.id}`} item={item} />
          ))}
        </div>
      </SharedPanelCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
        {items.map((item) => (
          <SharedListingCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};