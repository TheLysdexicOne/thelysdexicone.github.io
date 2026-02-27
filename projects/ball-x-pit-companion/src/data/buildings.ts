// Building data utilities using extracted game data

export interface BuildingCost {
  gold?: number;
  wheat?: number;
  wood?: number;
  stone?: number;
}

export interface BuildingLevelProperties {
  Level: number;
  Properties: { [key: string]: number | string };
}

export interface BuildingData {
  Type: string;
  Name: string;
  Slug: string;
  Category: string;
  SubCategory: string;
  Description: string;
  ShortDescription: string;
  BuildDescription: string;
  UpgradeDescription: string;
  BuildCost: {
    Resources: {
      kGold?: number;
      kWheat?: number;
      kWood?: number;
      kStone?: number;
    };
  };
  BaseUpgradeCost: {
    Resources: {
      kGold?: number;
      kWheat?: number;
      kWood?: number;
      kStone?: number;
    };
  };
  NumLevels: number;
  PropertiesByLevel: BuildingLevelProperties[];
  StatBonusType: string | null;
  StatBonusAmountByLevel: number[];
  StatScalingType: string | null;
  TileSize: string;
  NumTiles: number;
}

export interface Building {
  id: string; // Same as slug for consistency
  type: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  buildDescription: string;
  upgradeDescription: string;
  category: string;
  subCategory: string;
  buildCost: BuildingCost;
  baseUpgradeCost: BuildingCost;
  numLevels: number;
  propertiesByLevel: BuildingLevelProperties[];
  statBonusType: string | null;
  statScalingType: string | null;
  tileSize: string;
  numTiles: number;
}

import buildingsDataJson from './json/buildings_data.json' assert { type: 'json' };

const buildingsData = buildingsDataJson as unknown as BuildingData[];

/**
 * Converts raw building data from game database to normalized Building type
 */
function normalizeBuilding(data: BuildingData): Building {
  return {
    id: data.Slug,
    type: data.Type,
    name: data.Name,
    slug: data.Slug,
    description: data.Description,
    shortDescription: data.ShortDescription,
    buildDescription: data.BuildDescription,
    upgradeDescription: data.UpgradeDescription,
    category: data.Category,
    subCategory: data.SubCategory,
    buildCost: {
      gold: data.BuildCost.Resources.kGold,
      wheat: data.BuildCost.Resources.kWheat,
      wood: data.BuildCost.Resources.kWood,
      stone: data.BuildCost.Resources.kStone,
    },
    baseUpgradeCost: {
      gold: data.BaseUpgradeCost.Resources.kGold,
      wheat: data.BaseUpgradeCost.Resources.kWheat,
      wood: data.BaseUpgradeCost.Resources.kWood,
      stone: data.BaseUpgradeCost.Resources.kStone,
    },
    numLevels: data.NumLevels,
    propertiesByLevel: data.PropertiesByLevel,
    statBonusType: data.StatBonusType,
    statScalingType: data.StatScalingType,
    tileSize: data.TileSize,
    numTiles: data.NumTiles,
  };
}

/**
 * Get all buildings (excludes ??? buildings)
 */
export function getAllBuildings(): Building[] {
  return buildingsData
    .filter(building => building.Name !== '???')
    .map(normalizeBuilding)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a specific building by slug
 */
export function getBuildingBySlug(slug: string): Building | undefined {
  const buildingData = buildingsData.find(
    b => b.Slug === slug && b.Name !== '???'
  );
  return buildingData ? normalizeBuilding(buildingData) : undefined;
}

/**
 * Get a specific building by ID (alias for getBuildingBySlug)
 */
export function getBuildingById(id: string): Building | undefined {
  return getBuildingBySlug(id);
}

/**
 * Get buildings by category
 */
export function getBuildingsByCategory(category: string): Building[] {
  return buildingsData
    .filter(b => b.Category === category && b.Name !== '???')
    .map(normalizeBuilding)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get buildings by subcategory
 */
export function getBuildingsBySubCategory(subCategory: string): Building[] {
  return buildingsData
    .filter(b => b.SubCategory === subCategory && b.Name !== '???')
    .map(normalizeBuilding)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Format building cost for display
 */
export function formatBuildingCost(cost: BuildingCost): string {
  const parts: string[] = [];
  if (cost.gold) parts.push(`${cost.gold} Gold`);
  if (cost.wheat) parts.push(`${cost.wheat} Wheat`);
  if (cost.wood) parts.push(`${cost.wood} Wood`);
  if (cost.stone) parts.push(`${cost.stone} Stone`);
  return parts.join(', ');
}
