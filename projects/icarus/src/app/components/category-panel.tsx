"use client";

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import type { IcarusCategory, IcarusItemIndexEntry } from "@/types/icarus";

const ICARUS_BASE_PATH = "/icarus";

function toAssetUrl(p: string) {
  return `${ICARUS_BASE_PATH}/game-assets/${p}`;
}

type Props = {
  categories: IcarusCategory[];
  items: IcarusItemIndexEntry[];
  search: string;
  selectedItemId: string;
  openCategories: Set<string>;
  onToggleCategory: (id: string) => void;
  onSelectItem: (itemId: string) => void;
  /** Navigate to the item grid for this category in the main panel. */
  onSelectCategory?: (catId: string) => void;
};

export default function CategoryPanel({
  categories,
  items,
  search,
  selectedItemId,
  openCategories,
  onToggleCategory,
  onSelectItem,
  onSelectCategory,
}: Props) {
  const q = search.trim().toLowerCase();

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, IcarusItemIndexEntry[]>();
    for (const item of items) {
      const cat = item.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return map;
  }, [items]);

  const matchingCategories = useMemo(() => {
    if (!q) return new Set<string>();
    const set = new Set<string>();
    for (const item of items) {
      if (item.displayName.toLowerCase().includes(q)) {
        set.add(item.category || "Other");
      }
    }
    return set;
  }, [items, q]);

  return (
    <div role="navigation" aria-label="Item categories" className="py-2">
      {categories.map((cat) => {
        const catItems = itemsByCategory.get(cat.id) ?? [];
        const filteredItems = q
          ? catItems.filter((i) => i.displayName.toLowerCase().includes(q))
          : catItems;

        // Skip categories with no search matches
        if (q && filteredItems.length === 0) return null;

        // Auto-expand when a search is active and this category has matches
        const isOpen =
          openCategories.has(cat.id) ||
          (q.length > 0 && matchingCategories.has(cat.id));

        return (
          <div
            key={cat.id}
            className="border-b border-primary/20 last:border-0"
          >
            {/* Split row: left side navigates to item grid, right side toggles accordion */}
            <div className="flex w-full items-center">
              <button
                type="button"
                onClick={() => onSelectCategory?.(cat.id)}
                className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-highlight/30"
              >
                {cat.representativeIcon.exists && (
                  <img
                    src={toAssetUrl(cat.representativeIcon.assetPath)}
                    alt=""
                    className="h-5 w-5 shrink-0 rounded bg-main object-contain"
                    loading="lazy"
                  />
                )}
                <span className="flex-1 truncate text-sm font-semibold text-primary lg:text-base">
                  {cat.displayName}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onToggleCategory(cat.id)}
                className="flex shrink-0 items-center gap-1.5 px-2 py-2 transition-colors hover:bg-highlight/30"
              >
                <span className="text-xs text-secondary opacity-50 sm:text-sm">
                  {filteredItems.length}
                </span>
                <FontAwesomeIcon
                  icon={isOpen ? faMinus : faPlus}
                  className="w-3 shrink-0 text-secondary opacity-60"
                />
              </button>
            </div>

            {isOpen && (
              <ul>
                {filteredItems.map((item, idx) => (
                  <li
                    key={item.itemId}
                    className={idx % 2 === 1 ? "bg-primary/[0.04]" : ""}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectItem(item.itemId)}
                      className={`flex w-full items-center gap-2 py-1 pl-6 pr-3 text-left transition-colors ${
                        item.itemId === selectedItemId
                          ? "bg-highlight text-primary"
                          : "text-secondary hover:bg-highlight/40 hover:text-primary"
                      }`}
                    >
                      <span className="flex-1 truncate text-xs sm:text-sm">
                        {item.displayName}
                      </span>
                      {item.recipeCount > 1 && (
                        <span className="shrink-0 text-[10px] opacity-40 sm:text-xs">
                          {item.recipeCount}×
                        </span>
                      )}
                      {/* DLC indicator dot */}
                      {(item.requiredFeatureLevel || item.cosmeticPack) && (
                        <span
                          className={`ml-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                            item.cosmeticPack ||
                            item.requiredFeatureLevel === "Homestead" ||
                            item.requiredFeatureLevel === "Laika"
                              ? "bg-highlight opacity-70"
                              : "bg-secondary opacity-30"
                          }`}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
