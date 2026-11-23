import React, { useState } from "react";

type AdminSection = "DATA_QUALITY" | "MASTER_CRUD" | "PRICE_HISTORY" | "REVIEW_QUEUE" | "AUDIT_LOGS";

export const AdminWorkbenchView: React.FC = () => {
  const [section, setSection] = useState<AdminSection>("REVIEW_QUEUE");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <section
        style={{
          padding: "20px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)"
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#FBBF24" }}>
          ADMIN & REVIEWER WORKBENCH · FEATURES/ADMIN
        </div>
        <h1 style={{ margin: "6px 0 4px", fontSize: "24px" }}>관리자·전문가 검수 페이지</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
          생물·상품·판매처 CRUD, 수집 작업·중복/오매칭 검수, 가격 이력 정정, 출처·법적 증빙 검수 및 감사 로그를 분리 관리합니다.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
          {(
            [
              ["DATA_QUALITY", "수집·데이터 품질"],
              ["MASTER_CRUD", "분류·상품·판매처 CRUD"],
              ["PRICE_HISTORY", "가격 이력·정정"],
              ["REVIEW_QUEUE", "출처·법적·전문가 검수 큐"],
              ["AUDIT_LOGS", "신고·권한·감사 로그"]
            ] as const
          ).map(([secKey, label]) => (
            <button
              key={secKey}
              type="button"
              onClick={() => setSection(secKey)}
              style={{
                padding: "7px 12px",
                borderRadius: "var(--radius-sm)",
                border:
                  section === secKey
                    ? "1px solid var(--accent-primary)"
                    : "1px solid var(--border-subtle)",
                backgroundColor:
                  section === secKey ? "rgba(163, 230, 53, 0.14)" : "var(--bg-canvas)",
                color: section === secKey ? "var(--accent-primary)" : "var(--text-primary)",
                fontSize: "13px",
                fontWeight: section === secKey ? 700 : 500,
                cursor: "pointer"
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "18px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          fontSize: "13px",
          color: "var(--text-muted)"
        }}
      >
        현재 선택된 관리자 섹션: <strong style={{ color: "var(--text-primary)" }}>{section}</strong> — 권한자(관리자/전문가 검수자) 전용 검수·정정·승인 패널을 각각 하위 컴포넌트로 분리합니다.
      </section>
    </div>
  );
};