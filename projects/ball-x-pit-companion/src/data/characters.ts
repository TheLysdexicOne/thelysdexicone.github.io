// Character data utilities using extracted game data

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

export interface Character {
  id: string; // Same as slug for consistency
  type: string;
  name: string;
  slug: string;
  flavorDescription: string;
  gameplayDescription: string;
  starterBall: string;
  stats: CharacterStats;
  props: string[];
  isUnlocked?: boolean; // For tracking unlock status
}

import charactersDataJson from './json/characters_data.json' assert { type: 'json' };

const charactersData = charactersDataJson as CharacterData[];

/**
 * Converts raw character data from game database to normalized Character type
 */
function normalizeCharacter(data: CharacterData): Character {
  return {
    id: data.Slug,
    type: data.Type,
    name: data.Name,
    slug: data.Slug,
    flavorDescription: data.FlavorDescription,
    gameplayDescription: data.GameplayDescription,
    starterBall: data.StarterUpgrade,
    stats: data.Stats,
    props: data.Props,
  };
}

/**
 * Get all playable characters (excludes ??? characters and special characters)
 */
export function getAllCharacters(): Character[] {
  return charactersData
    .filter(char => char.Name !== '???' && char.Slug !== 'char_influencer')
    .map(normalizeCharacter)
    .sort((a, b) => parseInt(a.type) - parseInt(b.type));
}

/**
 * Get a specific character by slug
 */
export function getCharacterBySlug(slug: string): Character | undefined {
  const charData = charactersData.find(
    c => c.Slug === slug && c.Name !== '???' && c.Slug !== 'char_influencer'
  );
  return charData ? normalizeCharacter(charData) : undefined;
}

/**
 * Get a specific character by ID (alias for getCharacterBySlug)
 */
export function getCharacterById(id: string): Character | undefined {
  return getCharacterBySlug(id);
}

/**
 * Get image path for character portrait
 */
export function getCharacterPortraitPath(character: Character): string {
  return `/images/characters/portrait/${character.slug}.png`;
}

/**
 * Get image path for character sprite
 */
export function getCharacterSpritePath(character: Character): string {
  return `/images/characters/sprite/${character.slug}.png`;
}

/**
 * Format stat name for display (removes 'k' prefix)
 */
export function formatStatName(statKey: string): string {
  return statKey.replace(/^k/, '');
}

/**
 * Format prop name for display (removes 'k' prefix and converts camelCase)
 */
export function formatPropName(prop: string): string {
  return prop
    .replace(/^k/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}
