import React, { useState } from "react";
import { CATEGORY_LIST, ListingCardShell, TrustMetaBar } from "../../shared";
import type { CategoryCode } from "../../shared";
import {
  MOCK_CARE_LOGS,
  MOCK_COLLECTION_TRUST,
  MOCK_MARKET_SAMPLE_CARD,
  MOCK_PRICE_SAMPLE_CARD,
  MOCK_TAXA_SAMPLES
} from "../../mocks/exohubMockData";

interface SubPageProps {
  selectedCategory: CategoryCode | "ALL";
  searchQuery: string;
  onNavigate: (path: string) => void;
}

const pageCardStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  padding: "20px"
};

export const SearchPageView: React.FC<SubPageProps> = ({ selectedCategory, searchQuery }) => {
  const [group, setGroup] = useState<"ALL" | "TAXA" | "PRODUCTS" | "SELLERS" | "POSTS">("ALL");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <section style={pageCardStyle}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-secondary)" }}>SEARCH</div>
        <h1 style={{ margin: "6px 0 4px", fontSize: "22px" }}>통합 검색</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
          검색어: <strong style={{ color: "var(--text-primary)" }}>{searchQuery || "전체"}</strong> · 분야:{" "}
          <strong style={{ color: "var(--accent-primary)" }}>
            {selectedCategory === "ALL"
              ? "전체 8개 분야"
              : CATEGORY_LIST.find((c) => c.code === selectedCategory)?.label}
          </strong>
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
          {(
            [
              ["ALL", "전체"],
              ["TAXA", "생물(taxa)"],
              ["PRODUCTS", "상품(products)"],
              ["SELLERS", "판매처(sellers)"],
              ["POSTS", "게시글(posts)"]
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setGroup(key)}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                border: group === key ? "1px solid var(--accent-secondary)" : "1px solid var(--border-subtle)",
                backgroundColor: group === key ? "rgba(56, 189, 248, 0.14)" : "transparent",
                color: group === key ? "var(--accent-secondary)" : "var(--text-primary)",
                fontSize: "12px",
                fontWeight: group === key ? 700 : 500,
                cursor: "pointer"
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section style={pageCardStyle}>
        <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>선택 그룹: {group}</div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          국명·학명·유통명·별칭·상품명 검색 결과가 생물·상품·판매처·게시글 단위로 구분됩니다.
        </div>
      </section>
    </div>
  );
};

export const TaxaPageView: React.FC<SubPageProps> = ({ selectedCategory }) => {
  const filteredTaxa =
    selectedCategory === "ALL"
      ? MOCK_TAXA_SAMPLES
      : MOCK_TAXA_SAMPLES.filter((item) => item.categoryCode === selectedCategory);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <section style={pageCardStyle}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)" }}>TAXONOMY ATLAS</div>
        <h1 style={{ margin: "6px 0 4px", fontSize: "22px" }}>생물 도감</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
          생물학적 사실, 사육 경험담, 판매 설명을 구분하고 출처·검수 상태를 함께 확인합니다.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "14px"
        }}
      >
        {filteredTaxa.map((t) => (
          <article key={t.id} style={pageCardStyle}>
            <div style={{ fontSize: "12px", color: "var(--accent-secondary)", fontWeight: 700 }}>{t.categoryLabel}</div>
            <h2 style={{ margin: "6px 0 2px", fontSize: "18px" }}>{t.korean}</h2>
            <div style={{ fontSize: "13px", fontStyle: "italic", color: "var(--text-muted)" }}>{t.scientific}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>별칭·유통명: {t.alias}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>분포·생태: {t.habitat}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", marginBottom: "12px" }}>
              {t.careNote}
            </div>
            <TrustMetaBar trust={t.trust} />
          </article>
        ))}
      </section>
    </div>
  );
};

