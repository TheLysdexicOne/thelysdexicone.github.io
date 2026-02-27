// Level data utilities using extracted game data

import type { Level, LevelData } from '@/types/level';
import levelsDataJson from './json/levels_data.json' assert { type: 'json' };

const levelsData = levelsDataJson as unknown as LevelData[];

/**
 * Converts raw level data from game database to normalized Level type
 */
function normalizeLevel(data: LevelData): Level {
  return {
    id: data.Slug,
    levelId: data.Id,
    type: data.Type,
    name: data.Name.replace(/\{\[x\]\}/g, ' '), // Remove placeholder
    slug: data.Slug,
    description: data.Description,
    defaultTurnLength: data.DefaultTurnLength,
    bossTurns: data.BossTurns,
    fuserTurns: data.FuserTurns,
    xpMultiplier: data.XPMultiplier,
    bossSlug: data.BossInfo,
    previewEnemySlugs: data.PreviewEnemies,
    enemySlugs: data.EnemyList,
    unlocks: data.Unlocks || [],
    blueprints: data.Blueprints || [],
  };
}

/**
 * Get all levels
 */
export function getAllLevels(): Level[] {
  return levelsData.map(normalizeLevel).sort((a, b) => a.levelId - b.levelId);
}

/**
 * Get a specific level by slug
 */
export function getLevelBySlug(slug: string): Level | undefined {
  const levelData = levelsData.find(l => l.Slug === slug);
  return levelData ? normalizeLevel(levelData) : undefined;
}

/**
 * Get a specific level by type
 */
export function getLevelByType(type: string): Level | undefined {
  const levelData = levelsData.find(l => l.Type === type);
  return levelData ? normalizeLevel(levelData) : undefined;
}

/**
 * Get level name by type (for use in enemy variant resolution)
 */
export function getLevelNameByType(type: string): string {
  const level = getLevelByType(type);
  return level?.name || type;
}
