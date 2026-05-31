export type LoreEntryType = "journal" | "dialogue" | "lorestone";

export type ConanMapName =
  | "Exiled Lands"
  | "Isle of Siptah"
  | "Both"
  | "Unknown";

export interface LoreEntry {
  id: string;
  type: LoreEntryType;
  title: string;
  text: string;
  groupId: string;
  groupLabel: string;
  groupOrder: number;
  speakerName?: string | null;
  map: ConanMapName;
  source?: string | null;
  tags: string[];
}

export interface LoreDataset {
  version: string;
  generatedAt: string;
  entries: LoreEntry[];
}

export const PROJECT_BASE_PATH = "/conan-exiles-enhanced";

// Build a project-relative asset URL that works with the configured basePath.
export function projectAssetPath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${PROJECT_BASE_PATH}${normalizedPath}`;
}

// Group lore entries so the browser can render note series and NPC dialogue together.
export function groupLoreEntries(entries: LoreEntry[]): Array<{
  id: string;
  label: string;
  entries: LoreEntry[];
}> {
  const groups = new Map<string, { id: string; label: string; entries: LoreEntry[] }>();

  for (const entry of entries) {
    const existing = groups.get(entry.groupId);

    if (existing) {
      existing.entries.push(entry);
      continue;
    }

    groups.set(entry.groupId, {
      id: entry.groupId,
      label: entry.groupLabel,
      entries: [entry],
    });
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    entries: [...group.entries].sort((left, right) => left.groupOrder - right.groupOrder),
  }));
}