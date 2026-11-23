import React from "react";
import { SharedPageHeader, SharedPanelCard } from "../../shared/commonUiKit";
import { MOCK_CARE_LOGS } from "../../mocks/exohubMockData";

export const CarePage: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
    <SharedPageHeader
      eyebrow="CARE PAGE"
      title="사육·수조·번식 관리"
      description="개체/군체, 사육장·수조, 급이·탈피·체중·수질·번식 기록을 전용 페이지에서 관리합니다."
    />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
      {MOCK_CARE_LOGS.map((log) => (
        <SharedPanelCard key={log.id}>
          <div style={{ fontSize: "15px", fontWeight: 700 }}>{log.title}</div>
          <p style={{ margin: "8px 0 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>{log.summary}</p>
        </SharedPanelCard>
      ))}
    </div>
  </div>
);