import React from "react";
import type { CategoryCode } from "../../shared";
import { SharedCategoryFilterBar, SharedPageHeader, SharedPanelCard, TrustMetaBar } from "../../shared/commonUiKit";
import { MOCK_TAXA_SAMPLES } from "../../mocks/exohubMockData";

export const TaxaPage: React.FC<{
  selectedCategory: CategoryCode | "ALL";
  onSelectCategory: (cat: CategoryCode | "ALL") => void;
}> = ({ selectedCategory, onSelectCategory }) => {
  const list =
    selectedCategory === "ALL"
      ? MOCK_TAXA_SAMPLES
      : MOCK_TAXA_SAMPLES.filter((t) => t.categoryCode === selectedCategory);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <SharedPageHeader
        eyebrow="TAXA PAGE"
        title="생물 도감"
        description="생물학적 사실, 사육 경험담, 판매 설명을 구분하고 출처·검수 상태를 함께 확인합니다."
      />
      <SharedCategoryFilterBar selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px" }}>
        {list.map((t) => (
          <SharedPanelCard key={t.id}>
            <div style={{ fontSize: "12px", color: "var(--accent-secondary)", fontWeight: 700 }}>{t.categoryLabel}</div>
            <h2 style={{ margin: "6px 0 2px", fontSize: "18px" }}>{t.korean}</h2>
            <div style={{ fontSize: "13px", fontStyle: "italic", color: "var(--text-muted)" }}>{t.scientific}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>유통명·별칭: {t.alias}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>분포·생태: {t.habitat}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 12px" }}>{t.careNote}</div>
            <TrustMetaBar trust={t.trust} />
          </SharedPanelCard>
        ))}
      </div>
    </div>
  );
};