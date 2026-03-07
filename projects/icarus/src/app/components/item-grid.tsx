import type { IcarusItemIndexEntry } from "@/types/icarus";

const ICARUS_BASE_PATH = "/icarus";

function toAssetUrl(p: string) {
  return `${ICARUS_BASE_PATH}/game-assets/${p}`;
}

/**
 * Top-left badge: feature-level icons (white, no background).
 * Shown for expansion content that unlocks new gameplay (GreatHunts, NewFrontiers).
 */
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

/**
 * Bottom-left badge: cosmetic/paid-pack icons (gold tint, dark bg).
 * Indexed by both requiredFeatureLevel (Homestead, Laika) and cosmeticPack values.
 */
const CP_BADGE: Record<string, string> = {
  // Feature-level packs with their own icons
  Homestead: toAssetUrl("Assets/2DArt/UI/Icons/T_Icon_Homestead.webp"),
  Laika: toAssetUrl("Assets/2DArt/UI/Icons/T_ICON_Paws.webp"),
  // Decoration/workshop packs all share the money icon
  ArtDeco: toAssetUrl("Assets/2DArt/UI/Icons/T_ICON_Money_Symbol_Double.webp"),
  Industrial: toAssetUrl(
    "Assets/2DArt/UI/Icons/T_ICON_Money_Symbol_Double.webp",
  ),
  Interior: toAssetUrl("Assets/2DArt/UI/Icons/T_ICON_Money_Symbol_Double.webp"),
};

type Props = {
  categoryName: string;
  items: IcarusItemIndexEntry[];
  onSelectItem: (itemId: string) => void;
};

export default function ItemGrid({ categoryName, items, onSelectItem }: Props) {
  return (
    <div className="p-4 md:p-6">
      <h2 className="font-pixel mb-4 text-lg tracking-wide text-primary">
        {categoryName}
      </h2>
      {/*
       * Column counts paired with icon sizes (item icons native at 64×64):
       *   base  → 4 cols, 32 px icons (h-8)
       *   sm    → 6 cols, 32 px icons
       *   md    → 6 cols, 48 px icons (h-12)
       *   lg    → 8 cols, 48 px icons
       *   xl    → 8 cols, 64 px icons (h-16, native)
       *   2xl   → 10 cols, 64 px icons
       */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 2xl:grid-cols-10">
        {items.map((item) => {
          const flBadge = FL_BADGE[item.requiredFeatureLevel ?? ""];
          // cosmeticPack takes priority; fall back to requiredFeatureLevel for Homestead/Laika
          const cpBadge =
            CP_BADGE[item.cosmeticPack ?? ""] ??
            CP_BADGE[item.requiredFeatureLevel ?? ""];
          const isWorkshop = item.cosmeticPack === "Workshop";

          return (
            <button
              key={item.itemId}
              type="button"
              onClick={() => onSelectItem(item.itemId)}
              className={`group flex flex-col items-center justify-center gap-1 rounded-lg border-2 ${
                isWorkshop ? "border-highlight" : "border-primary"
              } bg-card p-1.5 text-center transition-colors hover:border-highlight hover:bg-nav md:p-2`}
            >
              {/* Icon with positioned badge overlays */}
              <div className="relative">
                {item.icon.exists ? (
                  <img
                    src={toAssetUrl(item.icon.assetPath)}
                    alt={item.displayName}
                    className="h-8 w-8 object-contain md:h-12 md:w-12 xl:h-16 xl:w-16"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-main md:h-12 md:w-12 xl:h-16 xl:w-16" />
                )}

                {/* Top-left: feature-level badge — white, no bg/border */}
                {flBadge && (
                  <img
                    src={flBadge}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-0 h-3 w-3 object-contain brightness-0 invert md:h-4 md:w-4 xl:h-5 xl:w-5"
                  />
                )}

                {/* Bottom-left: cosmetic/paid-pack badge — gold icon, dark bg, gold border */}
                {cpBadge && (
                  <span className="pointer-events-none absolute bottom-0 left-0 flex h-3 w-3 items-center justify-center rounded-[2px] border border-[#f1ad1c] bg-[#191919] p-px md:h-4 md:w-4 xl:h-5 xl:w-5">
                    <img
                      src={cpBadge}
                      alt=""
                      aria-hidden
                      className="h-full w-full object-contain"
                    />
                  </span>
                )}
              </div>

              <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-primary md:text-[10px] xl:text-xs">
                {item.displayName}
              </span>
              {item.recipeCount > 1 && (
                <span className="text-[8px] text-secondary opacity-50 md:text-[9px]">
                  {item.recipeCount}×
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
