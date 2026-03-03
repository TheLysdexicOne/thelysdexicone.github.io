import type { IcarusCategory } from "@/types/icarus";

const ICARUS_BASE_PATH = "/icarus";

function toAssetUrl(p: string) {
  return `${ICARUS_BASE_PATH}/game-assets/${p}`;
}

type Props = {
  categories: IcarusCategory[];
  onSelectCategory: (categoryId: string) => void;
};

export default function CategoryGrid({ categories, onSelectCategory }: Props) {
  return (
    <div className="p-4 md:p-6">
      <h2 className="font-pixel mb-4 text-lg tracking-wide text-primary">
        Browse by Category
      </h2>
      {/*
       * Column counts are paired with icon sizes so cards stay proportional:
       *   base  → 4 cols, 32 px icons (h-8)
       *   sm    → 5 cols, 32 px icons
       *   md    → 5 cols, 64 px icons (h-16)
       *   lg    → 6 cols, 64 px icons
       *   xl    → 4 cols, 128 px icons (h-32, native)
       *   2xl   → 5 cols, 128 px icons
       */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-4 2xl:grid-cols-5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className="group flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-primary bg-card p-1.5 text-center transition-colors hover:border-highlight hover:bg-nav md:p-2 xl:p-3"
          >
            {cat.representativeIcon.exists ? (
              <img
                src={toAssetUrl(cat.representativeIcon.assetPath)}
                alt={cat.displayName}
                className="h-8 w-8 object-contain md:h-16 md:w-16 xl:h-32 xl:w-32"
                loading="lazy"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-main md:h-16 md:w-16 xl:h-32 xl:w-32" />
            )}
            <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-primary md:text-[10px] xl:text-xs">
              {cat.displayName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
