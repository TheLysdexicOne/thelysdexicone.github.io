"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type {
  IcarusItemDetail,
  IcarusItemIndexEntry,
  IcarusItemLookupMap,
  IcarusItemRecipe,
  IcarusLetterChunk,
  IcarusQueryTag,
  IcarusStation,
  IcarusWorkflowEdge,
} from "@/types/icarus";

// Loaded only on client — react-flow requires browser APIs
const WorkflowGraph = dynamic(() => import("./workflow-graph"), { ssr: false });

import { DATA_VERSION } from "@/lib/data-version";

const ICARUS_BASE_PATH = "/icarus";

function toDataUrl(path: string): string {
  return `${ICARUS_BASE_PATH}/data/${DATA_VERSION}/${path}`;
}

function toAssetUrl(assetPath: string | undefined): string {
  return assetPath ? `${ICARUS_BASE_PATH}/game-assets/${assetPath}` : "";
}

function getLetterBucket(displayName: string): string {
  const first = displayName[0]?.toLowerCase() ?? "0";
  return /[a-z]/.test(first) ? first : "0";
}

// ──────────────────────────────────────────────────────────────
// Sub-component: recipe detail panel
// ──────────────────────────────────────────────────────────────
type DetailPanelProps = {
  detail: IcarusItemDetail;
  selectedRecipeIndex: number;
  onRecipeSelect: (i: number) => void;
  stationById: Map<string, IcarusStation>;
  queryTagById: Map<string, IcarusQueryTag>;
  itemLookup: IcarusItemLookupMap;
};

