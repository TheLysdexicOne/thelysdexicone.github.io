"use client";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import {
  faChevronDown,
  faChevronUp,
  faStar as faStarSolid,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { useConanSettings } from "@/components/conan-settings-provider";
import {
  groupLoreEntries,
  projectAssetPath,
  type LoreDataset,
  type LoreEntry,
  type LoreEntryType,
} from "@/lib/lore";

config.autoAddCss = false;

const ALL_TYPES = "all";
type LoreGroup = ReturnType<typeof groupLoreEntries>[number];

interface VisibleLoreGroup extends LoreGroup {
  isDialogueGroup: boolean;
  totalEntryCount: number;
}

interface UnlockManagerItem {
  id: string;
  title: string;
  subtitle: string;
  preview: string;
  type: LoreEntryType;
  isUnlocked: boolean;
}

function isDialogueGroup(group: LoreGroup): boolean {
  return group.entries[0]?.type === "dialogue";
}

function countDisplayEntries(groups: LoreGroup[]): number {
  return groups.length;
}

function isCollapsibleGroup(group: VisibleLoreGroup): boolean {
  return group.totalEntryCount > 1;
}

function includesAnyEntryId(ids: string[], group: LoreGroup): boolean {
  return group.entries.some((entry) => ids.includes(entry.id));
}

function normalizeLoreText(value: string): string {
  return value
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"');
}

function entryMatchesQuery(
  entry: LoreEntry,
  query: string,
  includeFullText: boolean,
): boolean {
  if (!query) {
    return true;
  }

  const haystacks = [
    normalizeLoreText(entry.title),
    normalizeLoreText(entry.groupLabel),
    normalizeLoreText(entry.speakerName ?? ""),
    entry.tags.join(" "),
  ];

  if (includeFullText) {
    haystacks.push(
      normalizeLoreText(entry.text),
      normalizeLoreText(entry.source ?? ""),
    );
  }

  return haystacks.some((value) => value.toLowerCase().includes(query));
}

function buildContextSnippet(entry: LoreEntry, query: string): string {
  const normalizedEntryText = normalizeLoreText(entry.text);

  if (!query) {
    return normalizedEntryText.slice(0, 180);
  }

  const normalizedText = normalizedEntryText.toLowerCase();
  const index = normalizedText.indexOf(query);

  if (index === -1) {
    return normalizedEntryText.slice(0, 180);
  }

  const start = Math.max(0, index - 60);
  const end = Math.min(normalizedEntryText.length, index + query.length + 80);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < normalizedEntryText.length ? "..." : "";

  return `${prefix}${normalizedEntryText.slice(start, end)}${suffix}`;
}

export default function LorePage() {
  const { settings, isHydrated, updateSetting, toggleLoreUnlocked } =
    useConanSettings();
  const [dataset, setDataset] = useState<LoreDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<
    LoreEntryType | typeof ALL_TYPES
  >(ALL_TYPES);
  const [includeLoreTextInSearch, setIncludeLoreTextInSearch] = useState(false);
  const [isUnlockManagerOpen, setIsUnlockManagerOpen] = useState(false);
  const [unlockManagerQuery, setUnlockManagerQuery] = useState("");
  const [unlockManagerSelectedType, setUnlockManagerSelectedType] = useState<
    LoreEntryType | typeof ALL_TYPES
  >(ALL_TYPES);
  const [
    includeUnlockManagerTextInSearch,
    setIncludeUnlockManagerTextInSearch,
  ] = useState(false);
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDataset() {
      try {
        const response = await fetch(projectAssetPath("/data/lore.json"));

        if (!response.ok) {
          throw new Error(`Failed to load lore dataset: ${response.status}`);
        }

        const payload = (await response.json()) as LoreDataset;
        if (!cancelled) {
          setDataset(payload);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unknown lore loading error",
          );
        }
      }
    }

    loadDataset();

    return () => {
      cancelled = true;
    };
  }, []);

  const groupedDatasetEntries = useMemo(
    () => (dataset ? groupLoreEntries(dataset.entries) : []),
    [dataset],
  );

  const isDialogueGroupUnlocked = (group: LoreGroup) =>
    settings.unlockAllLore ||
    settings.unlockedLoreIds.includes(group.id) ||
    includesAnyEntryId(settings.unlockedLoreIds, group);

  const isGroupFavorited = (group: LoreGroup) =>
    settings.favoriteLoreIds.includes(group.id) ||
    includesAnyEntryId(settings.favoriteLoreIds, group);

  const setDialogueGroupUnlocked = (
    group: LoreGroup,
    nextUnlocked: boolean,
  ) => {
    const nextIds = settings.unlockedLoreIds.filter(
      (id) =>
        id !== group.id && !group.entries.some((entry) => entry.id === id),
    );

    updateSetting(
      "unlockedLoreIds",
      nextUnlocked ? [...nextIds, group.id] : nextIds,
    );
  };

  const setGroupFavorited = (group: LoreGroup, nextFavorite: boolean) => {
    const nextIds = settings.favoriteLoreIds.filter(
      (id) =>
        id !== group.id && !group.entries.some((entry) => entry.id === id),
    );

    updateSetting(
      "favoriteLoreIds",
      nextFavorite ? [...nextIds, group.id] : nextIds,
    );
  };

  const visibleGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return groupedDatasetEntries.reduce<VisibleLoreGroup[]>((groups, group) => {
      if (isDialogueGroup(group)) {
        if (selectedType !== ALL_TYPES && selectedType !== "dialogue") {
          return groups;
        }

        if (!isDialogueGroupUnlocked(group)) {
          return groups;
        }

        if (
          normalizedQuery &&
          !group.entries.some((entry) =>
            entryMatchesQuery(entry, normalizedQuery, includeLoreTextInSearch),
          )
        ) {
          return groups;
        }

        groups.push({
          ...group,
          isDialogueGroup: true,
          totalEntryCount: group.entries.length,
        });
        return groups;
      }

      const entries = group.entries.filter((entry) => {
        const isUnlocked =
          settings.unlockAllLore || settings.unlockedLoreIds.includes(entry.id);

        if (!isUnlocked) {
          return false;
        }

        if (selectedType !== ALL_TYPES && entry.type !== selectedType) {
          return false;
        }

        return entryMatchesQuery(
          entry,
          normalizedQuery,
          includeLoreTextInSearch,
        );
      });

      if (entries.length === 0) {
        return groups;
      }

      groups.push({
        ...group,
        entries,
        isDialogueGroup: false,
        totalEntryCount: group.entries.length,
      });
      return groups;
    }, []);
  }, [groupedDatasetEntries, query, selectedType, settings]);

  const unlockManagerItems = useMemo(() => {
    const normalizedQuery = unlockManagerQuery.trim().toLowerCase();

    return groupedDatasetEntries.reduce<UnlockManagerItem[]>((items, group) => {
      if (isDialogueGroup(group)) {
        if (
          unlockManagerSelectedType !== ALL_TYPES &&
          unlockManagerSelectedType !== "dialogue"
        ) {
          return items;
        }

        const matchingEntries = group.entries.filter((entry) =>
          entryMatchesQuery(
            entry,
            normalizedQuery,
            includeUnlockManagerTextInSearch,
          ),
        );

        if (normalizedQuery && matchingEntries.length === 0) {
          return items;
        }

        const previewEntry = matchingEntries[0] ?? group.entries[0];
        items.push({
          id: group.id,
          title: normalizeLoreText(group.label),
          subtitle: `${group.entries.length} dialogue header${group.entries.length === 1 ? "" : "s"}`,
          preview: `${normalizeLoreText(previewEntry.title)}: ${buildContextSnippet(previewEntry, normalizedQuery)}`,
          type: "dialogue",
          isUnlocked: isDialogueGroupUnlocked(group),
        });
        return items;
      }

      for (const entry of group.entries) {
        if (
          unlockManagerSelectedType !== ALL_TYPES &&
          entry.type !== unlockManagerSelectedType
        ) {
          continue;
        }

        if (
          !entryMatchesQuery(
            entry,
            normalizedQuery,
            includeUnlockManagerTextInSearch,
          )
        ) {
          continue;
        }

        items.push({
          id: entry.id,
          title: normalizeLoreText(entry.title),
          subtitle: normalizeLoreText(entry.groupLabel),
          preview: buildContextSnippet(entry, normalizedQuery),
          type: entry.type,
          isUnlocked:
            settings.unlockAllLore ||
            settings.unlockedLoreIds.includes(entry.id),
        });
      }

      return items;
    }, []);
  }, [
    groupedDatasetEntries,
    includeUnlockManagerTextInSearch,
    settings.unlockAllLore,
    settings.unlockedLoreIds,
    unlockManagerQuery,
    unlockManagerSelectedType,
  ]);

  const visibleCount = useMemo(
    () => countDisplayEntries(visibleGroups),
    [visibleGroups],
  );

  const totalDisplayCount = useMemo(
    () => countDisplayEntries(groupedDatasetEntries),
    [groupedDatasetEntries],
  );

  const unlockedCount = settings.unlockAllLore
    ? totalDisplayCount
    : groupedDatasetEntries.reduce((count, group) => {
        if (isDialogueGroup(group)) {
          return count + (isDialogueGroupUnlocked(group) ? 1 : 0);
        }

        return (
          count +
          group.entries.filter((entry) =>
            settings.unlockedLoreIds.includes(entry.id),
          ).length
        );
      }, 0);

  return (
    <main className="app-shell">
      <div className="app-container max-w-6xl">
        <section className="rounded-lg border-2 border-primary bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary opacity-70">
                Lore Browser MVP
              </p>
              <h1 className="mt-3 font-pixel text-2xl tracking-wide text-primary sm:text-3xl">
                Unlock-aware lore browsing with grouped journals and dialogue.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-secondary sm:text-base">
                This lore browser runs on the current staged Conan dataset,
                including grouped NPC dialogue, journal series, persisted group
                favorites, and search that can expand into entry text.
              </p>
            </div>

            <div className="grid min-w-64 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-lg border border-highlight bg-body p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                  Dataset
                </p>
                <p className="mt-2 text-sm text-primary">
                  {dataset ? dataset.version : "Loading"}
                </p>
              </div>
              <div className="rounded-lg border border-highlight bg-body p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                  Visible Entries
                </p>
                <p className="mt-2 text-sm text-primary">{visibleCount}</p>
              </div>
              <div className="rounded-lg border border-highlight bg-body p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                  Unlocked Count
                </p>
                <p className="mt-2 text-sm text-primary">{unlockedCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 xl:grid-cols-[18rem,minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-lg border border-highlight bg-card p-5">
              <h2 className="font-pixel text-lg tracking-wide text-primary">
                Search Controls
              </h2>
              <label className="mt-4 block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                  Search
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={
                    includeLoreTextInSearch
                      ? "Search title, groups, and lore text"
                      : "Search unlocked lore"
                  }
                  className="mt-2 w-full rounded-lg border border-highlight bg-body px-4 py-3 text-primary focus:border-primary focus:outline-none"
                />
              </label>

              <label className="mt-4 flex items-start gap-3 rounded-lg border border-highlight bg-body px-4 py-3 text-sm text-secondary">
                <input
                  type="checkbox"
                  checked={includeLoreTextInSearch}
                  onChange={(event) =>
                    setIncludeLoreTextInSearch(event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded border-highlight bg-card text-highlight"
                />
                <span>
                  Search lore text too
                  <span className="block text-xs opacity-70">
                    Include entry body text and source fields, not just titles
                    and metadata.
                  </span>
                </span>
              </label>

              <label className="mt-4 block">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                  Lore Type
                </span>
                <select
                  value={selectedType}
                  onChange={(event) =>
                    setSelectedType(
                      event.target.value as LoreEntryType | typeof ALL_TYPES,
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-highlight bg-body px-4 py-3 text-primary focus:border-primary focus:outline-none"
                >
                  <option value={ALL_TYPES}>All Types</option>
                  <option value="journal">Journals</option>
                  <option value="dialogue">NPC Dialogue</option>
                  <option value="lorestone">Lorestones</option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => setIsUnlockManagerOpen(true)}
                className="mt-4 w-full rounded-lg border border-highlight bg-body px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:border-primary hover:text-primary"
              >
                Manage Unlocks
              </button>
            </div>
          </aside>

          <section className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/60 bg-card p-5 text-sm text-secondary">
                Failed to load lore preview data: {error}
              </div>
            )}

            {!error && !dataset && (
              <div className="rounded-lg border border-highlight bg-card p-5 text-sm text-secondary">
                Loading lore preview data...
              </div>
            )}

            {dataset && visibleGroups.length === 0 && (
              <div className="rounded-lg border border-highlight bg-card p-5 text-sm text-secondary">
                No unlocked lore entries match the current filters. Use the
                unlock manager or toggle unlock-all in settings.
              </div>
            )}

            {visibleGroups.map((group) => {
              const isFavorite = isGroupFavorited(group);
              const lockedEntryCount = Math.max(
                0,
                group.totalEntryCount - group.entries.length,
              );
              const isCollapsible = isCollapsibleGroup(group);
              const isExpanded =
                !isCollapsible || expandedGroupIds.includes(group.id);

              return (
                <div
                  key={group.id}
                  className="rounded-lg border border-highlight bg-card p-5"
                >
                  <div className="flex flex-col gap-3 border-b border-highlight pb-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                        Group
                      </p>
                      <h2 className="mt-2 font-pixel text-lg tracking-wide text-primary sm:text-xl">
                        {normalizeLoreText(group.label)}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-secondary">
                        {group.totalEntryCount} entr
                        {group.totalEntryCount === 1 ? "y" : "ies"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setGroupFavorited(group, !isFavorite)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors focus-visible:outline-none ${
                          isFavorite
                            ? "border-primary bg-highlight text-primary focus-visible:border-primary"
                            : "border-highlight bg-body text-secondary hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary"
                        }`}
                        aria-pressed={isFavorite}
                        aria-label={
                          isFavorite
                            ? "Remove group favorite"
                            : "Favorite group"
                        }
                      >
                        <FontAwesomeIcon
                          icon={isFavorite ? faStarSolid : faStarRegular}
                          className="w-3"
                        />
                      </button>
                      {isCollapsible && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedGroupIds((current) =>
                              current.includes(group.id)
                                ? current.filter((id) => id !== group.id)
                                : [...current, group.id],
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-highlight bg-body text-secondary transition-colors hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary focus-visible:outline-none"
                          aria-expanded={isExpanded}
                          aria-controls={`lore-group-${group.id}`}
                          aria-label={
                            isExpanded ? "Collapse group" : "Expand group"
                          }
                        >
                          <FontAwesomeIcon
                            icon={isExpanded ? faChevronUp : faChevronDown}
                            className="w-3"
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  <div id={`lore-group-${group.id}`}>
                    {!isExpanded ? (
                      <div className="mt-4 rounded-lg border border-highlight bg-body px-4 py-4 text-sm text-secondary">
                        <p className="font-semibold text-primary">
                          {group.isDialogueGroup
                            ? `Expand to read ${group.entries.length} unlocked dialogue header${group.entries.length === 1 ? "" : "s"}.`
                            : `Expand to read ${group.entries.length} unlocked entr${group.entries.length === 1 ? "y" : "ies"} in this series.`}
                        </p>
                        {lockedEntryCount > 0 && (
                          <p className="mt-2 leading-relaxed">
                            {lockedEntryCount} locked entr
                            {lockedEntryCount === 1
                              ? "y remains"
                              : "ies remain"}{" "}
                            in this series.
                          </p>
                        )}
                      </div>
                    ) : group.isDialogueGroup ? (
                      <article className="mt-4 rounded-lg border border-highlight bg-body p-4">
                        <div className="flex flex-wrap items-center gap-2 border-b border-highlight pb-4">
                          <span className="rounded bg-highlight/20 px-2 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                            dialogue
                          </span>
                          <span className="text-xs text-secondary opacity-70">
                            Unlocking this NPC reveals the full conversation
                            set.
                          </span>
                        </div>

                        <div className="mt-4 space-y-6">
                          {group.entries.map((entry) => (
                            <section
                              key={entry.id}
                              className="border-b border-highlight pb-5 last:border-b-0 last:pb-0"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold text-primary">
                                  {normalizeLoreText(entry.title)}
                                </h3>
                                <span className="text-xs text-secondary opacity-70">
                                  {entry.map}
                                </span>
                              </div>
                              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-secondary">
                                {normalizeLoreText(entry.text)}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {entry.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded border border-highlight px-2 py-1 text-xs text-secondary"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                      </article>
                    ) : (
                      <article className="mt-4 rounded-lg border border-highlight bg-body p-4">
                        <div className="flex flex-wrap items-center gap-2 border-b border-highlight pb-4">
                          <span className="rounded bg-highlight/20 px-2 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                            {group.entries[0]?.type}
                          </span>
                          <span className="text-xs text-secondary opacity-70">
                            Entries unlock separately, but unlocked pages stay
                            grouped together here.
                          </span>
                        </div>

                        <div className="mt-4 space-y-6">
                          {group.entries.map((entry) => {
                            return (
                              <section
                                key={entry.id}
                                className="border-b border-highlight pb-5 last:border-b-0 last:pb-0"
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-semibold text-primary">
                                      {normalizeLoreText(entry.title)}
                                    </h3>
                                    <span className="text-xs text-secondary opacity-70">
                                      {entry.map}
                                    </span>
                                    {entry.speakerName && (
                                      <span className="text-xs text-secondary opacity-70">
                                        Speaker:{" "}
                                        {normalizeLoreText(entry.speakerName)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-secondary">
                                    {normalizeLoreText(entry.text)}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {entry.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded border border-highlight px-2 py-1 text-xs text-secondary"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </section>
                            );
                          })}

                          {lockedEntryCount > 0 && (
                            <section className="rounded-lg border border-dashed border-highlight px-4 py-4 text-sm text-secondary">
                              <p className="font-semibold text-primary">
                                {lockedEntryCount} locked entr
                                {lockedEntryCount === 1
                                  ? "y remains"
                                  : "ies remain"}
                              </p>
                              <p className="mt-2 leading-relaxed">
                                This series has {group.totalEntryCount} total
                                entries. Unlock the remaining pages from the map
                                or the unlock manager to reveal them here.
                              </p>
                            </section>
                          )}
                        </div>
                      </article>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </section>

        {dataset && isUnlockManagerOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-lg border-2 border-primary bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-highlight px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                    Lore Unlocks
                  </p>
                  <h2 className="mt-2 font-pixel text-xl tracking-wide text-primary">
                    Manage Visible Lore
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUnlockManagerOpen(false)}
                  className="rounded border border-highlight px-3 py-2 text-sm font-semibold text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  Close
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                <div className="mb-4 grid gap-4 border-b border-highlight pb-4 md:grid-cols-[minmax(0,1fr),14rem]">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                      Search
                    </span>
                    <input
                      type="search"
                      value={unlockManagerQuery}
                      onChange={(event) =>
                        setUnlockManagerQuery(event.target.value)
                      }
                      placeholder={
                        includeUnlockManagerTextInSearch
                          ? "Search title, groups, and lore text"
                          : "Search all lore entries"
                      }
                      className="mt-2 w-full rounded-lg border border-highlight bg-body px-4 py-3 text-primary focus:border-primary focus:outline-none"
                    />
                    <span className="mt-3 flex items-start gap-3 rounded-lg border border-highlight bg-card px-4 py-3 text-sm text-secondary">
                      <input
                        type="checkbox"
                        checked={includeUnlockManagerTextInSearch}
                        onChange={(event) =>
                          setIncludeUnlockManagerTextInSearch(
                            event.target.checked,
                          )
                        }
                        className="mt-0.5 h-4 w-4 rounded border-highlight bg-body text-highlight"
                      />
                      <span>
                        Search lore text too
                        <span className="block text-xs opacity-70">
                          Include entry body text and source fields for unlock
                          management.
                        </span>
                      </span>
                    </span>
                  </label>

                  <label>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                      Lore Type
                    </span>
                    <select
                      value={unlockManagerSelectedType}
                      onChange={(event) =>
                        setUnlockManagerSelectedType(
                          event.target.value as
                            | LoreEntryType
                            | typeof ALL_TYPES,
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-highlight bg-body px-4 py-3 text-primary focus:border-primary focus:outline-none"
                    >
                      <option value={ALL_TYPES}>All Types</option>
                      <option value="journal">Journals</option>
                      <option value="dialogue">NPC Dialogue</option>
                      <option value="lorestone">Lorestones</option>
                    </select>
                  </label>
                </div>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-secondary">
                  <p>
                    Showing {unlockManagerItems.length} of {totalDisplayCount}{" "}
                    entries.
                  </p>
                  <p>
                    {includeUnlockManagerTextInSearch
                      ? "Unlock-manager search includes lore text and source fields."
                      : "Unlock-manager search is currently title and metadata focused."}
                  </p>
                </div>

                <div className="space-y-3">
                  {unlockManagerItems.length === 0 && (
                    <div className="rounded-lg border border-highlight bg-body p-4 text-sm text-secondary">
                      No lore entries match the current unlock-manager filters.
                    </div>
                  )}

                  {unlockManagerItems.map((item) => {
                    const matchedDialogueGroup = groupedDatasetEntries.find(
                      (group) => group.id === item.id && isDialogueGroup(group),
                    );

                    return (
                      <label
                        key={item.id}
                        className="flex items-start gap-4 rounded-lg border border-highlight bg-body p-4"
                      >
                        <input
                          type="checkbox"
                          checked={item.isUnlocked}
                          disabled={settings.unlockAllLore || !isHydrated}
                          onChange={(event) => {
                            if (matchedDialogueGroup) {
                              setDialogueGroupUnlocked(
                                matchedDialogueGroup,
                                event.target.checked,
                              );
                              return;
                            }

                            toggleLoreUnlocked(item.id);
                          }}
                          className="mt-1 h-5 w-5 rounded border-highlight bg-card text-highlight"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-primary">
                              {item.title}
                            </h3>
                            <span className="text-xs text-secondary opacity-70">
                              {item.subtitle}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-secondary">
                            {item.preview}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
