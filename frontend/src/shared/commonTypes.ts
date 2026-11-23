export type CategoryCode =
  | "REPTILE"
  | "AMPHIBIAN"
  | "ARTHROPOD"
  | "INSECT"
  | "AQUATIC"
  | "SMALL_PET"
  | "SPECIMEN"
  | "TAXIDERMY";

export interface CategoryMeta {
  code: CategoryCode;
  label: string;
  examples: string;
}

export interface NavItemMeta {
  id: string;
  label: string;
  path: string;
  adminOnly?: boolean;
}

export interface TrustMetadata {
  sourceName: string;
  verificationStatus: "VERIFIED" | "PENDING_REVIEW" | "UNVERIFIED";
  lastCheckedAt: string;
  staleWarning?: boolean;
}

export interface CommonCardItem {
  id: string;
  title: string;
  taxonName?: string;
  sellerName?: string;
  priceLabel: string;
  shippingLabel?: string;
  optionSummary?: string;
  availabilityStatus: "AVAILABLE" | "RESERVED" | "SOLD_OUT" | "ENDED";
  trust: TrustMetadata;
  externalUrl?: string;
}