"use client";

import { useEffect, useRef, useState } from "react";
import ItemDetailPanel, { toAssetUrl } from "./item-detail-panel";
import type {
  IcarusItemDetail,
  IcarusItemLookupMap,
  IcarusLetterChunk,
  IcarusQueryTag,
  IcarusStation,
  IcarusTierSection,
  WorkshopCurrencyDef,
} from "@/types/icarus";

const ICARUS_BASE_PATH = "/icarus";
const DATA_VERSION = "221.2";

// ── Local types ──────────────────────────────────────────────────────────────

type IngredientDef = {
  itemId: string;
  displayName: string;
  count: number;
  /** Station that crafts this ingredient (for the badge). */
  stationId?: string;
};

type PrerequisiteDef = {
  itemId: string;
  displayName: string;
  /** Station key matching ingredient.stationId — used to group this bench's ingredients. */
  stationId: string;
};

type StepDef = {
  from: string;
  to: string;
  tierId: "T2" | "T3" | "T4";
  gateway: {
    itemId: string;
    displayName: string;
    /** Station where the gateway bench is crafted (null = hand-crafted). */
    stationId: string | null;
  };
  ingredients: IngredientDef[];
  prerequisites: PrerequisiteDef[];
};

// ── Static progression data ──────────────────────────────────────────────────

const PROGRESSION_STEPS: StepDef[] = [
  {
    from: "Tier 1",
    to: "Tier 2",
    tierId: "T2",
    gateway: {
      itemId: "Crafting_Bench",
      displayName: "Crafting Bench",
      stationId: null,
    },
    ingredients: [
      { itemId: "Fiber", displayName: "Fiber", count: 60 },
      { itemId: "Wood", displayName: "Wood", count: 50 },
      { itemId: "Stone", displayName: "Stone", count: 12 },
      { itemId: "Leather", displayName: "Leather", count: 20 },
    ],
    prerequisites: [],
  },
  {
    from: "Tier 2",
    to: "Tier 3",
    tierId: "T3",
    gateway: {
      itemId: "Kit_Machining_Bench",
      displayName: "Machine Bench",
      stationId: "Crafting_Bench",
    },
    ingredients: [
      { itemId: "Wood", displayName: "Wood", count: 20 },
      { itemId: "Stone", displayName: "Stone", count: 12 },
      {
        itemId: "Iron_Nail",
        displayName: "Iron Nail",
        count: 120,
        stationId: "Anvil_Bench",
      },
      {
        itemId: "Iron_Ingot",
        displayName: "Iron Ingot",
        count: 40,
        stationId: "Stone_Furnace",
      },
      {
        itemId: "Epoxy",
        displayName: "Epoxy",
        count: 10,
        stationId: "Mortar_And_Pestle",
      },
      {
        itemId: "Rope",
        displayName: "Rope",
        count: 24,
        stationId: "Crafting_Bench",
      },
    ],
    prerequisites: [
      {
        itemId: "Anvil_Bench",
        displayName: "Anvil Bench",
        stationId: "Anvil_Bench",
      },
      {
        itemId: "Stone_Furnace",
        displayName: "Stone Furnace",
        stationId: "Stone_Furnace",
      },
      {
        itemId: "Kit_Mortar_And_Pestle",
        displayName: "Mortar & Pestle",
        stationId: "Mortar_And_Pestle",
      },
    ],
  },
  {
    from: "Tier 3",
    to: "Tier 4",
    tierId: "T4",
    gateway: {
      itemId: "Fabricator",
      displayName: "Fabricator",
      stationId: "Machining_Bench",
    },
    ingredients: [
      {
        itemId: "Aluminium",
        displayName: "Aluminium Ingot",
        count: 40,
        stationId: "Electric_Furnace",
      },
      {
        itemId: "Electronics",
        displayName: "Electronics",
        count: 30,
        stationId: "Machining_Bench",
      },
      {
        itemId: "Concrete_Mix",
        displayName: "Concrete Mix",
        count: 30,
        stationId: "Cement_Mixer",
      },
      {
        itemId: "Carbon_Fiber",
        displayName: "Carbon Fiber",
        count: 8,
        stationId: "Electric_Furnace",
      },
      {
        itemId: "Steel_Screw",
        displayName: "Steel Screw",
        count: 30,
        stationId: "Machining_Bench",
      },
    ],
    prerequisites: [
      {
        itemId: "Electric_Furnace",
        displayName: "Electric Furnace",
        stationId: "Electric_Furnace",
      },
      {
        itemId: "Cement_Mixer",
        displayName: "Cement Mixer",
        stationId: "Cement_Mixer",
      },
    ],
  },
];

