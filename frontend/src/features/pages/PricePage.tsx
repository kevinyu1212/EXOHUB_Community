import React, { useState } from "react";
import { SharedListingCard, SharedPageHeader, SharedPanelCard } from "../../shared/commonUiKit";
import { MOCK_PRICE_SAMPLE_CARD } from "../../mocks/exohubMockData";

export const PricePage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [sortBy, setSortBy] = useState<"TOTAL_ASC" | "TOTAL_DESC" | "LATEST">("TOTAL_ASC");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <SharedPageHeader
        eyebrow="PRICE PAGE"
        title="가격 비교 및 시세"
        description="배송비 포함 총액, 판매 옵션·상태, 수집 시각과 신선도를 확인하며 비교 조건 부족 시 직접 비교 불가를 안내합니다."
        rightSlot={
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "TOTAL_ASC" | "TOTAL_DESC" | "LATEST")}
            aria-label="가격 정렬"
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-canvas)",
              color: "var(--text-primary)",
              fontSize: "12px"
            }}
          >
            <option value="TOTAL_ASC">총액 낮은순</option>
            <option value="TOTAL_DESC">총액 높은순</option>
            <option value="LATEST">최신 확인순</option>
          </select>
        }
      />
      <SharedPanelCard>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>정렬 기준: {sortBy}</div>
        <SharedListingCard item={MOCK_PRICE_SAMPLE_CARD} onSelect={() => onNavigate("/market")} />
      </SharedPanelCard>
    </div>
  );
};