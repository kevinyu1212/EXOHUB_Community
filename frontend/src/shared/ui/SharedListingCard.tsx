import React from "react";
import type { CommonCardItem } from "../commonTypes";
import { ListingCardShell } from "./ListingCardShell";

export const SharedListingCard: React.FC<{
  item: CommonCardItem;
  onSelect?: (id: string) => void;
}> = ({ item, onSelect }) => <ListingCardShell item={item} onSelect={onSelect} />;