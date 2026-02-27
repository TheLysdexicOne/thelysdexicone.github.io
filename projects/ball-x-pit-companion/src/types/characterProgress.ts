/**
 * Difficulty tiers for level completion
 */
export type DifficultyTier =
  | 'base'
  | 'ng-plus'
  | 'ng-plus-2'
  | 'ng-plus-3'
  | 'ng-plus-4'
  | 'ng-plus-5'
  | 'ng-plus-6'
  | 'ng-plus-7'
  | 'ng-plus-8'
  | 'ng-plus-9';

/**
 * Fast tier completion levels
 * 0 = not completed
 * 1 = Normal
 * 2 = Fast
 * 3 = Fast+
 * 4 = Fast+2
 * ...
 * 11 = Fast+9
 */
export type FastTierCompletion =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11;

/**
 * Level completion data for a specific difficulty tier
 */
export interface LevelCompletion {
  /** Level ID (1-8, matching level numbers) */
  levelId: number;
  /** Difficulty tier for this completion */
  difficulty: DifficultyTier;
  /** Fast tier completion level (0-11) */
  fastTier: FastTierCompletion;
}

/**
 * Progress data for a single character
 */
export interface CharacterProgress {
  /** Character ID */
  characterId: string;
  /** Custom display order (for reordering) */
  customIndex: number;
  /** All level completions for this character */
  levelCompletions: LevelCompletion[];
}

/**
 * Complete progress data structure stored in localStorage
 */
export interface ProgressData {
  /** Version for future migrations */
  version: number;
  /** Last updated timestamp */
  lastUpdated: string;
  /** Progress data for all characters */
  characters: CharacterProgress[];
}

/**
 * Save slot data structure
 */
export interface SaveSlotData {
  /** Character progress data */
  characterProgress: ProgressData;
  /** Last selected difficulty tier */
  lastDifficulty: DifficultyTier;
  /** Last selected tier completion level */
  lastTier: FastTierCompletion;
  /** Last modified timestamp */
  lastModified: number;
  /** Optional save slot name */
  name?: string;
}
