export interface FieldGuideRecipeIngredient {
  itemId: string;
  name: string;
  quantity: number;
}

export interface FieldGuideCraftedInStation {
  stationId: string;
  stationName: string;
}

export interface FieldGuideItemEntryCore<
  TSource extends Record<string, string | null | undefined> = Record<
    string,
    string | null | undefined
  >,
> {
  id: string;
  slug: string;
  name: string;
  description: string;
  rarity: string;
  tags: string[];
  isCraftable: boolean;
  craftedIn?: FieldGuideCraftedInStation | null;
  recipe: FieldGuideRecipeIngredient[];
  obtainMethods: string[];
  iconPath?: string | null;
  source: TSource;
}

export interface FieldGuideItemDataset<TEntry> {
  version: string;
  generatedAt: string;
  entries: TEntry[];
}