function DetailPanel({
  detail,
  selectedRecipeIndex,
  onRecipeSelect,
  stationById,
  queryTagById,
  itemLookup,
}: DetailPanelProps) {
  const recipe: IcarusItemRecipe | undefined =
    detail.recipes[selectedRecipeIndex];
  if (!recipe) return null;

  const workflow = recipe.workflow;

  return (
    <div className="space-y-4">
      {/* Item header */}
      <div className="flex items-center gap-3">
        {detail.icon.exists && (
          <img
            src={toAssetUrl(detail.icon.assetPath)}
            alt={detail.displayName}
            className="h-12 w-12 rounded border border-primary bg-main object-contain"
            loading="lazy"
          />
        )}
        <h3 className="text-lg font-bold text-primary">{detail.displayName}</h3>
      </div>

      {/* Recipe selector (only when multiple recipes) */}
      {detail.recipes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {detail.recipes.map((r, i) => (
            <button
              key={r.recipeId}
              type="button"
              onClick={() => onRecipeSelect(i)}
              className={`rounded border px-2 py-1 text-xs transition-colors ${
                i === selectedRecipeIndex
                  ? "border-secondary bg-hover text-primary"
                  : "border-primary bg-card text-secondary hover:border-secondary"
              }`}
            >
              Recipe {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Station + power badges */}
      <div className="flex flex-wrap items-center gap-2">
        {recipe.stationIds.length === 0 ? (
          <span className="text-xs text-secondary">No station required</span>
        ) : (
          recipe.stationIds.map((sid) => {
            const station = stationById.get(sid);
            return (
              <span
                key={sid}
                className="inline-flex items-center gap-1 rounded border border-primary bg-card px-2 py-1 text-xs text-secondary"
              >
                {station?.icon.exists && station.icon.assetPath && (
                  <img
                    src={toAssetUrl(station.icon.assetPath)}
                    alt={station.name}
                    className="h-4 w-4 rounded bg-main object-contain"
                    loading="lazy"
                  />
                )}
                {station?.name ?? sid}
              </span>
            );
          })
        )}
        {recipe.requiredMillijoules > 0 && (
          <span className="rounded border border-primary bg-card px-2 py-1 text-xs text-secondary">
            {recipe.requiredMillijoules.toLocaleString()} mJ
          </span>
        )}
      </div>

      {/* Inputs / Outputs */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded border border-primary bg-card p-3">
          <h4 className="text-sm font-bold text-primary">Inputs</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-secondary">
            {recipe.inputs.map((inp) => (
              <li key={inp.itemId} className="flex items-center gap-2">
                {itemLookup[inp.itemId]?.icon.exists && (
                  <img
                    src={toAssetUrl(itemLookup[inp.itemId]?.icon.assetPath)}
                    alt={inp.itemName}
                    className="h-5 w-5 rounded bg-main object-contain"
                    loading="lazy"
                  />
                )}
                <span>
                  {inp.itemName} ×{inp.count}
                </span>
              </li>
            ))}
            {recipe.queryInputs.map((inp) => {
              const qt = queryTagById.get(inp.tagId);
              return (
                <li key={inp.tagId} className="flex items-center gap-2">
                  {qt?.icon.exists && qt.icon.assetPath ? (
                    <img
                      src={toAssetUrl(qt.icon.assetPath)}
                      alt={inp.displayName}
                      className="h-5 w-5 rounded bg-main object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-secondary text-[8px] text-secondary">
                      ?
                    </span>
                  )}
                  <span>
                    {inp.displayName} ×{inp.count}{" "}
                    <span className="opacity-60">(any)</span>
                  </span>
                </li>
              );
            })}
            {recipe.resourceInputs.map((inp) => (
              <li key={inp.resource} className="text-secondary">
                {inp.resource} ×{inp.count}{" "}
                <span className="opacity-60">(resource)</span>
              </li>
            ))}
            {recipe.inputs.length === 0 &&
              recipe.queryInputs.length === 0 &&
              recipe.resourceInputs.length === 0 && (
                <li className="opacity-60">No inputs</li>
              )}
          </ul>
        </div>

        <div className="rounded border border-primary bg-card p-3">
          <h4 className="text-sm font-bold text-primary">Output</h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            {recipe.outputs.map((out) => (
              <li key={out.itemId} className="flex items-center gap-2">
                {itemLookup[out.itemId]?.icon.exists && (
                  <img
                    src={toAssetUrl(itemLookup[out.itemId]?.icon.assetPath)}
                    alt={out.itemName}
                    className="h-5 w-5 rounded bg-main object-contain"
                    loading="lazy"
                  />
                )}
                <span className="font-medium text-primary">
                  {out.itemName} ×{out.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Raw materials */}
      {workflow.rawMaterials.length > 0 && (
        <div className="rounded border border-primary bg-card p-3">
          <h4 className="text-sm font-bold text-primary">Raw Materials</h4>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-sm text-secondary sm:grid-cols-3">
            {workflow.rawMaterials.map((raw) => {
              const item = itemLookup[raw.itemId];
              return (
                <li key={raw.itemId} className="flex items-center gap-1.5">
                  {item?.icon.exists && (
                    <img
                      src={toAssetUrl(item.icon.assetPath)}
                      alt={item.displayName}
                      className="h-5 w-5 shrink-0 rounded bg-main object-contain"
                      loading="lazy"
                    />
                  )}
                  <span className="truncate">
                    {item?.displayName ?? raw.itemId} ×{raw.count}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Crafting graph */}
      <div className="rounded border border-primary bg-card p-3">
        <h4 className="mb-2 text-sm font-bold text-primary">Crafting Graph</h4>
        <WorkflowGraph
          nodes={workflow.nodes}
          edges={workflow.edges as IcarusWorkflowEdge[]}
          itemLookup={itemLookup}
        />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
export default function RecipeExplorer() {
  const [items, setItems] = useState<IcarusItemIndexEntry[]>([]);
  const [stations, setStations] = useState<IcarusStation[]>([]);
  const [queryTags, setQueryTags] = useState<IcarusQueryTag[]>([]);
  const [itemLookup, setItemLookup] = useState<IcarusItemLookupMap>({});
  const [search, setSearch] = useState("");
  const [stationFilter, setStationFilter] = useState("all");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [detailCache, setDetailCache] = useState<
    Record<string, IcarusItemDetail>
  >({});

  // Tracks which letter buckets have been fetched (prevents duplicate requests)
  const fetchedBucketsRef = useRef<Set<string>>(new Set());

  // Load index + lookup + stations on mount
  useEffect(() => {
    async function loadCore() {
      setIsLoading(true);
      try {
        const [indexRes, stationsRes, lookupRes, queryRes] = await Promise.all([
          fetch(toDataUrl("item-index.json")),
          fetch(toDataUrl("stations.json")),
          fetch(toDataUrl("item-lookup.json")),
          fetch(toDataUrl("query-tags.json")),
        ]);
        const [indexData, stationsData, lookupData, queryData] =
          await Promise.all([
            indexRes.json() as Promise<IcarusItemIndexEntry[]>,
            stationsRes.json() as Promise<IcarusStation[]>,
            lookupRes.json() as Promise<IcarusItemLookupMap>,
            queryRes.json() as Promise<IcarusQueryTag[]>,
          ]);
        setItems(indexData);
        setStations(stationsData);
        setItemLookup(lookupData);
        setQueryTags(queryData);
        if (indexData.length > 0) {
          setSelectedItemId(indexData[0].itemId);
        }
      } finally {
        setIsLoading(false);
      }
    }
    void loadCore();
  }, []);

  // Fetch the letter chunk for the selected item (once per bucket)
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
    // detailCache intentionally omitted — we use the ref to guard duplicate fetches
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

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const byStation =
        stationFilter === "all" || item.stationIds.includes(stationFilter);
      if (!byStation) return false;
      if (!q) return true;
      return item.displayName.toLowerCase().includes(q);
    });
  }, [items, search, stationFilter]);

  const handleItemClick = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
  }, []);

  const selectedDetail = detailCache[selectedItemId];
  const isLoadingDetail =
    Boolean(selectedItemId) && !selectedDetail && !isLoading;

  return (
    <section id="recipes" className="app-section">
      <div className="rounded-lg border-2 border-primary bg-card p-4 sm:p-6">
        <h2 className="font-pixel text-xl tracking-wide text-primary sm:text-2xl">
          Recipe Explorer
        </h2>

        {/* Filter bar */}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="w-full rounded-lg border-2 border-primary bg-nav px-3 py-2 text-sm text-primary placeholder:text-secondary"
          />
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="w-full rounded-lg border-2 border-primary bg-nav px-3 py-2 text-sm text-primary"
          >
            <option value="all">All Stations</option>
            {stations
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
          <div className="rounded-lg border-2 border-primary bg-nav px-3 py-2 text-sm text-secondary">
            {filteredItems.length.toLocaleString()} of{" "}
            {items.length.toLocaleString()} items
          </div>
        </div>

        {isLoading ? (
          <p className="mt-4 text-secondary">Loading item index…</p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            {/* ── Item list ── */}
            <div className="max-h-[38rem] overflow-y-auto rounded-lg border-2 border-primary bg-nav p-2">
              {filteredItems.length === 0 ? (
                <p className="px-2 py-3 text-sm text-secondary">
                  No items match your search.
                </p>
              ) : (
                filteredItems.map((item) => {
                  const isActive = item.itemId === selectedItemId;
                  const stationNames = item.stationIds
                    .map((sid) => stationById.get(sid)?.name ?? sid)
                    .slice(0, 2)
                    .join(", ");

                  return (
                    <button
                      key={item.itemId}
                      type="button"
                      onClick={() => handleItemClick(item.itemId)}
                      className={`mb-2 w-full rounded-lg border-2 p-3 text-left transition-colors ${
                        isActive
                          ? "border-secondary bg-hover"
                          : "border-primary bg-card hover:border-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon.exists && (
                          <img
                            src={toAssetUrl(item.icon.assetPath)}
                            alt={item.displayName}
                            className="h-8 w-8 shrink-0 rounded border border-primary bg-main object-contain"
                            loading="lazy"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-primary">
                            {item.displayName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-secondary">
                            {stationNames || "No station"}
                          </p>
                        </div>
                        {item.recipeCount > 1 && (
                          <span className="shrink-0 rounded border border-secondary px-1.5 py-0.5 text-[10px] text-secondary">
                            {item.recipeCount}×
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* ── Detail panel ── */}
            <div className="rounded-lg border-2 border-primary bg-nav p-4">
              {!selectedItemId ? (
                <p className="text-secondary">
                  Select an item to view recipes.
                </p>
              ) : isLoadingDetail ? (
                <p className="text-secondary">Loading…</p>
              ) : selectedDetail ? (
                <DetailPanel
                  detail={selectedDetail}
                  selectedRecipeIndex={selectedRecipeIndex}
                  onRecipeSelect={setSelectedRecipeIndex}
                  stationById={stationById}
                  queryTagById={queryTagById}
                  itemLookup={itemLookup}
                />
              ) : (
                <p className="text-secondary">Loading…</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
