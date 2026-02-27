// Ball data utilities using extracted game data

import type { Ball, BallData, BallProperties } from '@/types/ball';
import ballsDataJson from './json/balls_data.json' assert { type: 'json' };

const ballsData = ballsDataJson as unknown as BallData[];

/**
 * Converts raw ball data from game database to normalized Ball type
 */
function normalizeBall(data: BallData): Ball {
  return {
    id: data.Slug,
    name: data.Name,
    slug: data.Slug,
    type: data.Type,
    description: data.Description,
    isInGame: data.IsInGame ?? true,

    // Extract first 3 levels (game only uses these)
    level1: data.PropertiesByLevel[0]?.Properties || {},
    level2: data.PropertiesByLevel[1]?.Properties || {},
    level3: data.PropertiesByLevel[2]?.Properties || {},

    evolvesInto: data.EvolutionSlugs || [],
    fusionRecipe: data.MergeComponents || [],

    ballColor: data.BallColor,
    damageType: data.DamageType,
    hitEffects: data.HitEffects || [],
    aoeTypes: data.AOETypes || [],
    specials: data.Specials || [],
    isSpawner: data.IsSpawner,
    isMosquitoSpawner: data.IsMosquitoSpawner,
    isGlacier: data.IsGlacier,
    isAOE: data.IsAOE,
    isStatusEffect: data.IsStatusEffect,
    iconColorList: data.IconColorList || [],
  };
}

/**
 * Get all balls that are in the game
 */
export function getAllBalls(): Ball[] {
  return ballsData
    .filter(ball => ball.IsInGame !== false && ball.Name !== '???')
    .map(normalizeBall)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a specific ball by slug
 */
export function getBallBySlug(slug: string): Ball | undefined {
  const ballData = ballsData.find(
    b => b.Slug === slug && b.IsInGame !== false && b.Name !== '???'
  );
  return ballData ? normalizeBall(ballData) : undefined;
}

/**
 * Get basic balls (no fusion recipe)
 */
export function getBasicBalls(): Ball[] {
  return getAllBalls().filter(ball => ball.fusionRecipe.length === 0);
}

/**
 * Get fusion balls (has a fusion recipe)
 */
export function getFusionBalls(): Ball[] {
  return getAllBalls().filter(ball => ball.fusionRecipe.length > 0);
}

/**
 * Get balls by damage type
 */
export function getBallsByDamageType(damageType: string): Ball[] {
  return getAllBalls().filter(ball =>
    ball.damageType.toLowerCase().includes(damageType.toLowerCase())
  );
}

/**
 * Format description with property values
 * Replaces {[property_name]} with actual values
 */
export function formatDescription(
  description: string,
  properties: Record<string, number | string>
): string {
  return description.replace(/\{\[(\w+)\]\}/g, (match, key) => {
    const value = properties[key];
    if (value === undefined) return match;

    // Convert deciseconds to seconds for time-based properties
    if (
      key.includes('_length') ||
      key.includes('_len') ||
      key.includes('cycle') ||
      key.includes('cooldown')
    ) {
      const numValue =
        typeof value === 'number' ? value : parseFloat(String(value));
      if (!isNaN(numValue)) {
        return (numValue / 10).toFixed(1);
      }
    }

    return String(value);
  });
}

/**
 * Get balls that evolve from a given ball
 */
export function getEvolutionsFor(ballSlug: string): Ball[] {
  return getAllBalls().filter(ball =>
    ball.fusionRecipe.some(recipe => recipe.includes(ballSlug))
  );
}
