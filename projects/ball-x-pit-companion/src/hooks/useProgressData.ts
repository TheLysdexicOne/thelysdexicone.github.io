import { useEffect, useState, useCallback } from 'react';
import { getAllCharacters } from '@/data/characters';
import type {
  ProgressData,
  CharacterProgress,
  LevelCompletion,
  FastTierCompletion,
  SaveSlotData,
  DifficultyTier,
} from '@/types/characterProgress';

// Storage keys
const LEGACY_STORAGE_KEY = 'ball-x-pit-progress';
const LEGACY_DIFFICULTY_KEY = 'currentDifficulty';
const LEGACY_TIER_KEY = 'currentFastTier';
const ACTIVE_SLOT_KEY = 'ball-x-pit-active-slot';
const getSaveSlotKey = (slot: number) => `ball-x-pit-save-${slot}`;

const CURRENT_VERSION = 1;

// Custom event for cross-component synchronization
const PROGRESS_UPDATE_EVENT = 'progress-data-updated';

function dispatchProgressUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROGRESS_UPDATE_EVENT));
  }
}

/**
 * Creates initial progress data with default values
 */
function createInitialData(): ProgressData {
  const characters = getAllCharacters();
  return {
    version: CURRENT_VERSION,
    lastUpdated: new Date().toISOString(),
    characters: characters.map((char, index) => ({
      characterId: char.id,
      customIndex: index,
      levelCompletions: [],
    })),
  };
}

/**
 * Loads progress data from localStorage
 */
function loadProgressData(): ProgressData {
  if (typeof window === 'undefined') {
    return createInitialData();
  }

  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) {
      return createInitialData();
    }

    const data = JSON.parse(stored) as ProgressData;

    // Validate and merge with current characters (in case new characters were added)
    const existingCharacterIds = new Set(
      data.characters.map(c => c.characterId)
    );
    const characters = getAllCharacters();
    const newCharacters = characters
      .filter(c => !existingCharacterIds.has(c.id))
      .map((char, index) => ({
        characterId: char.id,
        customIndex: data.characters.length + index,
        levelCompletions: [],
      }));

    return {
      ...data,
      characters: [...data.characters, ...newCharacters],
    };
  } catch (error) {
    console.error('Failed to load progress data:', error);
    return createInitialData();
  }
}

/**
 * Migrates legacy localStorage data to save slot 1
 */
function migrateLegacyData(): void {
  if (typeof window === 'undefined') return;

  try {
    // Check if migration already done
    const slot1 = localStorage.getItem(getSaveSlotKey(1));
    if (slot1) return; // Already migrated

    // Check if legacy data exists
    const legacyProgress = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyProgress) return; // No legacy data to migrate

    const legacyData = JSON.parse(legacyProgress);
    const difficulty =
      (localStorage.getItem(LEGACY_DIFFICULTY_KEY) as DifficultyTier) || 'base';
    const tier = parseInt(
      localStorage.getItem(LEGACY_TIER_KEY) || '0',
      10
    ) as FastTierCompletion;

    // Migrate the progress data structure if needed
    let progressData: ProgressData;
    if (legacyData.heroes) {
      // Old format with heroes array
      progressData = {
        version: legacyData.version || 1,
        lastUpdated: legacyData.lastUpdated || new Date().toISOString(),
        characters: (legacyData.heroes || []).map((hero: any) => ({
          characterId: hero.heroId,
          customIndex: hero.customIndex,
          levelCompletions: hero.levelCompletions || [],
        })),
      };
    } else {
      // Already new format or empty
      progressData = legacyData as ProgressData;
    }

    // Create save slot 1 with legacy data
    const saveSlot: SaveSlotData = {
      characterProgress: progressData,
      lastDifficulty: difficulty,
      lastTier: tier,
      lastModified: Date.now(),
      name: 'Save 1',
    };

    localStorage.setItem(getSaveSlotKey(1), JSON.stringify(saveSlot));
    localStorage.setItem(ACTIVE_SLOT_KEY, '1');

    // Keep legacy keys for now (can be cleaned up later)
    console.log('Migrated legacy data to save slot 1');
  } catch (error) {
    console.error('Failed to migrate legacy data:', error);
  }
}

/**
 * Gets the active save slot number (1-3)
 */
function getActiveSlot(): number {
  if (typeof window === 'undefined') return 1;

  try {
    const saved = localStorage.getItem(ACTIVE_SLOT_KEY);
    const slot = saved ? parseInt(saved, 10) : 1;
    return slot >= 1 && slot <= 3 ? slot : 1;
  } catch {
    return 1;
  }
}

/**
 * Migrates old save slot data structure (heroProgress -> characterProgress)
 */
