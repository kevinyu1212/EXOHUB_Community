import React from "react";
import type { DomainModuleSummary } from "../types/api";

const MODULES: DomainModuleSummary[] = [
  { key: "search", title: "통합 검색", subtitle: "학명·국명·유통명·옵션 검색", routePath: "/search" },
  { key: "taxa", title: "생물 분류 도감", subtitle: "계층 분류·별칭·출처 관리", routePath: "/taxa" },
  { key: "price", title: "시세·가격 비교", subtitle: "개체/옵션별 가격 및 이력 추적", routePath: "/price" },
  { key: "market", title: "분양·용품 마켓", subtitle: "판매처·직거래 및 출처 검수", routePath: "/market" },
  { key: "care", title: "사육·번식 일지", subtitle: "사육장·급이·탈피·체중 기록", routePath: "/care" },
  { key: "aquatic", title: "물생활·수조 관리", subtitle: "수조 제원·수질 및 생물 관리", routePath: "/aquatic" },
  { key: "specimen", title: "곤충표본 컬렉션", subtitle: "표본 코드·보관 상태·라벨 기록", routePath: "/specimen" },
  { key: "taxidermy", title: "박제 컬렉션", subtitle: "마운트 유형·컨디션 리포트", routePath: "/taxidermy" },
  { key: "community", title: "커뮤니티", subtitle: "사육 노하우·질문·정보 공유", routePath: "/community" },
  { key: "admin", title: "출처·검수 관리", subtitle: "허가/출처 증빙 검수 큐", routePath: "/admin" }
];

export const AppShell: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "20px",
          borderBottom: "1px solid var(--border-subtle)"
        }}
      >
        <div>
          <div style={{ color: "var(--accent-primary)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.06em" }}>
            EXOHUB WORKSPACE
          </div>
          <h1 style={{ margin: "6px 0 4px", fontSize: "28px" }}>특수생물 정보·시세·사육·컬렉션 플랫폼</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>
            파충류 · 양서류 · 절지류 · 곤충 · 물생활 · 소동물 · 곤충표본 · 박제
          </p>
        </div>
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid var(--accent-secondary)",
            color: "var(--accent-secondary)",
            fontSize: "12px",
            fontWeight: 600
          }}
        >
          UI FOUNDATION v0.1
        </span>
      </header>

      <main
        style={{
          marginTop: "28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px"
        }}
      >
        {MODULES.map((mod) => (
          <section
            key={mod.key}
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "18px"
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>{mod.title}</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>{mod.subtitle}</div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default AppShell;
