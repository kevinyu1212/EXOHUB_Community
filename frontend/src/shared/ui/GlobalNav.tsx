import React from "react";

export interface GlobalNavItem {
  path: string;
  label: string;
  adminOnly?: boolean;
}

export const GLOBAL_NAV_ITEMS: GlobalNavItem[] = [
  { path: "/", label: "홈" },
  { path: "/taxa", label: "생물 도감" },
  { path: "/price", label: "가격 비교" },
  { path: "/market", label: "마켓" },
  { path: "/care", label: "사육 관리" },
  { path: "/collection", label: "표본·박제 컬렉션" },
  { path: "/community", label: "커뮤니티" },
  { path: "/ai-lab", label: "AI LAB" },
  { path: "/me", label: "마이페이지" },
  { path: "/admin", label: "관리자", adminOnly: true }
];

interface GlobalNavProps {
  activePath: string;
  onSelectPath: (path: string) => void;
  isAdmin?: boolean;
}

export const GlobalNav: React.FC<GlobalNavProps> = ({
  activePath,
  onSelectPath,
  isAdmin = false
}) => {
  const visibleItems = GLOBAL_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px"
        }}
      >
        <a
          href="/"
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
              e.preventDefault();
              onSelectPath("/");
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 800,
            fontSize: "18px",
            letterSpacing: "0.02em",
            color: "var(--accent-primary)",
            textDecoration: "none"
          }}
        >
          <span>EXOHUB</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "999px",
              padding: "2px 8px"
            }}
          >
            통합 생물 데이터·사육·마켓
          </span>
        </a>

        <nav aria-label="전역 내비게이션" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {visibleItems.map((item) => {
            const active = activePath === item.path;
            return (
              <div
                key={item.path}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: "var(--radius-sm)",
                  border: active ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                  backgroundColor: active ? "rgba(163, 230, 53, 0.14)" : "var(--bg-canvas)"
                }}
              >
                <a
                  href={item.path}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                      e.preventDefault();
                      onSelectPath(item.path);
                    }
                  }}
                  style={{
                    padding: "6px 10px",
                    color: active ? "var(--accent-primary)" : "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: active ? 700 : 500,
                    textDecoration: "none"
                  }}
                >
                  {item.label}
                </a>
                <a
                  href={item.path}
                  target="_blank"
                  rel="noreferrer"
                  title={`${item.label} 새 창으로 열기`}
                  aria-label={`${item.label} 새 창으로 열기`}
                  style={{
                    padding: "6px 7px 6px 2px",
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    textDecoration: "none"
                  }}
                >
                  ↗
                </a>
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
};