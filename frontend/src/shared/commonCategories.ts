import type { CategoryMeta, NavItemMeta } from "./commonTypes";

export const CATEGORY_LIST: CategoryMeta[] = [
  { code: "REPTILE", label: "파충류", examples: "게코류 · 스킨크류 · 뱀 · 거북" },
  { code: "AMPHIBIAN", label: "양서류", examples: "개구리 · 두꺼비 · 도롱뇽 · 영원" },
  { code: "ARTHROPOD", label: "절지류", examples: "타란툴라 · 전갈 · 지네 · 노래기 · 등각류" },
  { code: "INSECT", label: "곤충", examples: "사슴벌레 · 장수풍뎅이 · 사마귀 · 대벌레" },
  { code: "AQUATIC", label: "물생활", examples: "관상어 · 새우 · 가재 · 수초 · 수조 장비" },
  { code: "SMALL_PET", label: "기타 소동물", examples: "햄스터 · 저빌 · 고슴도치 · 소형 포유류" },
  { code: "SPECIMEN", label: "곤충표본·자연사 표본", examples: "건조표본 · 액침표본 · 전시/교육 표본" },
  { code: "TAXIDERMY", label: "박제·박제 관련", examples: "박제 · 골격 · 탈피각 · 증빙 검수 대상" }
];

export const COMMON_NAV_ITEMS: NavItemMeta[] = [
  { id: "home", label: "홈", path: "/" },
  { id: "taxa", label: "생물 도감", path: "/taxa" },
  { id: "price", label: "가격 비교", path: "/price" },
  { id: "market", label: "마켓", path: "/market" },
  { id: "care", label: "사육 관리", path: "/care" },
  { id: "collection", label: "표본·박제 컬렉션", path: "/collection" },
  { id: "community", label: "커뮤니티", path: "/community" },
  { id: "ai-lab", label: "AI LAB", path: "/ai-lab" },
  { id: "me", label: "마이페이지", path: "/me" },
  { id: "admin", label: "관리자", path: "/admin", adminOnly: true }
];