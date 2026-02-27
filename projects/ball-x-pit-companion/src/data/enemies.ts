// Enemy data utilities using extracted game data

import type {
  EnemyTemplate,
  EnemyData,
  EnemyVariant,
  EnemyLevelVariant,
} from '@/types/enemy';
import type { Level } from '@/types/level';
import enemiesDataJson from './json/enemies_data.json' assert { type: 'json' };
import { getLevelByType } from './levels';

const enemiesData = enemiesDataJson as unknown as EnemyData[];

/**
 * Converts raw enemy data from game database to normalized EnemyTemplate type
 */
function normalizeEnemyTemplate(data: EnemyData): EnemyTemplate {
  return {
    id: data.Slug,
    type: data.Type,
    name: data.Name,
    slug: data.Slug,
    description: data.Description,
    gridWidth: data.GridWidth,
    gridHeight: data.GridHeight,
    healthScale: data.HealthScale,
    speedMultiplier: data.SpeedMultiplier,
    displayName: data.DisplayName,
    levelVariants: data.LevelVariants,
  };
}

/**
 * Get all enemy templates (base enemy types before level customization)
 */
export function getAllEnemyTemplates(): EnemyTemplate[] {
  return enemiesData.map(normalizeEnemyTemplate);
}

/**
 * Get a specific enemy template by slug
 */
export function getEnemyTemplateBySlug(
  slug: string
): EnemyTemplate | undefined {
  const enemyData = enemiesData.find(e => e.Slug === slug);
  return enemyData ? normalizeEnemyTemplate(enemyData) : undefined;
}

/**
 * Resolve an enemy template to a specific level variant
 */
export function resolveEnemyVariant(
  templateSlug: string,
  levelType: string
): EnemyVariant | null {
  const template = getEnemyTemplateBySlug(templateSlug);
  if (!template) return null;

  const variant = template.levelVariants[levelType];
  if (!variant) return null;

  const level = getLevelByType(levelType);

  return {
    templateSlug: template.slug,
    templateName: template.name,
    levelSlug: level?.slug || levelType,
    levelType: levelType,
    displayName: variant.DisplayName,
    iconName: variant.IconName,
    gridWidth: template.gridWidth,
    gridHeight: template.gridHeight,
    healthScale: template.healthScale,
    speedMultiplier: template.speedMultiplier,
    description: template.description,
  };
}

/**
 * Get all enemy variants for a specific level
 */
export function getEnemyVariantsForLevel(level: Level): EnemyVariant[] {
  const variants: EnemyVariant[] = [];

  // Combine EnemyList and PreviewEnemies as sources of truth
  const validEnemySlugs = new Set([
    ...level.previewEnemySlugs,
    ...level.enemySlugs,
  ]);

  for (const templateSlug of validEnemySlugs) {
    const variant = resolveEnemyVariant(templateSlug, level.type);
    if (variant) {
      variants.push(variant);
    }
  }

  return variants;
}

/**
 * Get all unique enemy variants across all levels (for enemies encyclopedia)
 * Only includes enemies that appear in level EnemyLists (source of truth)
 */
export function getAllEnemyVariants(): EnemyVariant[] {
  const variants: EnemyVariant[] = [];
  const { getAllLevels } = require('./levels');
  const levels = getAllLevels();

  // Iterate through each level and get its enemies
  for (const level of levels) {
    const levelVariants = getEnemyVariantsForLevel(level);
    variants.push(...levelVariants);
  }

  return variants;
}

/**
 * Get image path for enemy icon
 */
export function getEnemyIconPath(variant: EnemyVariant): string {
  // Icons are stored in public/images/enemies/
  return `/images/enemies/${variant.iconName}.png`;
}

/**
 * Search enemy variants by display name
 */
export function searchEnemyVariants(query: string): EnemyVariant[] {
  const lowercaseQuery = query.toLowerCase();
  return getAllEnemyVariants().filter(variant =>
    variant.displayName.toLowerCase().includes(lowercaseQuery)
  );
}