// ── Helper ───────────────────────────────────────────────────────────────────

function letterBucket(itemId: string): string {
  return itemId[0]?.toLowerCase() ?? "a";
}

// ── IngredientChip ───────────────────────────────────────────────────────────

type ChipProps = {
  itemId: string;
  displayName: string;
  count?: number;
  stationId?: string;
  stationById: Map<string, IcarusStation>;
  itemLookup: IcarusItemLookupMap;
  onClick: (itemId: string, rect: DOMRect) => void;
  large?: boolean;
  /** Even larger — used for the gateway bench hero display. */
  xlarge?: boolean;
  /** Extra className applied to the outer button element. */
  className?: string;
  /** Truncate the name text — useful when the chip has a fixed width from a grid parent. */
  truncateName?: boolean;
  /** Icon-grid mode: shows icon + count badge, name/station revealed on hover. */
  iconMode?: boolean;
  /** Explicit icon override — used when the item isn't in itemLookup (e.g. stations). */
  iconAssetPath?: string;
};

function IngredientChip({
  itemId,
  displayName,
  count,
  stationId,
  stationById,
  itemLookup,
  onClick,
  large = false,
  xlarge = false,
  className,
  truncateName = false,
  iconMode = false,
  iconAssetPath: iconOverride,
}: ChipProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const entry = itemLookup[itemId];
  const resolvedIconPath = iconOverride ?? entry?.icon.assetPath;
  const station = stationId ? stationById.get(stationId) : undefined;

  function handleClick() {
    if (btnRef.current) {
      onClick(itemId, btnRef.current.getBoundingClientRect());
    }
  }

  if (xlarge) {
    return (
      <button
        ref={btnRef}
        onClick={handleClick}
        className={`group relative flex items-center gap-3 rounded border border-primary bg-card px-4 py-3 text-left transition-colors hover:border-highlight hover:bg-nav${className ? ` ${className}` : ""}`}
        title={`View details: ${displayName}`}
      >
        {resolvedIconPath ? (
          <img
            src={toAssetUrl(resolvedIconPath)}
            alt={displayName}
            className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded bg-main object-contain"
            loading="lazy"
          />
        ) : (
          <span className="inline-block h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded bg-main" />
        )}
        <span className="flex flex-col leading-tight">
          <span className="text-base sm:text-lg font-semibold text-primary">
            {displayName}
          </span>
          {station && (
            <span className="mt-1 flex items-center gap-1 text-xs sm:text-sm text-secondary opacity-70">
              {station.icon.assetPath ? (
                <img
                  src={toAssetUrl(station.icon.assetPath)}
                  alt={station.name}
                  className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-main object-contain"
                  loading="lazy"
                />
              ) : null}
              {station.name}
            </span>
          )}
        </span>
      </button>
    );
  }

  if (iconMode) {
    return (
      <button
        ref={btnRef}
        onClick={handleClick}
        className={`group relative rounded border border-primary bg-card p-2 transition-colors hover:border-highlight hover:bg-nav${className ? ` ${className}` : ""}`}
        title={`${displayName}${count != null ? ` ×${count}` : ""}${station ? ` — ${station.name}` : ""}`}
      >
        <div className="relative">
          {resolvedIconPath ? (
            <img
              src={toAssetUrl(resolvedIconPath)}
              alt={displayName}
              className="block h-10 w-10 sm:h-14 sm:w-14 rounded bg-main object-contain"
              loading="lazy"
            />
          ) : (
            <span className="block h-10 w-10 sm:h-14 sm:w-14 rounded bg-main" />
          )}
          {count != null && (
            <span className="absolute -bottom-1.5 -right-1.5 flex min-w-[1.25rem] items-center justify-center rounded bg-highlight px-1 py-0.5 text-[10px] font-bold leading-none text-main">
              ×{count}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      className={`group relative flex items-center gap-2 sm:gap-3 rounded border border-primary bg-card px-2 py-1.5 text-left transition-colors hover:border-highlight hover:bg-nav${className ? ` ${className}` : ""}`}
      title={`View details: ${displayName}`}
    >
      {/* Item icon */}
      {resolvedIconPath ? (
        <img
          src={toAssetUrl(resolvedIconPath)}
          alt={displayName}
          className={`shrink-0 rounded bg-main object-contain${large ? " h-7 w-7 sm:h-12 sm:w-12" : " h-6 w-6"}`}
          loading="lazy"
        />
      ) : (
        <span
          className={`inline-block shrink-0 rounded bg-main${large ? " h-7 w-7 sm:h-12 sm:w-12" : " h-6 w-6"}`}
        />
      )}

      <span
        className={`flex min-w-0 flex-col leading-tight${truncateName ? " overflow-hidden" : ""}`}
      >
        <span
          className={`font-semibold text-primary${large ? " text-xs sm:text-base" : " text-[11px]"}${truncateName ? " truncate" : ""}`}
        >
          {count != null && (
            <span className="mr-1 text-highlight">×{count}</span>
          )}
          {displayName}
        </span>

        {/* Station badge */}
        {station && (
          <span className="mt-0.5 flex items-center gap-1 text-[9px] sm:text-xs text-secondary opacity-70">
            {station.icon.assetPath ? (
              <img
                src={toAssetUrl(station.icon.assetPath)}
                alt={station.name}
                className="h-3 w-3 sm:h-4 sm:w-4 rounded bg-main object-contain"
                loading="lazy"
              />
            ) : null}
            {station.name}
          </span>
        )}
      </span>
    </button>
  );
}

// ── ItemModal ────────────────────────────────────────────────────────────────

type ModalProps = {
  itemId: string;
  detail: IcarusItemDetail | null;
  anchorRect: DOMRect;
  stationById: Map<string, IcarusStation>;
  queryTagById: Map<string, IcarusQueryTag>;
  itemLookup: IcarusItemLookupMap;
  workshopCurrencies: Record<string, WorkshopCurrencyDef>;
  onClose: () => void;
};

function ItemModal({
  detail,
  anchorRect,
  stationById,
  queryTagById,
  itemLookup,
  workshopCurrencies,
  onClose,
}: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [recipeIndex, setRecipeIndex] = useState(0);

  // Zoom-from-icon: compute transformOrigin then reveal
  useEffect(() => {
    const card = cardRef.current;
    if (card) {
      const cardRect = card.getBoundingClientRect();
      const ox = anchorRect.left + anchorRect.width / 2 - cardRect.left;
      const oy = anchorRect.top + anchorRect.height / 2 - cardRect.top;
      card.style.transformOrigin = `${ox}px ${oy}px`;
    }
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [anchorRect]);

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200${visible ? " opacity-100" : " opacity-0"}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full max-w-2xl overflow-y-auto rounded-xl border-2 border-highlight bg-nav shadow-2xl transition-all duration-200${visible ? " scale-100 opacity-100" : " scale-75 opacity-0"}`}
        style={{ maxHeight: "90vh" }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-primary px-4 py-3">
          <span className="font-pixel text-sm tracking-wide text-primary">
            Item Detail
          </span>
          <button
            onClick={onClose}
            className="rounded p-1 text-secondary transition-colors hover:text-primary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {detail == null ? (
            <p className="py-8 text-center text-sm text-secondary opacity-60">
              Loading…
            </p>
          ) : (
            <ItemDetailPanel
              detail={detail}
              selectedRecipeIndex={recipeIndex}
              onRecipeSelect={setRecipeIndex}
              stationById={stationById}
              queryTagById={queryTagById}
              itemLookup={itemLookup}
              workshopCurrencies={workshopCurrencies}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── ProgressionStep ──────────────────────────────────────────────────────────

type ProgressionStepProps = {
  step: StepDef;
  tierSection: IcarusTierSection | undefined;
  stationById: Map<string, IcarusStation>;
  itemLookup: IcarusItemLookupMap;
  onSelect: (itemId: string, rect: DOMRect) => void;
};

function ProgressionStep({
  step,
  tierSection,
  stationById,
  itemLookup,
  onSelect,
}: ProgressionStepProps) {
  // Benches unlocked in this tier: tier entries whose id matches a known station
  const benchesUnlocked = tierSection
    ? tierSection.entries.filter((e) => stationById.has(e.id))
    : [];

  const content = (
    <>
      {/* Gateway bench */}
      <div className="mt-4 rounded-lg border border-highlight bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Left: label + bench hero */}
          <div className="shrink-0">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary opacity-70">
              {step.to} Crafting Bench
            </p>
            <IngredientChip
              itemId={step.gateway.itemId}
              displayName={step.gateway.displayName}
              stationId={step.gateway.stationId ?? undefined}
              stationById={stationById}
              itemLookup={itemLookup}
              onClick={onSelect}
              xlarge
            />
          </div>
          {/* Right: label + recipe chips */}
          <div className="flex-1">
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary opacity-70">
              Recipe
            </h4>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {step.ingredients.map((ing) => (
                <IngredientChip
                  key={ing.itemId}
                  itemId={ing.itemId}
                  displayName={ing.displayName}
                  count={ing.count}
                  stationId={ing.stationId}
                  stationById={stationById}
                  itemLookup={itemLookup}
                  onClick={onSelect}
                  iconMode
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      {step.prerequisites.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-secondary opacity-70">
            You&rsquo;ll also need
          </h4>
          {/* Mobile: each prereq is a horizontal row [bench] = [items]
               Desktop: prereqs spread justified with ingredients centered below */}
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {step.prerequisites.map((prereq) => {
              const prereqIngredients = step.ingredients.filter(
                (ing) => ing.stationId === prereq.stationId,
              );
              return (
                <div
                  key={prereq.itemId}
                  className="flex flex-row items-center gap-2 rounded border border-primary bg-card p-2 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:p-3"
                >
                  {/* Bench chip */}
                  <IngredientChip
                    itemId={prereq.itemId}
                    displayName={prereq.displayName}
                    stationById={stationById}
                    itemLookup={itemLookup}
                    onClick={onSelect}
                    large
                  />
                  {/* “=” separator — mobile only */}
                  <span className="shrink-0 text-sm text-secondary opacity-50 sm:hidden">
                    =
                  </span>
                  {/* Ingredient icon chips */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {prereqIngredients.map((ing) => (
                      <IngredientChip
                        key={ing.itemId}
                        itemId={ing.itemId}
                        displayName={ing.displayName}
                        count={ing.count}
                        stationById={stationById}
                        itemLookup={itemLookup}
                        onClick={onSelect}
                        iconMode
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Benches unlocked in this tier */}
      {benchesUnlocked.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary opacity-70">
            Benches Unlocked in {step.to}
          </h4>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {benchesUnlocked.map((entry) => (
              <IngredientChip
                key={entry.id}
                itemId={entry.itemableRef}
                displayName={stationById.get(entry.id)?.name ?? entry.name}
                iconAssetPath={stationById.get(entry.id)?.icon.assetPath}
                stationById={stationById}
                itemLookup={itemLookup}
                onClick={onSelect}
                large
                className="w-full sm:w-auto"
                truncateName
              />
            ))}
          </div>
        </div>
      )}

      {/* Key items placeholder */}
      <div className="mt-4 rounded-lg border border-dashed border-primary px-4 py-3">
        <p className="text-xs text-secondary opacity-40">
          Key items — Coming Soon
        </p>
      </div>
    </>
  );

  return (
    <article className="rounded-lg border-2 border-primary bg-nav p-4 sm:p-6">
      {/* Step header */}
      <h3 className="font-pixel text-lg tracking-wide text-primary sm:text-2xl">
        {step.from} → {step.to}
      </h3>
      {content}
    </article>
  );
}

// ── TierCheatsheet (main) ────────────────────────────────────────────────────

export default function TierCheatsheet() {
  const [tiers, setTiers] = useState<IcarusTierSection[]>([]);
  const [itemLookup, setItemLookup] = useState<IcarusItemLookupMap>({});
  const [stationById, setStationById] = useState<Map<string, IcarusStation>>(
    new Map(),
  );
  const [queryTagById, setQueryTagById] = useState<Map<string, IcarusQueryTag>>(
    new Map(),
  );
  const [workshopCurrencies, setWorkshopCurrencies] = useState<
    Record<string, WorkshopCurrencyDef>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  // Detail cache & fetch tracking
  const [detailCache, setDetailCache] = useState<
    Record<string, IcarusItemDetail>
  >({});
  const fetchedBuckets = useRef<Set<string>>(new Set());

  // Modal state
  const [modal, setModal] = useState<{
    itemId: string;
    anchorRect: DOMRect;
  } | null>(null);

  // ── Initial data load ────────────────────────────────────────────────────

  useEffect(() => {
    const base = `${ICARUS_BASE_PATH}/data/${DATA_VERSION}`;

    Promise.all([
      fetch(`${base}/tier-sections.json`).then((r) => r.json()),
      fetch(`${base}/item-lookup.json`).then((r) => r.json()),
      fetch(`${base}/stations.json`).then((r) => r.json()),
      fetch(`${base}/query-tags.json`).then((r) => r.json()),
      fetch(`${base}/workshop-items.json`).then((r) => r.json()),
    ])
      .then(([tiersData, lookupData, stationsData, tagsData, workshopData]) => {
        setTiers(tiersData as IcarusTierSection[]);
        setItemLookup(lookupData as IcarusItemLookupMap);

        const stationMap = new Map<string, IcarusStation>();
        for (const s of stationsData as IcarusStation[]) {
          stationMap.set(s.id, s);
        }
        setStationById(stationMap);

        const tagMap = new Map<string, IcarusQueryTag>();
        for (const t of tagsData as IcarusQueryTag[]) {
          tagMap.set(t.id, t);
        }
        setQueryTagById(tagMap);

        const currencies = (
          workshopData as { currencies: Record<string, WorkshopCurrencyDef> }
        ).currencies;
        setWorkshopCurrencies(currencies ?? {});
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Lazy item detail loading ─────────────────────────────────────────────

  async function loadDetail(itemId: string) {
    const bucket = letterBucket(itemId);
    if (!fetchedBuckets.current.has(bucket)) {
      fetchedBuckets.current.add(bucket);
      const url = `${ICARUS_BASE_PATH}/data/${DATA_VERSION}/items/${bucket}.json`;
      const chunk: IcarusLetterChunk = await fetch(url).then((r) => r.json());
      setDetailCache((prev) => ({ ...prev, ...chunk }));
    }
  }

  // ── Select handler ───────────────────────────────────────────────────────

  function handleSelect(itemId: string, rect: DOMRect) {
    setModal({ itemId, anchorRect: rect });
    void loadDetail(itemId);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <section className="app-section">
        <div className="rounded-lg border-2 border-primary bg-card p-4 sm:p-6">
          <h2 className="font-pixel text-xl tracking-wide text-primary sm:text-2xl">
            Tier Progression Guide
          </h2>
          <p className="mt-4 text-secondary">Loading progression data…</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="app-section">
        <div className="rounded-lg border-2 border-primary bg-card p-4 sm:p-6">
          <h2 className="font-pixel text-xl tracking-wide text-primary sm:text-2xl">
            Tier Progression Guide
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary">
            The fastest path from T1 to T4 &mdash; which benches to build first
            and exactly what you need to craft them. Click any item to see its
            full details.
          </p>

          <div className="mt-6 space-y-6">
            {PROGRESSION_STEPS.map((step) => (
              <ProgressionStep
                key={step.tierId}
                step={step}
                tierSection={tiers.find((t) => t.id === step.tierId)}
                stationById={stationById}
                itemLookup={itemLookup}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Item detail modal */}
      {modal && (
        <ItemModal
          key={modal.itemId}
          itemId={modal.itemId}
          detail={detailCache[modal.itemId] ?? null}
          anchorRect={modal.anchorRect}
          stationById={stationById}
          queryTagById={queryTagById}
          itemLookup={itemLookup}
          workshopCurrencies={workshopCurrencies}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
