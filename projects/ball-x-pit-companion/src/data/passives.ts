// Passive item data utilities using extracted game data

export interface PassiveStats {
  [key: string]: number | string;
}

export interface PassivePropertiesByLevel {
  Level: number;
  Properties: PassiveStats;
}

export interface PassiveData {
  Type: string;
  Name: string;
  Slug: string;
  Description: string;
  Properties: PassiveStats;
  PropertiesByLevel?: PassivePropertiesByLevel[];
  EvolutionSlugs?: string[];
  MergeComponents?: string[];
  MainColor?: string;
  IconColorList?: string[];
  Rarity: string;
  Stats: PassiveStats;
  Tags: string[];
}

export interface Passive {
  id: string; // Same as slug for consistency
  type: string;
  name: string;
  slug: string;
  description: string;
  rarity: string;
  stats: PassiveStats;
  tags: string[];
  properties: PassiveStats;
  propertiesByLevel?: { level: number; properties: PassiveStats }[];
  evolutionSlugs?: string[];
  mergeComponents?: string[];
  mainColor?: string;
  iconColorList?: string[];
}

import passivesDataJson from './json/passives_data.json' assert { type: 'json' };

const passivesData = passivesDataJson as unknown as PassiveData[];

/**
 * Converts raw passive data from game database to normalized Passive type
 */
function normalizePassive(data: PassiveData): Passive {
  return {
    id: data.Slug,
    type: data.Type,
    name: data.Name,
    slug: data.Slug,
    description: data.Description,
    rarity: data.Rarity,
    stats: data.Stats,
    tags: data.Tags,
    properties: data.Properties,
    propertiesByLevel: data.PropertiesByLevel?.map(level => ({
      level: level.Level,
      properties: level.Properties,
    })),
    evolutionSlugs: data.EvolutionSlugs,
    mergeComponents: data.MergeComponents,
    mainColor: data.MainColor,
    iconColorList: data.IconColorList,
  };
}

/**
 * Get all passives (excludes ??? passives)
 */
export function getAllPassives(): Passive[] {
  return passivesData
    .filter(passive => passive.Name !== '???')
    .map(normalizePassive)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get basic passives (no merge components)
 */
export function getBasicPassives(): Passive[] {
  return passivesData
    .filter(
      passive =>
        passive.Name !== '???' &&
        (!passive.MergeComponents || passive.MergeComponents.length === 0)
    )
    .map(normalizePassive)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get merged passives (has merge components)
 */
export function getMergedPassives(): Passive[] {
  return passivesData
    .filter(
      passive =>
        passive.Name !== '???' &&
        passive.MergeComponents &&
        passive.MergeComponents.length > 0
    )
    .map(normalizePassive)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a specific passive by slug
 */
export function getPassiveBySlug(slug: string): Passive | undefined {
  const passiveData = passivesData.find(
    p => p.Slug === slug && p.Name !== '???'
  );
  return passiveData ? normalizePassive(passiveData) : undefined;
}

/**
 * Get a specific passive by ID (alias for getPassiveBySlug)
 */
export function getPassiveById(id: string): Passive | undefined {
  return getPassiveBySlug(id);
}

/**
 * Get passives by rarity
 */
export function getPassivesByRarity(rarity: string): Passive[] {
  return passivesData
    .filter(p => p.Rarity === rarity && p.Name !== '???')
    .map(normalizePassive)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get passives by tag
 */
export function getPassivesByTag(tag: string): Passive[] {
  return passivesData
    .filter(p => p.Tags.includes(tag) && p.Name !== '???')
    .map(normalizePassive)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Format description with stat values
 */
export function formatPassiveDescription(
  description: string,
  stats: PassiveStats
): string {
  let formatted = description;

  // Replace {[key]} patterns with stat values
  const regex = /\{\[(\w+)\]\}/g;
  formatted = formatted.replace(regex, (match, key) => {
    const value = stats[key];
    return value !== undefined ? String(value) : match;
  });

  return formatted;
}
