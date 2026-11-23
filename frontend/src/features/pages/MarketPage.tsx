import React from "react";
import { SharedListingCard, SharedPageHeader } from "../../shared/commonUiKit";
import { MOCK_MARKET_SAMPLE_CARD } from "../../mocks/exohubMockData";

export const MarketPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
    <SharedPageHeader
      eyebrow="MARKET PAGE"
      title="마켓 및 판매처"
      description="생물 개체·장비·먹이·표본·박제 유형별 상품 정보와 판매처·원문 이동을 분리 관리합니다."
    />
    <SharedListingCard item={MOCK_MARKET_SAMPLE_CARD} onSelect={() => onNavigate("/price")} />
  </div>
);