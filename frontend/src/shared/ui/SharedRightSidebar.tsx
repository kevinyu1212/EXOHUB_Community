import React from "react";
import { SIDEBAR_NAV_ITEMS } from "./viewportAndTheme";

export const SharedRightSidebar: React.FC<{
  activePath: string;
  isAdminPreview: boolean;
  isCompact: boolean;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onToggleAdminPreview: () => void;
}> = ({
  activePath,
  isAdminPreview,
  isCompact,
  isOpen,
  onClose,
  onNavigate,
  onToggleAdminPreview
}) => {
  const visibleNavItems = SIDEBAR_NAV_ITEMS.filter((item) => !item.adminOnly || isAdminPreview);

  const drawerStyle: React.CSSProperties = isCompact
    ? {
        position: "fixed",
        top: "63px",
        right: 0,
        bottom: 0,
        width: "min(300px, 88vw)",
        zIndex: 25,
        overflowY: "auto",
        backgroundColor: "var(--bg-surface)",
        borderLeft: "1px solid var(--border-subtle)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "-10px 0 28px rgba(0, 0, 0, 0.35)",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease"
      }
    : {
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: isOpen ? "14px" : "0px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "sticky",
        top: "74px",
        overflowY: "auto",
        maxHeight: "calc(100vh - 94px)",
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "translateX(0)" : "translateX(20px)",
        pointerEvents: isOpen ? "auto" : "none",
        borderWidth: isOpen ? "1px" : "0px",
        transition:
          "opacity 0.24s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), padding 0.24s ease, border-width 0.2s ease"
      };

  return (
    <aside aria-label="우측 페이지 내비게이션 사이드바" aria-hidden={!isOpen} style={drawerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--accent-primary)" }}>
          페이지 이동
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onToggleAdminPreview}
            style={{
              padding: "4px 8px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-canvas)",
              color: isAdminPreview ? "var(--accent-primary)" : "var(--text-muted)",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            관리자 {isAdminPreview ? "ON" : "OFF"}
          </button>
          {isCompact && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-canvas)",
                color: "var(--text-muted)",
                fontSize: "11px",
                cursor: "pointer"
              }}
            >
              닫기
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {visibleNavItems.map((item) => {
          const active = activePath === item.path;
          return (
            <div
              key={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "var(--radius-sm)",
                backgroundColor: active ? "rgba(56, 189, 248, 0.15)" : "transparent"
              }}
            >
              <button
                type="button"
                onClick={() => {
                  onNavigate(item.path);
                  if (isCompact) onClose();
                }}
                style={{
                  flex: 1,
                  textAlign: "left",
                  padding: "7px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  backgroundColor: "transparent",
                  color: active ? "var(--accent-secondary)" : "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer"
                }}
              >
                {item.label}
              </button>
              <a
                href={item.path}
                target="_blank"
                rel="noreferrer"
                title={`${item.label} 새 창으로 열기`}
                style={{
                  padding: "6px 8px",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  textDecoration: "none"
                }}
              >
                ↗
              </a>
            </div>
          );
        })}
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "10px",
          fontSize: "11px",
          color: "var(--text-muted)",
          lineHeight: 1.5
        }}
      >
        출처·검수 상태와 최종 확인 시각을 함께 표기하며, 법적 거래 허용·종 확정 동정·질병 진단은 별도 확인이 필요합니다.
      </div>
    </aside>
  );
};