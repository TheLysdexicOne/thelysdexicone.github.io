import { projectAssetPath } from "@/lib/lore";
import type { ConanMapName } from "@/lib/lore";
import type {
  FieldGuideCraftedInStation,
  FieldGuideItemDataset,
  FieldGuideItemEntryCore,
  FieldGuideRecipeIngredient,
} from "../../../../shared/types/field-guide";

export type ItemRecipeIngredient = FieldGuideRecipeIngredient;

export type CraftedInStation = FieldGuideCraftedInStation;

export interface ItemSourceRefs
  extends Record<string, string | null | undefined> {
  itemTable: string;
  featTable?: string | null;
}

export type ItemEntry = FieldGuideItemEntryCore<ItemSourceRefs> & {
  itemType: string;
  sortLabel: string;
  mapAvailability: ConanMapName;
};

export type ItemDataset = FieldGuideItemDataset<ItemEntry>;

export interface CategoryIconEntry {
  categoryName: string;
  filterIconName: string;
  iconPath: string;
  iconSource: string;
}

export interface CategoryIconDataset {
  version: string;
  generatedAt: string;
  description?: string;
  categoryIcons: Record<string, CategoryIconEntry>;
}

// Build a project-relative items dataset URL that respects the site's basePath.
export function itemDatasetPath(): string {
  return projectAssetPath("/data/items.json");
}

// Build a project-relative category icon dataset URL that respects the site's basePath.
export function categoryIconDatasetPath(): string {
  return projectAssetPath("/data/category_icons.json");
}