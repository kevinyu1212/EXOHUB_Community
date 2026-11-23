import React from "react";
import { SharedPageHeader, SharedPanelCard } from "../../shared/commonUiKit";

export const CommunityPage: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
    <SharedPageHeader
      eyebrow="COMMUNITY PAGE"
      title="커뮤니티"
      description="분야별 게시판, 사육 일지·번식 사례, 질문·답변 및 도감 연결 게시글을 나눕니다."
    />
    <SharedPanelCard>
      <div style={{ fontSize: "15px", fontWeight: 700 }}>사육·번식 기록 공유</div>
      <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
        실제 사육·번식 과정과 질문을 공유하며, 의학·법률 판단을 대체하지 않습니다.
      </p>
    </SharedPanelCard>
  </div>
);