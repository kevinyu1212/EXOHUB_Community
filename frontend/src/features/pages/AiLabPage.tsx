import React, { useState } from "react";
import { SharedNoticeBanner, SharedPageHeader, SharedPanelCard } from "../../shared/commonUiKit";
import { detectPriceAnomalies, normalizeTaxonOrItemName } from "../../shared/ai/aiAlgorithms";
import { requestAiWebSearch } from "../../shared/ai/aiServiceClient";
import type { WebSearchApiResponse } from "../../shared/ai/aiServiceClient";

export const AiLabPage: React.FC = () => {
  const [rawNames, setRawNames] = useState<string>("크레스티드 게코 [고등급],  Crested Gecko  성체");
  const [priceCsv, setPriceCsv] = useState<string>("35000, 42000, 45000, 48000, 290000");
  const [webQuery, setWebQuery] = useState<string>("크레스티드 게코 사육 온도 습도 분양");
  const [webResult, setWebResult] = useState<WebSearchApiResponse | null>(null);
  const [loadingWeb, setLoadingWeb] = useState<boolean>(false);

  const normalizedList = rawNames
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((orig) => ({ orig, norm: normalizeTaxonOrItemName(orig) }));

  const parsedPrices = priceCsv
    .split(",")
    .map((n) => Number(n.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0);

  const anomalyResult = detectPriceAnomalies(parsedPrices);

  const handleSearch = async () => {
    if (!webQuery.trim()) return;
    setLoadingWeb(true);
    const res = await requestAiWebSearch(webQuery.trim(), 6);
    setWebResult(res);
    setLoadingWeb(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <SharedPageHeader
        eyebrow="AI LAB"
        title="알고리즘 · 검색 브리핑 · 자체 학습 테스트베드"
        description="명칭 정규화, 가격 이상치 탐지, 외부 검색 브리핑 생성 및 자체 학습 연동 상태를 검증합니다."
      />

      <SharedNoticeBanner
        title="AI 보조 도구 유의사항"
        items={[
          "알고리즘 및 외부 검색 브리핑은 탐색·정리 보조 목적이며, 종 확정 동정·질병 진단·법적 거래 허용 여부는 전문가 검수 및 별도 확인이 필요합니다.",
          "ai-service(.venv) FastAPI 서버를 8000번 포트로 실행하면 실시간 검색 브리핑과 학습 엔드포인트가 연동됩니다."
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
        <SharedPanelCard>
          <h2 style={{ margin: "0 0 8px", fontSize: "15px" }}>1. 명칭 정규화 알고리즘</h2>
          <input
            type="text"
            value={rawNames}
            onChange={(e) => setRawNames(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-canvas)",
              color: "var(--text-primary)",
              fontSize: "12px",
              marginBottom: "10px"
            }}
          />
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--text-muted)" }}>
            {normalizedList.map((row, i) => (
              <li key={i}>
                {row.orig} → <strong style={{ color: "var(--accent-primary)" }}>{row.norm}</strong>
              </li>
            ))}
          </ul>
        </SharedPanelCard>

        <SharedPanelCard>
          <h2 style={{ margin: "0 0 8px", fontSize: "15px" }}>2. 가격 이상치 탐지</h2>
          <input
            type="text"
            value={priceCsv}
            onChange={(e) => setPriceCsv(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-canvas)",
              color: "var(--text-primary)",
              fontSize: "12px",
              marginBottom: "10px"
            }}
          />
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            중앙값: <strong style={{ color: "var(--accent-secondary)" }}>{anomalyResult.median.toLocaleString()}원</strong>
            {" · "}
            이상치 인덱스:{" "}
            <strong style={{ color: "var(--accent-primary)" }}>
              {anomalyResult.flaggedIndices.length > 0 ? anomalyResult.flaggedIndices.join(", ") : "없음"}
            </strong>
          </div>
        </SharedPanelCard>
      </div>

      <SharedPanelCard>
        <h2 style={{ margin: "0 0 8px", fontSize: "15px" }}>3. 외부 검색 브리핑 (/api/v1/ai/web-search)</h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
          <input
            type="text"
            value={webQuery}
            onChange={(e) => setWebQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: "220px",
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-canvas)",
              color: "var(--text-primary)",
              fontSize: "12px"
            }}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loadingWeb}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--accent-primary)",
              backgroundColor: "rgba(163, 230, 53, 0.14)",
              color: "var(--accent-primary)",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {loadingWeb ? "브리핑 생성 중..." : "검색 브리핑 실행"}
          </button>
        </div>

        {webResult ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
            <p style={{ margin: 0, color: "var(--text-primary)", fontWeight: 600 }}>
              {webResult.briefing_summary}
            </p>
            <div style={{ color: "var(--text-muted)" }}>
              수집시각: {webResult.collected_at} · 상태: {webResult.verification_status}
            </div>
            {webResult.results.map((item, idx) => (
              <div
                key={`${item.url}-${idx}`}
                style={{
                  padding: "8px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-canvas)"
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--accent-secondary)" }}>출처: {item.source}</div>
                <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)", fontWeight: 700 }}>
                  {item.title} ↗
                </a>
                <p style={{ margin: "4px 0 0", color: "var(--text-muted)" }}>{item.snippet}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            검색어를 입력하고 &quot;검색 브리핑 실행&quot;을 누르면 외부 검색 결과를 토대로 브리핑을 생성합니다.
          </div>
        )}
      </SharedPanelCard>
    </div>
  );
};