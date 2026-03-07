"use client";

import { useMemo, useState } from "react";
import type {
  WorkshopCurrencyDef,
  WorkshopCostEntry,
  WorkshopData,
  WorkshopItem,
} from "@/types/icarus";

const ICARUS_BASE_PATH = "/icarus";
function toAssetUrl(p: string) {
  return `${ICARUS_BASE_PATH}/game-assets/${p}`;
}

/** Top-left feature-level badge icons (same as item-grid.tsx). */
const FL_BADGE: Record<string, string> = {
  NewFrontiers: toAssetUrl(
    "Assets/2DArt/UI/Icons/T_FeatureLevelIcon_NewFrontiers3.webp",
  ),
  GreatHunts: toAssetUrl(
    "Assets/2DArt/UI/Icons/FeatureLevel/T_FeatureLevel_GH.webp",
  ),
  DangerousHorizons: toAssetUrl(
    "Assets/2DArt/UI/Icons/FeatureLevel/T_FeatureLevel_DH.webp",
  ),
};

/** Convert a setId like "Meta_Carbon_Armor" → "Carbon Armor". */
function setDisplayName(setId: string): string {
  return setId
    .replace(/^Meta_/, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Sub-components ─────────────────────────────────────────────────────────

function CostRow({
  label,
  costs,
  currencies,
}: {
  label: string;
  costs: WorkshopCostEntry[];
  currencies: Record<string, WorkshopCurrencyDef>;
}) {
  if (costs.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[9px] text-secondary opacity-60 md:text-[10px]">
        {label}:
      </span>
      {costs.map((c, i) => {
        const cur = currencies[c.currencyId];
        return (
          <span key={i} className="flex items-center gap-0.5">
            {cur?.iconPath && (
              <img
                src={toAssetUrl(cur.iconPath)}
                alt={cur?.displayName ?? c.currencyId}
                title={cur?.displayName ?? c.currencyId}
                className="h-3 w-3 object-contain md:h-4 md:w-4"
              />
            )}
            <span
              className="text-[10px] font-bold tabular-nums md:text-xs"
              style={{ color: cur?.color ?? "#ffffff" }}
            >
              {c.amount.toLocaleString()}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function ItemCard({
  item,
  currencies,
}: {
  item: WorkshopItem;
  currencies: Record<string, WorkshopCurrencyDef>;
}) {
  const flBadge = FL_BADGE[item.requiredFeatureLevel ?? ""];
  const hasCosts =
    item.researchCost.length > 0 || item.replicationCost.length > 0;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border-2 border-highlight bg-card p-2">
      {/* Icon + display name */}
      <div className="flex items-center gap-2">
        {/* Icon with optional DLC badge */}
        <div className="relative shrink-0">
          {item.icon.exists ? (
            <img
              src={toAssetUrl(item.icon.assetPath)}
              alt={item.displayName}
              className="h-10 w-10 object-contain md:h-12 md:w-12"
              loading="lazy"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-main md:h-12 md:w-12" />
          )}
          {/* Feature-level badge: top-left, white */}
          {flBadge && (
            <img
              src={flBadge}
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-3 w-3 object-contain brightness-0 invert md:h-4 md:w-4"
            />
          )}
        </div>
        <span className="flex-1 text-xs font-semibold leading-snug text-primary">
          {item.displayName}
        </span>
      </div>

      {/* Cost rows */}
      {hasCosts && (
        <div className="flex flex-col gap-0.5 border-t border-primary pt-1">
          <CostRow
            label="Research"
            costs={item.researchCost}
            currencies={currencies}
          />
          <CostRow
            label="Replicate"
            costs={item.replicationCost}
            currencies={currencies}
          />
        </div>
      )}
    </div>
  );
}

// ── Main catalog ───────────────────────────────────────────────────────────

type Props = { data: WorkshopData };

export default function WorkshopCatalog({ data }: Props) {
  const [search, setSearch] = useState("");
  const { currencies, items } = data;

  /**
   * Filter items by search text, then group by setId preserving the order
   * the groups first appear in the items array (= D_WorkshopItems.json order).
   */
  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const source = q
      ? items.filter((i) => i.displayName.toLowerCase().includes(q))
      : items;

    const groups = new Map<string, WorkshopItem[]>();
    for (const item of source) {
      const existing = groups.get(item.setId);
      if (existing) {
        existing.push(item);
      } else {
        groups.set(item.setId, [item]);
      }
    }
    return groups;
  }, [items, search]);

  /** Currencies that have an icon, in a stable display order. */
  const visibleCurrencies = useMemo(
    () =>
      Object.entries(currencies).filter(
        ([, c]) => c.iconPath && !c.displayName.includes("[DNT]"),
      ),
    [currencies],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b-2 border-highlight bg-nav px-4">
        <span className="font-pixel text-sm tracking-wide text-highlight">
          Workshop
        </span>
        <input
          type="search"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto w-48 rounded border border-primary bg-main px-2 py-1 text-sm text-primary placeholder-secondary outline-none focus:border-highlight md:w-64"
          aria-label="Search workshop items"
        />
      </div>

      {/* ── Currency legend ── */}
      <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 border-b border-primary bg-nav/40 px-4 py-2">
        {visibleCurrencies.map(([id, cur]) => (
          <span key={id} className="flex items-center gap-1">
            <img
              src={toAssetUrl(cur.iconPath)}
              alt={cur.displayName}
              className="h-4 w-4 object-contain"
            />
            <span
              className="text-[10px] font-semibold"
              style={{ color: cur.color }}
            >
              {cur.displayName}
            </span>
          </span>
        ))}
      </div>

      {/* ── Item groups ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredGroups.size === 0 ? (
          <p className="mt-8 text-center text-sm text-secondary opacity-60">
            No items match your search.
          </p>
        ) : (
          Array.from(filteredGroups.entries()).map(([setId, groupItems]) => (
            <section key={setId} className="mb-6">
              {/* Set header */}
              <h3 className="font-pixel mb-2 flex items-center gap-2 text-sm tracking-wide text-highlight">
                {setDisplayName(setId)}
                {groupItems.length > 1 && (
                  <span className="text-xs font-normal text-secondary opacity-40">
                    {groupItems.length} variants
                  </span>
                )}
              </h3>

              {/* Item grid */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {groupItems.map((item) => (
                  <ItemCard
                    key={item.workshopId}
                    item={item}
                    currencies={currencies}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
