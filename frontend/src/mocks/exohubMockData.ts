import type { CategoryCode, CommonCardItem, TrustMetadata } from "../shared";

export type CafeBoardTab = "ALL" | "MARKET_PRICE" | "CARE_BREED" | "QNA_TIPS" | "COLLECTION";

export interface CafeFeedItem {
  id: string;
  board: Exclude<CafeBoardTab, "ALL">;
  boardLabel: string;
  categoryCode: CategoryCode;
  categoryLabel: string;
  title: string;
  excerpt: string;
  authorOrSource: string;
  postedAt: string;
  metricTag?: string;
  cardItem?: CommonCardItem;
  trust?: TrustMetadata;
  targetPath: string;
}

export interface TaxonAtlasMock {
  id: string;
  korean: string;
  scientific: string;
  alias: string;
  categoryCode: CategoryCode;
  categoryLabel: string;
  habitat: string;
  careNote: string;
  trust: TrustMetadata;
}

export interface CareLogMock {
  id: string;
  title: string;
  summary: string;
}

export const MOCK_CAFE_FEED_ITEMS: CafeFeedItem[] = [
  {
    id: "cf-1",
    board: "MARKET_PRICE",
    boardLabel: "분양·가격 비교",
    categoryCode: "REPTILE",
    categoryLabel: "파충류",
    title: "크레스티드 게코 개체 분양(목업) · 배송비 포함 총액 비교",
    excerpt: "암컷 · 준성체 · CB · 등급 A 기준 판매처 및 옵션별 비교를 위한 목업 카드입니다.",
    authorOrSource: "목업 브리더 샵",
    postedAt: "13:20",
    metricTag: "7일 중앙값 175,000원",
    targetPath: "/price",
    cardItem: {
      id: "lst-201",
      title: "크레스티드 게코 개체 분양(목업)",
      taxonName: "Correlophus ciliatus",
      sellerName: "목업 브리더 샵",
      priceLabel: "185,000원",
      shippingLabel: "총 189,000원",
      optionSummary: "암컷 · 준성체 · CB · 등급 A",
      availabilityStatus: "AVAILABLE",
      trust: {
        sourceName: "목업 판매처 등록",
        verificationStatus: "VERIFIED",
        lastCheckedAt: "2026-11-19 13:20"
      }
    }
  },
  {
    id: "cf-2",
    board: "CARE_BREED",
    boardLabel: "사육·번식·수조 일지",
    categoryCode: "ARTHROPOD",
    categoryLabel: "절지류",
    title: "[절지류 일지] 그린보틀블루 탈피 전후 은신처·습도 체크 메모(목업)",
    excerpt: "개체 크기와 사육장 환경 기록을 남긴 목업 일지입니다. 종·개체 상태에 따라 환경 조건은 달라질 수 있습니다.",
    authorOrSource: "목업 사육자",
    postedAt: "12:40",
    metricTag: "탈피·환경 로그",
    targetPath: "/care",
    trust: {
      sourceName: "목업 분류·사육 시드",
      verificationStatus: "PENDING_REVIEW",
      lastCheckedAt: "2026-11-19 12:40"
    }
  },
  {
    id: "cf-3",
    board: "QNA_TIPS",
    boardLabel: "질문·사육 노하우",
    categoryCode: "INSECT",
    categoryLabel: "곤충",
    title: "[질문/노하우] 왕사슴벌레 누대 사육 시 산란목·균사 상태 점검 기준(목업)",
    excerpt: "도감의 생물학적 정보와 사육 경험담을 구분해 기록하고, 출처·검수 상태를 함께 확인하는 목업 글입니다.",
    authorOrSource: "목업 번식자",
    postedAt: "11:50",
    metricTag: "도감·사육 연결",
    targetPath: "/taxa",
    trust: {
      sourceName: "목업 도감 검수 큐",
      verificationStatus: "VERIFIED",
      lastCheckedAt: "2026-11-19 11:50"
    }
  },
  {
    id: "cf-4",
    board: "COLLECTION",
    boardLabel: "표본·박제 컬렉션",
    categoryCode: "SPECIMEN",
    categoryLabel: "곤충표본·자연사 표본",
    title: "[표본 #SP-001] 전족 건조표본 라벨·보관함 환경 이력(목업)",
    excerpt: "표본 유형·라벨·보존 상태 및 출처 기록을 함께 관리하며, 합법적 취득 여부는 별도 확인이 필요합니다.",
    authorOrSource: "목업 표본 수집가",
    postedAt: "11:15",
    metricTag: "출처 기록 첨부",
    targetPath: "/collection",
    trust: {
      sourceName: "목업 수집가 컬렉션",
      verificationStatus: "PENDING_REVIEW",
      lastCheckedAt: "2026-11-19 11:15"
    }
  },
  {
    id: "cf-5",
    board: "CARE_BREED",
    boardLabel: "사육·번식·수조 일지",
    categoryCode: "AQUATIC",
    categoryLabel: "물생활",
    title: "[수조 기록] 새우·수초 혼영 수조 환수 주기 및 수온·수질 메모(목업)",
    excerpt: "수온·pH·환수 기록을 남긴 목업 로그입니다. 개별 수조 생태계에 따라 수치가 달라질 수 있습니다.",
    authorOrSource: "목업 사육자",
    postedAt: "10:45",
    metricTag: "수질·환수 메모",
    targetPath: "/care",
    trust: {
      sourceName: "목업 사육 기록",
      verificationStatus: "PENDING_REVIEW",
      lastCheckedAt: "2026-11-19 10:45"
    }
  },
  {
    id: "cf-6",
    board: "MARKET_PRICE",
    boardLabel: "분양·가격 비교",
    categoryCode: "AQUATIC",
    categoryLabel: "물생활",
    title: "수조 온습도·조명 컨트롤러 세트(목업)",
    excerpt: "장비 규격과 배송비 포함 총액, 최종 확인 시각을 함께 표시하는 목업 카드입니다.",
    authorOrSource: "목업 장비 스토어",
    postedAt: "09:00",
    metricTag: "신품 · 2채널",
    targetPath: "/market",
    cardItem: {
      id: "lst-202",
      title: "수조 온습도·조명 컨트롤러 세트(목업)",
      taxonName: "공통 사육·수조 장비",
      sellerName: "목업 장비 스토어",
      priceLabel: "64,000원",
      shippingLabel: "총 67,000원",
      optionSummary: "신품 · 2채널 · 보증 1년",
      availabilityStatus: "RESERVED",
      trust: {
        sourceName: "목업 외부 링크 시세",
        verificationStatus: "PENDING_REVIEW",
        lastCheckedAt: "2026-11-18 09:00",
        staleWarning: true
      }
    }
  },
  {
    id: "cf-7",
    board: "COLLECTION",
    boardLabel: "표본·박제 컬렉션",
    categoryCode: "TAXIDERMY",
    categoryLabel: "박제·박제 관련",
    title: "[박제 #TX-001] 전시용 박제 개체 증빙·컨디션 시트(목업)",
    excerpt: "박제·야생동물 유래 대상은 법적 근거와 취득 증빙 확인이 필요하며, 미확인 시 공개 거래가 제한될 수 있습니다.",
    authorOrSource: "목업 법적·출처 검수 큐",
    postedAt: "09:30",
    metricTag: "법적 증빙 검수 대기",
    targetPath: "/collection",
    trust: {
      sourceName: "목업 법적·출처 검수 큐",
      verificationStatus: "UNVERIFIED",
      lastCheckedAt: "2026-11-19 09:30",
      staleWarning: true
    }
  },
  {
    id: "cf-8",
    board: "QNA_TIPS",
    boardLabel: "질문·사육 노하우",
    categoryCode: "AMPHIBIAN",
    categoryLabel: "양서류",
    title: "[양서류 안내] 서식 환경·사육 난이도 확인 시 출처·검수 배지 보는 법(목업)",
    excerpt: "분류군 상세와 커뮤니티 글을 연결해 참고 정보를 모으되, 종 확정 동정이나 질병 진단은 별도 확인이 필요합니다.",
    authorOrSource: "목업 도감 안내",
    postedAt: "08:20",
    metricTag: "도감·커뮤니티 연계",
    targetPath: "/taxa",
    trust: {
      sourceName: "목업 분류·사육 시드",
      verificationStatus: "VERIFIED",
      lastCheckedAt: "2026-11-19 08:20"
    }
  }
];

