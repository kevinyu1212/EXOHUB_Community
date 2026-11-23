import React from "react";
import type { CommonCardItem } from "../commonTypes";
import { TrustMetaBar } from "./TrustMetaBar";

interface ListingCardShellProps {
  item: CommonCardItem;
  onSelect?: (id: string) => void;
}

const AVAILABILITY_LABEL: Record<CommonCardItem["availabilityStatus"], string> = {
  AVAILABLE: "판매중",
  RESERVED: "예약중",
  SOLD_OUT: "품절",
  ENDED: "종료"
};

export const ListingCardShell: React.FC<ListingCardShellProps> = ({ item, onSelect }) => {
  const statusColor =
    item.availabilityStatus === "AVAILABLE"
      ? "var(--accent-primary)"
      : item.availabilityStatus === "RESERVED"
      ? "var(--accent-secondary)"
      : "var(--text-muted)";

  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "92px minmax(0, 1fr)",
        gap: "14px",
        padding: "16px",
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        alignItems: "start"
      }}
    >
      {/* 스토어 카드형 좌측 썸네일/분류 프리뷰 슬롯 */}
      <div
        aria-hidden="true"
        style={{
          width: "92px",
          height: "92px",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--bg-canvas)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          padding: "6px",
          textAlign: "center"
        }}
      >
        <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--accent-secondary)" }}>
          EXOHUB
        </span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.25 }}>
          {item.taxonName ? "개체·품목" : "상품"}
        </span>
      </div>

      {/* 우측 본문: 제목/상태 · 가격/배송비 · 옵션/판매처 · 출처/액션 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1.35 }}>{item.title}</div>
            {item.taxonName && (
              <div style={{ fontSize: "12px", color: "var(--accent-secondary)", marginTop: "2px" }}>
                분류: {item.taxonName}
              </div>
            )}
          </div>
          <span
            style={{
              flexShrink: 0,
              fontSize: "11px",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: "999px",
              border: `1px solid ${statusColor}`,
              color: statusColor
            }}
          >
            {AVAILABILITY_LABEL[item.availabilityStatus]}
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px" }}>
          <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-primary)" }}>
            {item.priceLabel}
          </span>
          {item.shippingLabel && (
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.shippingLabel}</span>
          )}
        </div>

        {(item.optionSummary || item.sellerName) && (
          <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.45 }}>
            {item.optionSummary && <span>옵션: {item.optionSummary}</span>}
            {item.optionSummary && item.sellerName && <span> · </span>}
            {item.sellerName && <span>판매처: {item.sellerName}</span>}
          </div>
        )}

        <TrustMetaBar trust={item.trust} />

        <div style={{ display: "flex", gap: "8px", marginTop: "2px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => onSelect?.(item.id)}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-canvas)",
              color: "var(--text-primary)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            상세 보기
          </button>
          {item.externalUrl && (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--accent-secondary)",
                color: "var(--accent-secondary)",
                fontSize: "12px",
                fontWeight: 600
              }}
            >
              원문 이동
            </a>
          )}
        </div>
      </div>
    </article>
  );
};