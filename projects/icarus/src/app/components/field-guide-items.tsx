"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import type {
  IcarusCategory,
  IcarusItemDetail,
  IcarusItemIndexEntry,
  IcarusItemLookupMap,
  IcarusLetterChunk,
  IcarusQueryTag,
  IcarusStation,
  WorkshopCurrencyDef,
} from "@/types/icarus";
import FieldGuideLayout from "./field-guide-layout";
import CategoryPanel from "./category-panel";
import CategoryGrid from "./category-grid";
import ItemGrid from "./item-grid";
import ItemDetailPanel from "./item-detail-panel";

const ICARUS_BASE_PATH = "/icarus";
const DATA_VERSION = "221.2";

function toDataUrl(p: string) {
  return `${ICARUS_BASE_PATH}/data/${DATA_VERSION}/${p}`;
}

function getLetterBucket(displayName: string): string {
  const first = displayName[0]?.toLowerCase() ?? "0";
  return /[a-z]/.test(first) ? first : "0";
}

export default function FieldGuideItems() {
  const [items, setItems] = useState<IcarusItemIndexEntry[]>([]);
  const [categories, setCategories] = useState<IcarusCategory[]>([]);
  const [stations, setStations] = useState<IcarusStation[]>([]);
  const [queryTags, setQueryTags] = useState<IcarusQueryTag[]>([]);
  const [itemLookup, setItemLookup] = useState<IcarusItemLookupMap>({});
  const [workshopCurrencies, setWorkshopCurrencies] = useState<
    Record<string, WorkshopCurrencyDef>
  >({});

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [detailCache, setDetailCache] = useState<
    Record<string, IcarusItemDetail>
  >({});

  const fetchedBucketsRef = useRef<Set<string>>(new Set());

  // ── Load core data on mount ──────────────────────────────────────────────
  useEffect(() => {
    async function loadCore() {
      setIsLoading(true);
      try {
        const [indexRes, catsRes, stationsRes, lookupRes, queryRes, workshopRes] =
          await Promise.all([
            fetch(toDataUrl("item-index.json")),
            fetch(toDataUrl("categories.json")),
            fetch(toDataUrl("stations.json")),
            fetch(toDataUrl("item-lookup.json")),
            fetch(toDataUrl("query-tags.json")),
            fetch(toDataUrl("workshop-items.json")),
          ]);
        const [indexData, catsData, stationsData, lookupData, queryData, workshopData] =
          await Promise.all([
            indexRes.json() as Promise<IcarusItemIndexEntry[]>,
            catsRes.json() as Promise<IcarusCategory[]>,
            stationsRes.json() as Promise<IcarusStation[]>,
            lookupRes.json() as Promise<IcarusItemLookupMap>,
            queryRes.json() as Promise<IcarusQueryTag[]>,
            workshopRes.json() as Promise<{ currencies: Record<string, WorkshopCurrencyDef>; items: unknown[] }>,
          ]);
        setItems(indexData);
        setCategories(catsData);
        setStations(stationsData);
        setItemLookup(lookupData);
        setQueryTags(queryData);
        setWorkshopCurrencies(workshopData.currencies ?? {});
      } finally {
        setIsLoading(false);
      }
    }
    void loadCore();
  }, []);

  // ── Fetch letter chunk when an item is selected ──────────────────────────
  useEffect(() => {
    if (!selectedItemId || isLoading || items.length === 0) return;
    if (detailCache[selectedItemId]) {
      setSelectedRecipeIndex(0);
      return;
    }

    const selectedItem = items.find((i) => i.itemId === selectedItemId);
    if (!selectedItem) return;

    const bucket = getLetterBucket(selectedItem.displayName);
    if (fetchedBucketsRef.current.has(bucket)) return;
    fetchedBucketsRef.current.add(bucket);

    let cancelled = false;
    void fetch(toDataUrl(`items/${bucket}.json`))
      .then((r) => r.json())
      .then((chunk: IcarusLetterChunk) => {
        if (!cancelled) {
          setDetailCache((prev) => ({ ...prev, ...chunk }));
          setSelectedRecipeIndex(0);
        }
      })
      .catch(() => {
        if (!cancelled) fetchedBucketsRef.current.delete(bucket);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemId, isLoading, items]);

  const stationById = useMemo(
    () => new Map(stations.map((s) => [s.id, s])),
    [stations],
  );
  const queryTagById = useMemo(
    () => new Map(queryTags.map((q) => [q.id, q])),
    [queryTags],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSelectItem = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
    setSelectedRecipeIndex(0);
  }, []);

  const handleToggleCategory = useCallback((catId: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }, []);

  // Clicking a category card or category name → show item grid for that category
  const handleSelectCategory = useCallback((catId: string) => {
    setSelectedCategoryId(catId);
    setOpenCategories((prev) => new Set([...prev, catId]));
    setSelectedItemId("");
    setSearch("");
  }, []);

  const handleBack = useCallback(() => {
    if (selectedItemId) {
      setSelectedItemId("");
    } else {
      setSelectedCategoryId("");
    }
  }, [selectedItemId]);

  const handleCategories = useCallback(() => {
    setSelectedItemId("");
    setSelectedCategoryId("");
    setSearch("");
  }, []);

  const selectedDetail = detailCache[selectedItemId];
  const isLoadingDetail =
    Boolean(selectedItemId) && !selectedDetail && !isLoading;

  // ── Search slot (shown in the top bar) ───────────────────────────────────
  const searchSlot = (
    <div className="flex min-w-0 max-w-xs flex-1 items-center gap-1 rounded border border-primary bg-main px-2 py-1.5">
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        className="w-3 shrink-0 text-secondary"
      />
      <input
        type="search"
        placeholder="Search items…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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

  // ── Left accordion panel ─────────────────────────────────────────────────
  const leftPanel = (
    <CategoryPanel
      categories={categories}
      items={items}
      search={search}
      selectedItemId={selectedItemId}
      openCategories={openCategories}
      onToggleCategory={handleToggleCategory}
      onSelectItem={handleSelectItem}
      onSelectCategory={handleSelectCategory}
    />
  );

  // ── Main panel content ───────────────────────────────────────────────────
  let mainContent: React.ReactNode;

  if (isLoading) {
    mainContent = (
      <div className="flex h-full items-center justify-center">
        <p className="text-secondary">Loading Field Guide…</p>
      </div>
    );
  } else if (!selectedItemId && !selectedCategoryId) {
    mainContent = (
      <CategoryGrid
        categories={categories}
        onSelectCategory={handleSelectCategory}
      />
    );
  } else if (!selectedItemId && selectedCategoryId) {
    const cat = categories.find((c) => c.id === selectedCategoryId);
    const catItems = items.filter((i) => i.category === selectedCategoryId);
    mainContent = (
      <ItemGrid
        categoryName={cat?.displayName ?? selectedCategoryId}
        items={catItems}
        onSelectItem={handleSelectItem}
      />
    );
  } else if (isLoadingDetail) {
    mainContent = (
      <div className="flex h-full items-center justify-center">
        <p className="text-secondary">Loading item data…</p>
      </div>
    );
  } else if (selectedDetail) {
    mainContent = (
      <div className="p-4">
        <ItemDetailPanel
          detail={selectedDetail}
          selectedRecipeIndex={selectedRecipeIndex}
          onRecipeSelect={setSelectedRecipeIndex}
          stationById={stationById}
          queryTagById={queryTagById}
          itemLookup={itemLookup}
          workshopCurrencies={workshopCurrencies}
        />
      </div>
    );
  } else {
    mainContent = (
      <div className="flex h-full items-center justify-center">
        <p className="text-secondary">Loading…</p>
      </div>
    );
  }

  return (
    <FieldGuideLayout
      searchSlot={searchSlot}
      onBack={selectedItemId || selectedCategoryId ? handleBack : undefined}
      onCategories={handleCategories}
      leftPanel={leftPanel}
    >
      {mainContent}
    </FieldGuideLayout>
  );
}