export const PriceComparePageView: React.FC<SubPageProps> = ({ onNavigate }) => {
  const [sortBy, setSortBy] = useState<"TOTAL_ASC" | "TOTAL_DESC" | "LATEST">("TOTAL_ASC");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <section style={pageCardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)" }}>PRICE COMPARISON</div>
            <h1 style={{ margin: "6px 0 4px", fontSize: "22px" }}>가격 비교 및 시세</h1>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "TOTAL_ASC" | "TOTAL_DESC" | "LATEST")}
            aria-label="가격 정렬 기준"
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-canvas)",
              color: "var(--text-primary)",
              fontSize: "13px"
            }}
          >
            <option value="TOTAL_ASC">배송비 포함 총액 낮은순</option>
            <option value="TOTAL_DESC">배송비 포함 총액 높은순</option>
            <option value="LATEST">최신 확인순</option>
          </select>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
          비교 조건이 불충분한 항목은 직접 비교 불가로 안내하며, 오래된 가격은 현재가와 구분합니다.
        </p>
      </section>

      <ListingCardShell item={MOCK_PRICE_SAMPLE_CARD} onSelect={() => onNavigate("/market")} />
    </div>
  );
};

export const MarketPageView: React.FC<SubPageProps> = ({ onNavigate }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <section style={pageCardStyle}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-secondary)" }}>MARKET & SELLERS</div>
        <h1 style={{ margin: "6px 0 4px", fontSize: "22px" }}>마켓 및 판매처</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
          개체·수생 생물·장비·먹이·표본·박제 유형별 정보와 판매처·원문 연결을 관리합니다.
        </p>
      </section>
      <ListingCardShell item={MOCK_MARKET_SAMPLE_CARD} onSelect={() => onNavigate("/price")} />
    </div>
  );
};

export const CarePageView: React.FC<SubPageProps> = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <section style={pageCardStyle}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)" }}>HUSBANDRY & AQUARIUM</div>
        <h1 style={{ margin: "6px 0 4px", fontSize: "22px" }}>사육·수조·번식 관리</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
          개체/군체, 사육장·수조, 급이·탈피·체중·수질·번식 기록을 한곳에서 정리합니다.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "14px"
        }}
      >
        {MOCK_CARE_LOGS.map((log) => (
          <div key={log.id} style={pageCardStyle}>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{log.title}</div>
            <p style={{ margin: "8px 0 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              {log.summary}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export const CollectionPageView: React.FC<SubPageProps> = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <section style={pageCardStyle}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#FBBF24" }}>SPECIMEN & TAXIDERMY</div>
        <h1 style={{ margin: "6px 0 4px", fontSize: "22px" }}>표본·박제 컬렉션</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
          라벨·보존 상태·출처 및 법적 증빙 검수 상태를 함께 기록하며, 증빙 미확인 대상은 공개 거래를 제한합니다.
        </p>
      </section>

      <section style={pageCardStyle}>
        <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>컬렉션 증빙·보존 상태(목업)</div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
          곤충표본·자연사 표본 및 박제 항목의 보관 환경, 원산지/허가 증빙, 검수 상태를 확인합니다.
        </div>
        <TrustMetaBar trust={MOCK_COLLECTION_TRUST} />
      </section>
    </div>
  );
};

export const CommunityPageView: React.FC<SubPageProps> = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <section style={pageCardStyle}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-secondary)" }}>COMMUNITY</div>
        <h1 style={{ margin: "6px 0 4px", fontSize: "22px" }}>커뮤니티</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
          분야별 게시판, 사육 일지·번식 사례, 질문·답변 및 도감 연결 게시글을 나눕니다.
        </p>
      </section>

      <section style={pageCardStyle}>
        <div style={{ fontSize: "15px", fontWeight: 700 }}>사육·번식 경험 공유(목업)</div>
        <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
          실제 사육·번식 과정의 기록과 질문을 공유하며, 의학·법률 판단을 대체하지 않습니다.
        </p>
      </section>
    </div>
  );
};

export const AiLabPageView: React.FC<SubPageProps> = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <section style={pageCardStyle}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)" }}>AI LAB</div>
        <h1 style={{ margin: "6px 0 4px", fontSize: "22px" }}>AI 보조·분석 LAB</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
          상품명·학명 정규화, 개체 분양가 산정/시세 예측·자동 학습 및 식별/OCR 보조 기능을 다룹니다.
        </p>
      </section>

      <section style={pageCardStyle}>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          · AI 결과는 참고 후보와 신뢰도를 제공하며, <strong style={{ color: "var(--text-primary)" }}>종 확정 동정, 질병 진단, 독성/위험성, 법적 거래 가능 여부를 단독 확정하지 않습니다.</strong>
        </div>
      </section>
    </div>
  );
};