import React, { useState } from "react";

type MemberTab = "PROFILE" | "COLLECTION" | "SAVED_ALERTS" | "SELLER_BREEDER";

export const MemberWorkspaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MemberTab>("PROFILE");

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
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-secondary)" }}>
          MEMBER WORKSPACE · FEATURES/MEMBER
        </div>
        <h1 style={{ margin: "6px 0 4px", fontSize: "24px" }}>회원·사육자·번식자·판매자·수집가 페이지</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
          개인 컬렉션, 사육장/수조/번식 및 표본·박제 기록, 즐겨찾기·북마크·가격 알림, 승인 상태별 기능을 관리합니다.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
          {(
            [
              ["PROFILE", "내 계정·승인 상태"],
              ["COLLECTION", "사육·수조·표본/박제 컬렉션"],
              ["SAVED_ALERTS", "즐겨찾기·북마크·가격 알림"],
              ["SELLER_BREEDER", "번식·분양·판매 관리"]
            ] as const
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              style={{
                padding: "7px 12px",
                borderRadius: "var(--radius-sm)",
                border:
                  activeTab === tabKey
                    ? "1px solid var(--accent-secondary)"
                    : "1px solid var(--border-subtle)",
                backgroundColor:
                  activeTab === tabKey ? "rgba(56, 189, 248, 0.14)" : "var(--bg-canvas)",
                color: activeTab === tabKey ? "var(--accent-secondary)" : "var(--text-primary)",
                fontSize: "13px",
                fontWeight: activeTab === tabKey ? 700 : 500,
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
        현재 선택된 회원 탭: <strong style={{ color: "var(--text-primary)" }}>{activeTab}</strong> — 역할(일반 회원, 사육자, 번식자, 판매자, 표본 수집가) 및 승인 상태에 따른 상세 위젯을 이 컴포넌트 아래로 분리 확장합니다.
      </section>
    </div>
  );
};