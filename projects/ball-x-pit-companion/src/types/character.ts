// Character data types from game database extraction

export interface CharacterStats {
  kEndurance: number;
  kStrength: number;
  kLeadership: number;
  kSpeed: number;
  kDexterity: number;
  kIntelligence: number;
}

export interface CharacterData {
  Type: string;
  Name: string;
  Slug: string;
  FlavorDescription: string;
  GameplayDescription: string;
  StarterUpgrade: string;
  Stats: CharacterStats;
  Props: string[];
  WidgetOffset: string;
  WidgetOverlaySize: string;
  WidgetOverlayPos: string;
  WidgetXPSize: string;
  WidgetXPPos: string;
}

// Normalized character for UI display
export interface Character {
  id: string; // slug
  name: string;
  slug: string;
  type: string;
  flavorDescription: string;
  gameplayDescription: string;
  starterUpgrade: string; // ball slug
  stats: CharacterStats;
  props: string[]; // special properties/traits
}
