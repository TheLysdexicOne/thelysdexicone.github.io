import { IconTile, type ItemCategory } from "./conan-field-guide-items-helpers";

type Props = {
  categories: ItemCategory[];
  onSelectCategory: (categoryId: string) => void;
  datasetVersion: string;
  itemCount: number;
};

export default function ConanCategoryGrid({
  categories,
  onSelectCategory,
  datasetVersion,
  itemCount,
}: Props) {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h2 className="font-pixel text-lg tracking-wide text-primary">
          Browse by Category
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Browse the Conan field guide by category first, then drill into each
          item for staged description, map availability, and source details.
        </p>
        <p className="mt-2 text-xs text-secondary opacity-60">
          Data version {datasetVersion} · {itemCount.toLocaleString()} staged
          items
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-4 2xl:grid-cols-5">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className="group flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-primary bg-card p-1.5 text-center transition-colors hover:border-highlight hover:bg-nav md:p-2 xl:p-3"
          >
            <IconTile
              className="h-8 w-8 md:h-16 md:w-16 xl:h-32 xl:w-32"
              alt={`${category.displayName} category`}
              iconPath={category.officialIconPath}
              placeholderLabel={category.displayName}
            />
            <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-primary md:text-[10px] xl:text-xs">
              {category.displayName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
