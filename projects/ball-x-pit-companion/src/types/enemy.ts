// Enemy data types from game database extraction

export interface EnemyLevelVariant {
  DisplayName: string;
  LevelEnemyIndex: number;
  IconName: string;
  MeshControllerName: string;
}

export interface EnemyData {
  Type: string;
  Name: string;
  Slug: string;
  Description: string;
  GridWidth: number;
  GridHeight: number;
  HealthScale: number;
  SpeedMultiplier: number;
  ShadowScale: string;
  ShadowPlacement: string;
  ShadowCreatePlacement: string;
  DisplayName: string;
  LevelVariants: {
    [levelType: string]: EnemyLevelVariant;
  };
}

// Normalized enemy template (before level-specific customization)
export interface EnemyTemplate {
  id: string; // slug
  type: string;
  name: string;
  slug: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  healthScale: number;
  speedMultiplier: number;
  displayName: string;
  levelVariants: {
    [levelType: string]: EnemyLevelVariant;
  };
}

// Resolved enemy variant for a specific level
export interface EnemyVariant {
  templateSlug: string; // e.g., 'lvl_default'
  templateName: string; // e.g., 'Default'
  levelSlug: string; // e.g., 'kSnowy'
  levelType: string; // e.g., 'kSnowy'
  displayName: string; // e.g., 'Icebound Warrior'
  iconName: string;
  gridWidth: number;
  gridHeight: number;
  healthScale: number;
  speedMultiplier: number;
  description: string;
}