export const MOCK_TAXA_SAMPLES: TaxonAtlasMock[] = [
  {
    id: "tx-1",
    korean: "크레스티드 게코",
    scientific: "Correlophus ciliatus",
    alias: "릴리화이트 · 할리퀸",
    categoryCode: "REPTILE",
    categoryLabel: "파충류",
    habitat: "뉴칼레도니아 · 수목성/야행성",
    careNote: "종·개체 상태별 온습도 및 사육 난이도 참고",
    trust: {
      sourceName: "목업 도감 검수 큐",
      verificationStatus: "VERIFIED",
      lastCheckedAt: "2026-11-19 13:40"
    }
  },
  {
    id: "tx-2",
    korean: "그린보틀블루 타란툴라",
    scientific: "Chromatopelma cyaneopubescens",
    alias: "GBB",
    categoryCode: "ARTHROPOD",
    categoryLabel: "절지류",
    habitat: "베네수엘라 건조 관목지",
    careNote: "건조·환기 및 탈피기 관찰 기록 연계",
    trust: {
      sourceName: "목업 분류·사육 시드",
      verificationStatus: "VERIFIED",
      lastCheckedAt: "2026-11-19 13:40"
    }
  }
];

export const MOCK_PRICE_SAMPLE_CARD: CommonCardItem = {
  id: "pr-1",
  title: "크레스티드 게코 개체 분양(목업)",
  taxonName: "Correlophus ciliatus",
  sellerName: "목업 브리더 샵",
  priceLabel: "185,000원",
  shippingLabel: "배송비 4,000원 · 총 189,000원",
  optionSummary: "암컷 · 준성체 · CB · 등급 A",
  availabilityStatus: "AVAILABLE",
  trust: {
    sourceName: "목업 판매처 직접 등록",
    verificationStatus: "VERIFIED",
    lastCheckedAt: "2026-11-19 13:20"
  }
};

