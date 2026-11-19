export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errorCode: string | null;
  message: string | null;
  timestamp: string;
}

export type DomainCategoryCode =
  | "REPTILE"
  | "AMPHIBIAN"
  | "ARTHROPOD"
  | "INSECT"
  | "AQUATIC"
  | "SMALL_MAMMAL"
  | "SPECIMEN"
  | "TAXIDERMY";

export interface DomainModuleSummary {
  key: string;
  title: string;
  subtitle: string;
  routePath: string;
}
