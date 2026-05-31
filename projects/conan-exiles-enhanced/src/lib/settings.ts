export interface ConanUserSettings {
  unlockAllLore: boolean;
  craftingCostMultiplier: number;
  unlockedLoreIds: string[];
  favoriteLoreIds: string[];
}

export const SETTINGS_STORAGE_KEY = "conan-exiles-enhanced:settings";

export const DEFAULT_SETTINGS: ConanUserSettings = {
  unlockAllLore: false,
  craftingCostMultiplier: 1,
  unlockedLoreIds: [],
  favoriteLoreIds: [],
};