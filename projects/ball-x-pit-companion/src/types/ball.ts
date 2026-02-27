// Ball data types from game database extraction

export interface BallProperties {
  [key: string]: number | string;
}

export interface BallLevelProperties {
  Level: number;
  Properties: BallProperties;
}

export interface BallData {
  Type: string;
  Name: string;
  Slug: string;
  Description: string;
  IsInGame?: boolean; // Optional because not all entries have it
  MinVersion?: number; // Optional
  Properties: BallProperties;
  PropertiesByLevel: BallLevelProperties[];
  EvolutionSlugs: string[];
  MergeComponents: string[][];
  IsSpawner?: boolean;
  IsMosquitoSpawner?: boolean;
  IsGlacier?: boolean;
  IsAOE?: boolean;
  IsStatusEffect?: boolean;
  BallColor: string;
  DamageType: string;
  RotationType: string;
  RotationSpeed: number;
  HitEffects: string[];
  AOETypes: string[];
  Specials: string[];
  IconPriority?: number;
  IconColorList: string[];
  VFXColorList: string[];
  MatTextureColorList?: string[]; // Optional property found in actual data
}

// Normalized ball for UI display
export interface Ball {
  id: string; // slug
  name: string;
  slug: string;
  type: string;
  description: string;
  isInGame: boolean;

  // Levels 1-3 (game only uses first 3)
  level1: BallProperties;
  level2: BallProperties;
  level3: BallProperties;

  // Evolution and fusion
  evolvesInto: string[]; // slugs
  fusionRecipe: string[][]; // array of component slug arrays

  // Visual
  ballColor: string;
  damageType: string;
  hitEffects: string[];
  aoeTypes: string[];
  specials: string[];
  isSpawner?: boolean;
  isMosquitoSpawner?: boolean;
  isGlacier?: boolean;
  isAOE?: boolean;
  isStatusEffect?: boolean;
  iconColorList: string[];
}

// Filter and sort options
export type BallSortOption = 'name' | 'type' | 'tier';
export type BallFilterType = 'all' | 'basic' | 'fusion' | 'evolution';
export type DamageTypeFilter =
  | 'all'
  | 'fire'
  | 'ice'
  | 'lightning'
  | 'poison'
  | 'normal'
  | 'other';
