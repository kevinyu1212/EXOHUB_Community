import React from "react";
import { SharedPageHeader, SharedPanelCard, TrustMetaBar } from "../../shared/commonUiKit";
import { MOCK_COLLECTION_TRUST } from "../../mocks/exohubMockData";

export const CollectionPage: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
    <SharedPageHeader
      eyebrow="COLLECTION PAGE"
      title="표본·박제 컬렉션"
      description="라벨·보존 상태·출처 및 법적 증빙 검수 상태를 함께 기록하며, 증빙 미확인 항목은 공개 거래를 제한합니다."
    />
    <SharedPanelCard>
      <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>컬렉션 출처·법적 검수 상태</div>
      <p style={{ margin: "0 0 12px", fontSize: "13px", color: "var(--text-muted)" }}>
        표본·박제 보관 상태와 원산지/허가 증빙 검수 현황을 확인합니다.
      </p>
      <TrustMetaBar trust={MOCK_COLLECTION_TRUST} />
    </SharedPanelCard>
  </div>
);