function migrateOldSaveData(data: any): SaveSlotData {
  // Check if this is old format with heroProgress
  if (data.heroProgress && !data.characterProgress) {
    const oldProgress = data.heroProgress;
    const newProgress: ProgressData = {
      version: oldProgress.version || 1,
      lastUpdated: oldProgress.lastUpdated || new Date().toISOString(),
      characters: (oldProgress.heroes || []).map((hero: any) => ({
        characterId: hero.heroId,
        customIndex: hero.customIndex,
        levelCompletions: hero.levelCompletions || [],
      })),
    };

    return {
      characterProgress: newProgress,
      lastDifficulty: data.lastDifficulty || 'base',
      lastTier: data.lastTier || 1,
      lastModified: data.lastModified || Date.now(),
      name: data.name || `Save ${1}`,
    };
  }

  // Already new format
  return data as SaveSlotData;
}

/**
 * Loads save slot data
 */
function loadSaveSlot(slot: number): SaveSlotData {
  if (typeof window === 'undefined') {
    return {
      characterProgress: createInitialData(),
      lastDifficulty: 'base',
      lastTier: 1, // Default to Normal (tier 1)
      lastModified: Date.now(),
      name: `Save ${slot}`,
    };
  }

  try {
    const stored = localStorage.getItem(getSaveSlotKey(slot));
    if (!stored) {
      // Create new empty slot
      return {
        characterProgress: createInitialData(),
        lastDifficulty: 'base',
        lastTier: 1, // Default to Normal (tier 1)
        lastModified: Date.now(),
        name: `Save ${slot}`,
      };
    }

    const data = JSON.parse(stored);
    const migrated = migrateOldSaveData(data);

    // Save the migrated data back to localStorage
    if (data.heroProgress && !data.characterProgress) {
      saveSaveSlot(slot, migrated);
      console.log(
        `Migrated save slot ${slot} from heroProgress to characterProgress`
      );
    }

    return migrated;
  } catch (error) {
    console.error(`Failed to load save slot ${slot}:`, error);
    return {
      characterProgress: createInitialData(),
      lastDifficulty: 'base',
      lastTier: 1, // Default to Normal (tier 1)
      lastModified: Date.now(),
      name: `Save ${slot}`,
    };
  }
}

/**
 * Saves save slot data to localStorage (without dispatching event)
 */
function saveSaveSlot(slot: number, data: SaveSlotData): void {
  if (typeof window === 'undefined') return;

  try {
    const updated = {
      ...data,
      lastModified: Date.now(),
    };
    localStorage.setItem(getSaveSlotKey(slot), JSON.stringify(updated));
  } catch (error) {
    console.error(`Failed to save slot ${slot}:`, error);
  }
}

/**
 * Saves progress data to localStorage (without dispatching event)
 * @deprecated Use saveSaveSlot instead
 */
function saveProgressData(data: ProgressData): void {
  if (typeof window === 'undefined') return;

  try {
    const updated = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save progress data:', error);
  }
}

/**
 * Saves progress data and notifies other components
 */
function saveAndNotify(activeSlot: number, saveData: SaveSlotData): void {
  saveSaveSlot(activeSlot, saveData);
  dispatchProgressUpdate();
}

/**
 * Custom hook for managing hero progress data with save slots
 */
