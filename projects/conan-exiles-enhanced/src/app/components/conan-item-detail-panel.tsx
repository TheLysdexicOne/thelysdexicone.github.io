import type { ItemEntry, ItemRecipeIngredient } from "@/lib/items";
import { ItemIcon, mapBadgeTone } from "./conan-field-guide-items-helpers";

type Props = {
  entry: ItemEntry;
  craftingMultiplier: number;
};

export default function ConanItemDetailPanel({
  entry,
  craftingMultiplier,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ItemIcon
          entry={entry}
          className="h-12 w-12 rounded border border-primary bg-main"
        />
        <div>
          <h3 className="text-lg font-bold text-primary">{entry.name}</h3>
          <p className="text-xs text-secondary opacity-60">{entry.sortLabel}</p>
        </div>
      </div>

      <div className="space-y-2 rounded border border-primary bg-card p-3">
        <p className="text-sm text-secondary">
          {entry.description || "No staged description available yet."}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded border border-primary bg-main px-2 py-0.5 text-xs text-secondary">
            Type: {entry.itemType}
          </span>
          <span className="rounded border border-primary bg-main px-2 py-0.5 text-xs text-secondary">
            Rarity: {entry.rarity}
          </span>
          <span
            className={`rounded border px-2 py-0.5 text-xs ${mapBadgeTone(entry.mapAvailability)}`}
          >
            {entry.mapAvailability}
          </span>
          <span className="rounded border border-primary bg-main px-2 py-0.5 text-xs text-secondary">
            Multiplier: {craftingMultiplier}x
          </span>
        </div>
      </div>

      <div className="rounded border border-primary bg-card p-3">
        <h4 className="mb-2 text-sm font-bold text-primary">Acquisition</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-secondary opacity-80">Obtain</span>
            <span className="text-right font-medium text-primary">
              {entry.obtainMethods.join(", ")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-secondary opacity-80">Craftable</span>
            <span className="font-medium text-primary">
              {entry.isCraftable ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-secondary opacity-80">Station</span>
            <span className="text-right font-medium text-primary">
              {entry.craftedIn?.stationName ?? "No station staged"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-secondary opacity-80">Recipe Rows</span>
            <span className="font-medium text-primary">
              {entry.recipe.length.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {entry.recipe.length > 0 && (
        <div className="rounded border border-primary bg-card p-3">
          <h4 className="text-sm font-bold text-primary">Inputs</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-secondary">
            {entry.recipe.map((ingredient: ItemRecipeIngredient) => (
              <li key={ingredient.itemId}>
                {ingredient.name} x{ingredient.quantity * craftingMultiplier}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded border border-primary bg-card p-3">
        <h4 className="mb-2 text-sm font-bold text-primary">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-primary bg-main px-2 py-1 text-xs text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded border border-primary bg-card p-3">
        <h4 className="mb-2 text-sm font-bold text-primary">Source</h4>
        <div className="grid grid-cols-1 gap-y-1 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-secondary opacity-80">ItemTable</span>
            <span className="break-all text-right font-medium text-primary">
              {entry.source.itemTable}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-secondary opacity-80">FeatTable</span>
            <span className="break-all text-right font-medium text-primary">
              {entry.source.featTable ?? "Not linked"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
