"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  FieldGuideLayout,
  type FieldGuideSection,
} from "@shared/components/field-guide";
import { useConanSettings } from "@/components/conan-settings-provider";
import {
  categoryIconDatasetPath,
  itemDatasetPath,
  type CategoryIconDataset,
  type ItemDataset,
  type ItemEntry,
} from "@/lib/items";
import ConanCategoryGrid from "./conan-category-grid-shared";
import ConanCategoryPanel from "./conan-category-panel";
import ConanItemDetailPanel from "./conan-item-detail-panel";
import ConanItemGrid from "./conan-item-grid-shared";
import {
  humanizeCategoryName,
  matchesItemSearch,
  slugify,
  type ItemCategory,
} from "./conan-field-guide-items-helpers";

const SECTIONS: FieldGuideSection[] = [
  { label: "Items", href: "/conan-exiles-enhanced/items" },
];

export default function ConanFieldGuideItems() {
  const { settings } = useConanSettings();
  const [dataset, setDataset] = useState<ItemDataset | null>(null);
  const [categoryIconDataset, setCategoryIconDataset] =
    useState<CategoryIconDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let cancelled = false;

    async function loadDataset() {
      try {
        const [itemResponse, categoryIconResponse] = await Promise.all([
          fetch(itemDatasetPath()),
          fetch(categoryIconDatasetPath()),
        ]);

        if (!itemResponse.ok) {
          throw new Error(
            `Failed to load item dataset: ${itemResponse.status}`,
          );
        }

        if (!categoryIconResponse.ok) {
          throw new Error(
            `Failed to load category icon dataset: ${categoryIconResponse.status}`,
          );
        }

        const [itemPayload, categoryIconPayload] = await Promise.all([
          itemResponse.json() as Promise<ItemDataset>,
          categoryIconResponse.json() as Promise<CategoryIconDataset>,
        ]);

        if (!cancelled) {
          setDataset(itemPayload);
          setCategoryIconDataset(categoryIconPayload);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unknown item loading error",
          );
        }
      }
    }

    void loadDataset();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo<ItemCategory[]>(() => {
    if (!dataset) {
      return [];
    }

    const officialIcons = categoryIconDataset?.categoryIcons ?? {};
    const categoryMap = new Map<string, ItemCategory>();

    for (const entry of dataset.entries) {
      const rawName = entry.sortLabel || entry.itemType || "Other";
      const displayName = humanizeCategoryName(rawName);
      const categoryId = slugify(rawName) || "other";
      const existingCategory = categoryMap.get(categoryId);

      if (existingCategory) {
        existingCategory.items.push(entry);
      } else {
        categoryMap.set(categoryId, {
          id: categoryId,
          rawName,
          displayName,
          officialIconPath: officialIcons[rawName]?.iconPath ?? null,
          representativeEntry: entry,
          items: [entry],
        });
      }
    }

    return Array.from(categoryMap.values())
      .map((category) => ({
        ...category,
        items: [...category.items].sort((left, right) =>
          left.name.localeCompare(right.name),
        ),
      }))
      .sort((left, right) => left.displayName.localeCompare(right.displayName));
  }, [categoryIconDataset, dataset]);

  const normalizedQuery = deferredSearch.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return categories;
    }

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((entry) =>
          matchesItemSearch(entry, normalizedQuery),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, normalizedQuery]);

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const selectedCategoryItems = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    if (!normalizedQuery) {
      return selectedCategory.items;
    }

    return selectedCategory.items.filter((entry) =>
      matchesItemSearch(entry, normalizedQuery),
    );
  }, [normalizedQuery, selectedCategory]);

  const selectedEntry = useMemo(() => {
    if (!selectedItemId || !dataset) {
      return null;
    }

    return dataset.entries.find((entry) => entry.id === selectedItemId) ?? null;
  }, [dataset, selectedItemId]);

  useEffect(() => {
    if (!dataset) {
      return;
    }

    if (
      selectedItemId &&
      !dataset.entries.some((entry) => entry.id === selectedItemId)
    ) {
      setSelectedItemId("");
    }
  }, [dataset, selectedItemId]);

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    const entry = dataset?.entries.find((candidate) => candidate.id === itemId);
    if (entry) {
      setSelectedCategoryId(
        slugify(entry.sortLabel || entry.itemType || "Other"),
      );
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    setOpenCategories((currentOpenCategories) => {
      const nextOpenCategories = new Set(currentOpenCategories);
      if (nextOpenCategories.has(categoryId)) {
        nextOpenCategories.delete(categoryId);
      } else {
        nextOpenCategories.add(categoryId);
      }
      return nextOpenCategories;
    });
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedItemId("");
    setSearch("");
    setOpenCategories(
      (currentOpenCategories) =>
        new Set([...currentOpenCategories, categoryId]),
    );
  };

  const handleBack = () => {
    if (selectedItemId) {
      setSelectedItemId("");
      return;
    }

    setSelectedCategoryId("");
  };

  const handleCategories = () => {
    setSelectedItemId("");
    setSelectedCategoryId("");
    setSearch("");
  };

  const searchSlot = (
    <div className="flex min-w-0 max-w-xs flex-1 items-center gap-1 rounded border border-primary bg-main px-2 py-1.5">
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        className="w-3 shrink-0 text-secondary"
      />
      <input
        type="search"
        placeholder="Search items..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-primary placeholder:text-secondary/60 outline-none"
      />
      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          className="shrink-0 text-secondary hover:text-primary"
          aria-label="Clear search"
        >
          <FontAwesomeIcon icon={faXmark} className="w-3" />
        </button>
      )}
    </div>
  );

  const leftPanel = (
    <ConanCategoryPanel
      categories={filteredCategories}
      search={search}
      selectedItemId={selectedItemId}
      openCategories={openCategories}
      onToggleCategory={handleToggleCategory}
      onSelectItem={handleSelectItem}
      onSelectCategory={handleSelectCategory}
    />
  );

  let mainContent: React.ReactNode;

  if (error) {
    mainContent = (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-secondary">
          Failed to load staged item data: {error}
        </p>
      </div>
    );
  } else if (!dataset) {
    mainContent = (
      <div className="flex h-full items-center justify-center">
        <p className="text-secondary">Loading Field Guide...</p>
      </div>
    );
  } else if (!selectedItemId && !selectedCategoryId) {
    mainContent = (
      <ConanCategoryGrid
        categories={filteredCategories}
        onSelectCategory={handleSelectCategory}
        datasetVersion={dataset.version}
        itemCount={dataset.entries.length}
      />
    );
  } else if (!selectedItemId && selectedCategoryId) {
    mainContent =
      selectedCategoryItems.length > 0 ? (
        <ConanItemGrid
          categoryName={selectedCategory?.displayName ?? "Category"}
          items={selectedCategoryItems}
          onSelectItem={handleSelectItem}
        />
      ) : (
        <div className="flex h-full items-center justify-center p-6">
          <p className="text-secondary">
            No items match this search in the selected category.
          </p>
        </div>
      );
  } else if (selectedEntry) {
    mainContent = (
      <div className="p-4">
        <ConanItemDetailPanel
          entry={selectedEntry}
          craftingMultiplier={settings.craftingCostMultiplier}
        />
      </div>
    );
  } else {
    mainContent = (
      <div className="flex h-full items-center justify-center">
        <p className="text-secondary">Loading item data...</p>
      </div>
    );
  }

  return (
    <main className="bg-main">
      <FieldGuideLayout
        sections={SECTIONS}
        searchSlot={searchSlot}
        onBack={selectedItemId || selectedCategoryId ? handleBack : undefined}
        onCategories={handleCategories}
        leftPanel={leftPanel}
      >
        {mainContent}
      </FieldGuideLayout>
    </main>
  );
}
