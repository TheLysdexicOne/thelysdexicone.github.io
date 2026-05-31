"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type ConanUserSettings,
} from "@/lib/settings";

interface ConanSettingsContextValue {
  settings: ConanUserSettings;
  isHydrated: boolean;
  updateSetting: <K extends keyof ConanUserSettings>(
    key: K,
    value: ConanUserSettings[K],
  ) => void;
  toggleLoreUnlocked: (id: string) => void;
  toggleLoreFavorite: (id: string) => void;
  resetLoreState: () => void;
}

const ConanSettingsContext = createContext<ConanSettingsContextValue | null>(
  null,
);

export function ConanSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ConanUserSettings>(DEFAULT_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ConanUserSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [isHydrated, settings]);

  const updateSetting = useCallback(
    <K extends keyof ConanUserSettings>(
      key: K,
      value: ConanUserSettings[K],
    ) => {
      setSettings((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const toggleLoreUnlocked = useCallback((id: string) => {
    setSettings((current) => {
      const nextIds = current.unlockedLoreIds.includes(id)
        ? current.unlockedLoreIds.filter((entryId) => entryId !== id)
        : [...current.unlockedLoreIds, id];

      return { ...current, unlockedLoreIds: nextIds };
    });
  }, []);

  const toggleLoreFavorite = useCallback((id: string) => {
    setSettings((current) => {
      const nextIds = current.favoriteLoreIds.includes(id)
        ? current.favoriteLoreIds.filter((entryId) => entryId !== id)
        : [...current.favoriteLoreIds, id];

      return { ...current, favoriteLoreIds: nextIds };
    });
  }, []);

  const resetLoreState = useCallback(() => {
    setSettings((current) => ({
      ...current,
      unlockedLoreIds: [],
      favoriteLoreIds: [],
    }));
  }, []);

  const value = useMemo(
    () => ({
      settings,
      isHydrated,
      updateSetting,
      toggleLoreUnlocked,
      toggleLoreFavorite,
      resetLoreState,
    }),
    [
      isHydrated,
      resetLoreState,
      settings,
      toggleLoreFavorite,
      toggleLoreUnlocked,
      updateSetting,
    ],
  );

  return (
    <ConanSettingsContext.Provider value={value}>
      {children}
    </ConanSettingsContext.Provider>
  );
}

export function useConanSettings() {
  const context = useContext(ConanSettingsContext);

  if (!context) {
    throw new Error(
      "useConanSettings must be used within ConanSettingsProvider",
    );
  }

  return context;
}
