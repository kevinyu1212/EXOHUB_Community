import React from "react";
import { SharedPageHeader, SharedPanelCard } from "../../shared/commonUiKit";

export const AiLabPage: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
    <SharedPageHeader
      eyebrow="AI LAB PAGE"
      title="AI 보조·분석 LAB"
      description="종/상품명 정규화, 분양가·시세 보조 및 식별/OCR/수질 분석 도구를 분리 제공합니다."
    />
    <SharedPanelCard>
      <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
        · AI 결과는 참고 후보와 신뢰도를 제공하며, <strong style={{ color: "var(--text-primary)" }}>종 확정 동정·질병 진단·독성/위험성·법적 거래 가능 여부를 단독 확정하지 않습니다.</strong>
      </div>
    </SharedPanelCard>
  </div>
);