import React from "react";

export const SharedSiteFooter: React.FC<{
  onNavigate: (path: string) => void;
}> = ({ onNavigate }) => {
  const quickLinks = [
    ["/taxa", "생물 도감"],
    ["/price", "가격 비교"],
    ["/market", "마켓"],
    ["/care", "사육 관리"],
    ["/collection", "표본·박제 컬렉션"],
    ["/community", "커뮤니티"],
    ["/ai-lab", "AI LAB"]
  ];

  return (
    <footer
      style={{
        padding: "22px 24px",
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        fontSize: "12px",
        color: "var(--text-muted)",
        lineHeight: 1.6
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div style={{ maxWidth: "620px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--accent-primary)", marginBottom: "4px" }}>
              EXOHUB
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
              특수생물 도감, 분양·장비·사료·표본/박제 가격 비교 및 마켓 탐색, 개체·수조·번식 기록, 표본·박제 보관/증빙 관리와
              커뮤니티·AI 보조 도구를 연결하는 통합 플랫폼입니다.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {quickLinks.map(([path, label]) => (
              <button
                key={path}
                type="button"
                onClick={() => onNavigate(path)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-canvas)",
                  color: "var(--text-primary)",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "12px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            fontSize: "11px"
          }}
        >
          <span>
            모든 정보는 출처, 수집·확인 시각 및 검수 상태와 함께 제공되며, 법적 거래 허용·종 확정 동정·질병 진단은 별도 확인 및 전문가 검수가 필요합니다.
          </span>
          <span>© EXOHUB Platform · 탐색·관리 및 커뮤니티 지원</span>
        </div>
      </div>
    </footer>
  );
};