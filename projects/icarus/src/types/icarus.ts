export type IcarusStation = {
  id: string;
  name: string;
  description: string;
  icon: {
    unreal: string;
    assetPath: string;
    exists?: boolean;
  };
  experienceMultiplier: number;
};

export type IcarusItemLookupEntry = {
  id: string;
  displayName: string;
  icon: {
    unreal: string;
    assetPath: string;
    exists: boolean;
  };
};

export type IcarusItemLookupMap = Record<string, IcarusItemLookupEntry>;

export type IcarusQueryTag = {
  id: string;
  displayName: string;
  queryId: string;
  queryTags: string[];
  icon: {
    unreal: string;
    assetPath: string;
    exists: boolean;
  };
};

/** Item index entry — one per unique craftable item, used for the browse list. */
export type IcarusItemIndexEntry = {
  itemId: string;
  displayName: string;
  category: string;
  icon: {
    assetPath: string;
    exists: boolean;
  };
  recipeCount: number;
  stationIds: string[];
  /** Which released DLC/expansion introduced this item, if any. */
  requiredFeatureLevel?: string;
  /**
   * Which paid cosmetic pack this item belongs to, if any.
   * Derived from D_ItemsStatic Manual_Tags or _Workshop suffix.
   * Values: "ArtDeco" | "Industrial" | "Interior" | "Workshop" | ""
   */
  cosmeticPack?: string;
};

/** Category summary entry from categories.json */
export type IcarusCategory = {
  id: string;
  displayName: string;
  itemCount: number;
  representativeIcon: {
    assetPath: string;
    exists: boolean;
  };
};

export type IcarusItemInput = {
  kind: 'item';
  itemId: string;
  itemName: string;
  count: number;
};

export type IcarusQueryInput = {
  kind: 'query';
  tagId: string;
  displayName: string;
  count: number;
  queryTags: string[];
  candidateItemIds: string[];
};

export type IcarusResourceInput = {
  kind: 'resource';
  resource: string;
  count: number;
};

export type IcarusWorkflowEdge = {
  from: string;
  to: string;
  count: number;
  recipeId: string | null;
};

export type IcarusItemWorkflow = {
  rawMaterials: Array<{ itemId: string; count: number }>;
  /** All item IDs that appear as nodes in the dependency graph. */
  nodes: string[];
  /** All directed edges in the dependency graph (from ingredient → to output). */
  edges: IcarusWorkflowEdge[];
};

/** A single recipe that produces an item. */
export type IcarusItemRecipe = {
  recipeId: string;
  requiredMillijoules: number;
  stationIds: string[];
  inputs: IcarusItemInput[];
  queryInputs: IcarusQueryInput[];
  resourceInputs: IcarusResourceInput[];
  outputs: Array<{ itemId: string; itemName: string; count: number }>;
  workflow: IcarusItemWorkflow;
};

/** Full detail for a craftable item, including all its recipes. */
export type IcarusItemDetail = {
  itemId: string;
  displayName: string;
  category: string;
  icon: {
    assetPath: string;
    exists: boolean;
  };
  recipes: IcarusItemRecipe[];
  /** Which released DLC/expansion introduced this item, if any. */
  requiredFeatureLevel?: string;
  /** Which paid cosmetic pack this item belongs to (e.g. "Workshop", "ArtDeco"). */
  cosmeticPack?: string;
  /** Item description lore text from D_Itemable. */
  description?: string;
  /** Item flavour/lore text from D_Itemable. */
  flavorText?: string;
  /** Item weight in grams from D_Itemable. */
  weight?: number;
  /** Max stack size from D_Itemable. */
  maxStack?: number;
  /**
   * Normalised stat key→value map (display-ready labels).
   * e.g. { "Melee Damage": 45, "Durability": 200 }
   */
  stats?: Record<string, number | string>;
  /** Gameplay tags from Generated_Tags. */
  tags?: string[];
  /**
   * Workshop research + replication costs, if this item is a Workshop item.
   * null / undefined for regular craftable items.
   */
  workshopCosts?: {
    researchCost: WorkshopCostEntry[];
    replicationCost: WorkshopCostEntry[];
  } | null;
};

/** Contents of a per-first-letter chunk file (items/[letter].json). */
export type IcarusLetterChunk = Record<string, IcarusItemDetail>;

export type IcarusTierEntry = {
  id: string;
  name: string;
  iconUnreal: string;
  iconAssetPath: string;
  itemableRef: string;
  requiredLevel: number;
};

export type IcarusTierSection = {
  id: 'T2' | 'T3' | 'T4' | 'T5';
  name: string;
  entryCount: number;
  entries: IcarusTierEntry[];
};

// ── Workshop catalog types ────────────────────────────────────────────────────

/** One of the Workshop currencies (Ren, Exotics, Stabilized Exotics, etc.). */
export type WorkshopCurrencyDef = {
  displayName: string;
  /** Asset path relative to game-assets root (empty if no icon). */
  iconPath: string;
  /** Pre-tinted copy of iconPath colored to match the currency color. */
  coloredIconPath?: string;
  /** Game-native color as a CSS hex string, e.g. "#f8c944". */
  color: string;
};

/** A single currency cost entry in a Research or Replication cost list. */
export type WorkshopCostEntry = {
  currencyId: string;
  amount: number;
};

/** One item row from workshop-items.json. */
export type WorkshopItem = {
  workshopId: string;
  itemId: string;
  displayName: string;
  /**
   * Grouping key for display — shared by all variants of the same item type
   * (e.g. all axes across manufacturers/grades share setId "Meta_Axe").
   */
  setId: string;
  icon: { assetPath: string; exists: boolean };
  category: string;
  requiredFeatureLevel?: string;
  /** One-time Research cost to unlock this item in the Workshop. */
  researchCost: WorkshopCostEntry[];
  /** Per-acquisition Replication cost. */
  replicationCost: WorkshopCostEntry[];
};

/** Root shape of workshop-items.json. */
export type WorkshopData = {
  currencies: Record<string, WorkshopCurrencyDef>;
  items: WorkshopItem[];
};

// ── Tier progression types ────────────────────────────────────────────────────

/** One ingredient required to craft the gateway bench for a tier. */
export type TierProgressionIngredient = {
  itemId: string;
  displayName: string;
  count: number;
  /** Station where this ingredient is crafted, or null if hand-gathered. */
  stationId: string | null;
};

/** A prerequisite station that must exist to gather gateway ingredients. */
export type TierProgressionPrerequisite = {
  stationId: string;
  displayName: string;
  iconAssetPath: string;
};

/** The gateway bench (item) that unlocks a new tier. */
export type TierProgressionGateway = {
  itemId: string;
  displayName: string;
  /** Station where the gateway is crafted, or null if hand-crafted. */
  stationId: string | null;
};

/**
 * One step in the tier progression ladder (e.g. Tier 1 → Tier 2).
 * Sourced from public/data/<version>/tier-progression.json.
 */
export type TierProgressionStep = {
  tierId: string;
  fromTier: string;
  toTier: string;
  gateway: TierProgressionGateway;
  ingredients: TierProgressionIngredient[];
  prerequisites: TierProgressionPrerequisite[];
};

/**
 * Contents of raw-resources.json — a sorted list of item row names that can be
 * obtained directly from the game world (mining, harvesting, creature drops,
 * fishing, farm crops, tree chopping) without any crafting station.
 *
 * These are the terminal leaf nodes in any crafting dependency graph: an item
 * on this list is treated as "raw" even when a crafting recipe that produces it
 * also exists.
 */
export type RawResourcesData = string[];
