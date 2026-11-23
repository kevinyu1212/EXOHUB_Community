import type { CategoryCode, CommonCardItem } from "../commonTypes";

export function normalizeTaxonOrItemName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\[\]()【】·/\\_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCardFieldString(item: CommonCardItem, keys: string[]): string {
  const rec = item as unknown as Record<string, unknown>;
  for (const key of keys) {
    const val = rec[key];
    if (typeof val === "string" && val.trim().length > 0) {
      return val;
    }
  }
  return "";
}

function getCardFieldBoolean(item: CommonCardItem, keys: string[]): boolean {
  const rec = item as unknown as Record<string, unknown>;
  for (const key of keys) {
    const val = rec[key];
    if (typeof val === "boolean") {
      return val;
    }
    if (typeof val === "string" && /verified|검수|승인/i.test(val)) {
      return true;
    }
  }
  return false;
}

export function recommendFeedItems(
  items: CommonCardItem[],
  preferredCategory: CategoryCode | "ALL",
  keyword = "",
  limit = 4
): CommonCardItem[] {
  const normKeyword = normalizeTaxonOrItemName(keyword);

  const scored = items.map((item) => {
    let score = 0;
    const itemCategory = getCardFieldString(item, ["categoryCode", "category", "categoryLabel"]);
    if (
      preferredCategory !== "ALL" &&
      itemCategory.toUpperCase() === String(preferredCategory).toUpperCase()
    ) {
      score += 4;
    }
    if (getCardFieldBoolean(item, ["isVerified", "verified", "verificationStatus"])) {
      score += 2;
    }
    if (normKeyword.length > 0) {
      const extraText = getCardFieldString(item, [
        "subtitle",
        "summary",
        "description",
        "sourceLabel",
        "sourceName",
        "badgeText"
      ]);
      const hay = normalizeTaxonOrItemName(`${item.title} ${extraText}`);
      if (hay.includes(normKeyword)) {
        score += 5;
      }
    }
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((entry) => entry.item);
}

export function detectPriceAnomalies(prices: number[]): {
  median: number;
  flaggedIndices: number[];
} {
  if (prices.length === 0) {
    return { median: 0, flaggedIndices: [] };
  }
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  const flaggedIndices: number[] = [];
  if (median > 0) {
    prices.forEach((p, idx) => {
      if (p < median * 0.45 || p > median * 2.2) {
        flaggedIndices.push(idx);
      }
    });
  }
  return { median, flaggedIndices };
}

export function generateLocalChatReply(
  prompt: string,
  contextPath: string
): {
  reply: string;
  quickRoutes: Array<{ path: string; label: string }>;
} {
  const q = prompt.trim();
  if (!q) {
    return {
      reply: `현재 '${contextPath}' 화면에 계십니다. 생물 도감, 시세/가격 비교, 사육·수조 기록, 표본 컬렉션 중 궁금한 주제를 입력해 주세요.`,
      quickRoutes: [
        { path: "/taxa", label: "생물 도감" },
        { path: "/price", label: "가격 비교" },
        { path: "/care", label: "사육 관리" }
      ]
    };
  }

  if (/가격|시세|분양|사료|장비|할인/.test(q)) {
    return {
      reply: `"${q}" 관련 상품·시세 흐름은 가격 비교(/price)와 마켓(/market)에서 출처 및 검수 상태와 함께 비교할 수 있습니다. 이상치·중복 항목은 관리자 검수 기준으로 확인하세요.`,
      quickRoutes: [
        { path: "/price", label: "가격 비교 열기" },
        { path: "/market", label: "마켓 열기" },
        { path: "/ai-lab", label: "AI LAB 보기" }
      ]
    };
  }

  if (/사육|수조|사육장|온도|습도|탈피|번식|표본|박제/.test(q)) {
    return {
      reply: `"${q}" 관련 개체·수조·환경 기록은 사육 관리(/care)에서, 보관 및 증빙 내역은 표본·박제 컬렉션(/collection)에서 기록하고 확인할 수 있습니다.`,
      quickRoutes: [
        { path: "/care", label: "사육 관리 열기" },
        { path: "/collection", label: "표본·박제 열기" },
        { path: "/community", label: "커뮤니티 보기" }
      ]
    };
  }

  return {
    reply: `"${q}"에 대한 종 정보·유사종 비교는 생물 도감(/taxa)과 통합 검색(/search)에서 확인하실 수 있습니다. 종 확정 동정, 질병 진단, 법적 거래 가능 여부는 AI가 단독 확정하지 않고 전문가 검수 및 관련 법령 확인이 필요합니다.`,
    quickRoutes: [
      { path: "/taxa", label: "생물 도감 열기" },
      { path: "/search", label: "통합 검색 열기" },
      { path: "/ai-lab", label: "AI LAB 보기" }
    ]
  };
}