export function useProgressData() {
  // Run migration once on mount
  useEffect(() => {
    migrateLegacyData();
  }, []);

  const [activeSlot, setActiveSlotState] = useState<number>(() =>
    getActiveSlot()
  );
  const [saveData, setSaveData] = useState<SaveSlotData>(() =>
    loadSaveSlot(activeSlot)
  );
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Listen for updates from other components
  useEffect(() => {
    const handleUpdate = () => {
      const currentSlot = getActiveSlot();
      setActiveSlotState(currentSlot);
      setSaveData(loadSaveSlot(currentSlot));
      setUpdateTrigger(prev => prev + 1);
    };

    window.addEventListener(PROGRESS_UPDATE_EVENT, handleUpdate);
    return () =>
      window.removeEventListener(PROGRESS_UPDATE_EVENT, handleUpdate);
  }, []);

  /**
   * Gets all heroes sorted by custom index
   */
  const getSortedCharacters = useCallback((): CharacterProgress[] => {
    return [...saveData.characterProgress.characters].sort(
      (a, b) => a.customIndex - b.customIndex
    );
  }, [saveData.characterProgress.characters]);

  /**
   * Gets current difficulty tier
   */
  const getCurrentDifficulty = useCallback((): DifficultyTier => {
    return saveData.lastDifficulty;
  }, [saveData.lastDifficulty]);

  /**
   * Gets current tier completion
   */
  const getCurrentTier = useCallback((): FastTierCompletion => {
    return saveData.lastTier;
  }, [saveData.lastTier]);

  /**
   * Sets current difficulty tier
   */
  const setCurrentDifficulty = (difficulty: DifficultyTier) => {
    const updated = { ...saveData, lastDifficulty: difficulty };
    setSaveData(updated);
    saveAndNotify(activeSlot, updated);
  };

  /**
   * Sets current tier completion
   */
  const setCurrentTier = (tier: FastTierCompletion) => {
    const updated = { ...saveData, lastTier: tier };
    setSaveData(updated);
    saveAndNotify(activeSlot, updated);
  };

  /**
   * Updates the custom order index for a character
   */
  const updateCharacterOrder = (characterId: string, newIndex: number) => {
    const updatedProgress = {
      ...saveData.characterProgress,
      characters: saveData.characterProgress.characters.map(char =>
        char.characterId === characterId
          ? { ...char, customIndex: newIndex }
          : char
      ),
    };
    const updated = { ...saveData, characterProgress: updatedProgress };
    setSaveData(updated);
    saveAndNotify(activeSlot, updated);
  };

  /**
   * Updates character order for multiple characters at once (for drag-and-drop)
   */
  const updateCharacterOrders = (
    updates: Array<{ characterId: string; customIndex: number }>
  ) => {
    const characterMap = new Map(
      saveData.characterProgress.characters.map(c => [c.characterId, c])
    );
    updates.forEach(({ characterId, customIndex }) => {
      const character = characterMap.get(characterId);
      if (character) {
        character.customIndex = customIndex;
      }
    });
    const updatedProgress = {
      ...saveData.characterProgress,
      characters: Array.from(characterMap.values()),
    };
    const updated = { ...saveData, characterProgress: updatedProgress };
    setSaveData(updated);
    saveAndNotify(activeSlot, updated);
  };

  /**
   * Updates level completion for a character
   */
  const updateLevelCompletion = (
    characterId: string,
    levelId: number,
    completion: Partial<LevelCompletion>
  ) => {
    const updatedProgress = {
      ...saveData.characterProgress,
      characters: saveData.characterProgress.characters.map(char => {
        if (char.characterId !== characterId) return char;

        const existingIndex = char.levelCompletions.findIndex(
          lc =>
            lc.levelId === levelId && lc.difficulty === completion.difficulty
        );

        if (existingIndex >= 0) {
          // Update existing completion
          const updatedCompletions = [...char.levelCompletions];
          updatedCompletions[existingIndex] = {
            ...updatedCompletions[existingIndex],
            ...completion,
          } as LevelCompletion;
          return { ...char, levelCompletions: updatedCompletions };
        } else {
          // Add new completion
          return {
            ...char,
            levelCompletions: [
              ...char.levelCompletions,
              {
                levelId,
                difficulty: completion.difficulty || 'base',
                fastTier: (completion.fastTier || 0) as FastTierCompletion,
              },
            ],
          };
        }
      }),
    };
    const updated = { ...saveData, characterProgress: updatedProgress };
    setSaveData(updated);
    saveAndNotify(activeSlot, updated);
  };

  /**
   * Gets progress for a specific hero
   */
  const getCharacterProgress = (
    characterId: string
  ): CharacterProgress | undefined => {
    return saveData.characterProgress.characters.find(
      c => c.characterId === characterId
    );
  };

  /**
   * Switches to a different save slot
   */
  const switchSaveSlot = (slot: number) => {
    if (slot < 1 || slot > 3) return;

    localStorage.setItem(ACTIVE_SLOT_KEY, slot.toString());
    setActiveSlotState(slot);
    const newSaveData = loadSaveSlot(slot);
    setSaveData(newSaveData);
    dispatchProgressUpdate();
  };

  /**
   * Gets all save slot metadata
   */
  const getAllSaveSlots = (): Array<{ slot: number; data: SaveSlotData }> => {
    return [1, 2, 3].map(slot => ({
      slot,
      data: loadSaveSlot(slot),
    }));
  };

  /**
   * Deletes a save slot (resets to empty)
   */
  const deleteSaveSlot = (slot: number) => {
    if (slot < 1 || slot > 3) return;

    const emptySave: SaveSlotData = {
      characterProgress: createInitialData(),
      lastDifficulty: 'base',
      lastTier: 1, // Default to Normal (tier 1)
      lastModified: Date.now(),
      name: `Save ${slot}`,
    };

    saveSaveSlot(slot, emptySave);

    // If deleting active slot, reload it
    if (slot === activeSlot) {
      setSaveData(emptySave);
      dispatchProgressUpdate();
    }
  };

  /**
   * Resets all progress data for current save slot
   */
  const resetAllProgress = () => {
    const initial: SaveSlotData = {
      characterProgress: createInitialData(),
      lastDifficulty: 'base',
      lastTier: 1, // Default to Normal (tier 1)
      lastModified: Date.now(),
      name: saveData.name || `Save ${activeSlot}`,
    };
    setSaveData(initial);
    saveAndNotify(activeSlot, initial);
  };

  return {
    // Progress data
    progressData: saveData.characterProgress,

    // Current state
    currentDifficulty: saveData.lastDifficulty,
    currentTier: saveData.lastTier,
    activeSlot,

    // Setters for current state
    setCurrentDifficulty,
    setCurrentTier,

    // Character operations
    updateCharacterOrder,
    updateCharacterOrders,
    updateLevelCompletion,
    getCharacterProgress,
    getSortedCharacters,

    // Save slot operations
    switchSaveSlot,
    getAllSaveSlots,
    deleteSaveSlot,
    resetAllProgress,
  };
}
