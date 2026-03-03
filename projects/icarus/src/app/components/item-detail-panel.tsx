"use client";

import dynamic from "next/dynamic";
import type {
  IcarusItemDetail,
  IcarusItemLookupMap,
  IcarusItemRecipe,
  IcarusQueryTag,
  IcarusStation,
  IcarusWorkflowEdge,
  WorkshopCurrencyDef,
} from "@/types/icarus";

const WorkflowGraph = dynamic(() => import("./workflow-graph"), { ssr: false });

const ICARUS_BASE_PATH = "/icarus";

export function toAssetUrl(assetPath: string | undefined): string {
  return assetPath ? `${ICARUS_BASE_PATH}/game-assets/${assetPath}` : "";
}

type Props = {
  detail: IcarusItemDetail;
  selectedRecipeIndex: number;
  onRecipeSelect: (i: number) => void;
  stationById: Map<string, IcarusStation>;
  queryTagById: Map<string, IcarusQueryTag>;
  itemLookup: IcarusItemLookupMap;
  workshopCurrencies?: Record<string, WorkshopCurrencyDef>;
};

export default function ItemDetailPanel({
  detail,
  selectedRecipeIndex,
  onRecipeSelect,
  stationById,
  queryTagById,
  itemLookup,
  workshopCurrencies = {},
}: Props) {
  const recipe: IcarusItemRecipe | undefined =
    detail.recipes[selectedRecipeIndex];

  const hasLore =
    Boolean(detail.description) ||
    Boolean(detail.flavorText) ||
    detail.weight != null ||
    detail.maxStack != null;

  const hasStats =
    detail.stats != null && Object.keys(detail.stats).length > 0;

  const hasWorkshopCosts =
    detail.workshopCosts != null &&
    (detail.workshopCosts.researchCost.length > 0 ||
      detail.workshopCosts.replicationCost.length > 0);

  return (
    <div className="space-y-4">
      {/* ── Item header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {detail.icon.exists && (
          <img
            src={toAssetUrl(detail.icon.assetPath)}
            alt={detail.displayName}
            className="h-12 w-12 rounded border border-primary bg-main object-contain"
            loading="lazy"
          />
        )}
        <div>
          <h3 className="text-lg font-bold text-primary">
            {detail.displayName}
          </h3>
          {detail.category && (
            <p className="text-xs text-secondary opacity-60">
              {detail.category}
            </p>
          )}
        </div>
      </div>

      {/* ── Lore / info block ───────────────────────────────────────────── */}
      {hasLore && (
        <div className="rounded border border-primary bg-card p-3 space-y-2">
          {detail.description && (
            <p className="text-sm text-secondary">{detail.description}</p>
          )}
          {detail.flavorText && (
            <p className="text-xs italic text-secondary opacity-70">
              {detail.flavorText}
            </p>
          )}
          {(detail.weight != null || detail.maxStack != null) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {detail.weight != null && (
                <span className="rounded border border-primary bg-main px-2 py-0.5 text-xs text-secondary">
                  Weight: {detail.weight}g
                </span>
              )}
              {detail.maxStack != null && (
                <span className="rounded border border-primary bg-main px-2 py-0.5 text-xs text-secondary">
                  Stack: ×{detail.maxStack}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Stats panel ─────────────────────────────────────────────────── */}
      {hasStats && (
        <div className="rounded border border-primary bg-card p-3">
          <h4 className="mb-2 text-sm font-bold text-primary">Stats</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {Object.entries(detail.stats!).map(([label, val]) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-secondary opacity-80">{label}</span>
                <span className="font-medium text-primary">
                  {typeof val === "number"
                    ? Number.isInteger(val)
                      ? val.toLocaleString()
                      : val.toFixed(2)
                    : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Workshop costs panel ────────────────────────────────────────── */}
      {hasWorkshopCosts && (
        <div className="rounded border border-highlight bg-card p-3 space-y-3">
          <h4 className="text-sm font-bold text-primary">Workshop</h4>

          {detail.workshopCosts!.researchCost.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-secondary opacity-70 uppercase tracking-wide">
                Research Cost
              </p>
              <div className="flex flex-wrap gap-2">
                {detail.workshopCosts!.researchCost.map((entry) => {
                  const cur = workshopCurrencies[entry.currencyId];
                  return (
                    <span
                      key={entry.currencyId}
                      className="inline-flex items-center gap-1 rounded border border-primary bg-main px-2 py-1 text-xs text-secondary"
                    >
                      {cur?.iconPath && (
                        <img
                          src={toAssetUrl(cur.iconPath)}
                          alt={cur.displayName}
                          className="h-4 w-4 object-contain"
                          loading="lazy"
                        />
                      )}
                      <span className="font-medium text-primary">
                        {entry.amount.toLocaleString()}
                      </span>
                      <span className="opacity-70">
                        {cur?.displayName ?? entry.currencyId}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {detail.workshopCosts!.replicationCost.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-secondary opacity-70 uppercase tracking-wide">
                Replication Cost
              </p>
              <div className="flex flex-wrap gap-2">
                {detail.workshopCosts!.replicationCost.map((entry) => {
                  const cur = workshopCurrencies[entry.currencyId];
                  return (
                    <span
                      key={entry.currencyId}
                      className="inline-flex items-center gap-1 rounded border border-primary bg-main px-2 py-1 text-xs text-secondary"
                    >
                      {cur?.iconPath && (
                        <img
                          src={toAssetUrl(cur.iconPath)}
                          alt={cur.displayName}
                          className="h-4 w-4 object-contain"
                          loading="lazy"
                        />
                      )}
                      <span className="font-medium text-primary">
                        {entry.amount.toLocaleString()}
                      </span>
                      <span className="opacity-70">
                        {cur?.displayName ?? entry.currencyId}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Recipes ─────────────────────────────────────────────────────── */}
      {detail.recipes.length > 0 && recipe && (
        <>
          {/* Recipe selector */}
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
          {recipe.workflow.rawMaterials.length > 0 && (
            <div className="rounded border border-primary bg-card p-3">
              <h4 className="text-sm font-bold text-primary">Raw Materials</h4>
              <ul className="mt-2 grid grid-cols-2 gap-1 text-sm text-secondary sm:grid-cols-3">
                {recipe.workflow.rawMaterials.map((raw) => {
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
            <h4 className="mb-2 text-sm font-bold text-primary">
              Crafting Graph
            </h4>
            <WorkflowGraph
              nodes={recipe.workflow.nodes}
              edges={recipe.workflow.edges as IcarusWorkflowEdge[]}
              itemLookup={itemLookup}
            />
          </div>
        </>
      )}

      {/* Fallback when item has no recipes and no workshop costs */}
      {detail.recipes.length === 0 && !hasWorkshopCosts && (
        <p className="text-sm text-secondary opacity-60">
          No crafting recipe available for this item.
        </p>
      )}
    </div>
  );
}
