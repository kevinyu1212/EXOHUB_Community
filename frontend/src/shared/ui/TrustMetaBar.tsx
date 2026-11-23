import React from "react";
import type { TrustMetadata } from "../commonTypes";

interface TrustMetaBarProps {
  trust: TrustMetadata;
}

const STATUS_LABEL: Record<TrustMetadata["verificationStatus"], string> = {
  VERIFIED: "검증 완료",
  PENDING_REVIEW: "검수 대기",
  UNVERIFIED: "미검수"
};

export const TrustMetaBar: React.FC<TrustMetaBarProps> = ({ trust }) => {
  const badgeColor =
    trust.verificationStatus === "VERIFIED"
      ? "var(--accent-primary)"
      : trust.verificationStatus === "PENDING_REVIEW"
      ? "var(--accent-secondary)"
      : "var(--text-muted)";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", fontSize: "12px" }}>
      <span
        style={{
          padding: "2px 8px",
          borderRadius: "999px",
          border: `1px solid ${badgeColor}`,
          color: badgeColor,
          fontWeight: 600
        }}
      >
        {STATUS_LABEL[trust.verificationStatus]}
      </span>
      <span style={{ color: "var(--text-muted)" }}>출처: {trust.sourceName}</span>
      <span style={{ color: "var(--text-muted)" }}>확인: {trust.lastCheckedAt}</span>
      {trust.staleWarning && (
        <span style={{ color: "#FBBF24", fontWeight: 600 }}>
          · 오래된 데이터(현재가·확정 정보 주의)
        </span>
      )}
    </div>
  );
};