export const MOCK_MARKET_SAMPLE_CARD: CommonCardItem = {
  id: "mk-1",
  title: "수조 온습도·조명 컨트롤러 세트(목업)",
  taxonName: "물생활 · 사육장 장비",
  sellerName: "목업 장비 스토어",
  priceLabel: "64,000원",
  shippingLabel: "배송비 3,000원 · 총 67,000원",
  optionSummary: "신품 · 2채널 · 보증 1년",
  availabilityStatus: "AVAILABLE",
  trust: {
    sourceName: "목업 외부 링크 시세",
    verificationStatus: "PENDING_REVIEW",
    lastCheckedAt: "2026-11-19 12:00"
  }
};

export const MOCK_CARE_LOGS: CareLogMock[] = [
  {
    id: "care-log-1",
    title: "사육장·개체 로그(목업)",
    summary: "급이·탈피·체중 및 번식/클러치 이력을 타임라인으로 기록합니다."
  },
  {
    id: "care-log-2",
    title: "물생활 수조 로그(목업)",
    summary: "수온·pH·환수 및 수조 개체/수초 관리 이력을 기록합니다."
  }
];

export const MOCK_COLLECTION_TRUST: TrustMetadata = {
  sourceName: "목업 수집가·법적 검수 큐",
  verificationStatus: "PENDING_REVIEW",
  lastCheckedAt: "2026-11-19 11:15"
};