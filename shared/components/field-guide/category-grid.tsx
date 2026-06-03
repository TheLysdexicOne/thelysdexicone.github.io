/**
 * Shared category grid for field guides.
 *
 * Displays category cards in a responsive grid with optional header/description/stats.
 * Categories have icons, names, and click handlers. Games control content via render props.
 */

export type CategoryGridHeaderProps = {
  /** Optional header text */
  header?: string;
  /** Optional description text */
  description?: string;
  /** Optional stats footer */
  stats?: string;
};

export type CategoryGridProps<
  TCategory extends { id: string; displayName: string },
> = {
  categories: TCategory[];
  onSelectCategory: (categoryId: string) => void;

  /** Render category icon */
  renderIcon: (category: TCategory) => React.ReactNode;

  /** Optional header configuration */
  headerConfig?: CategoryGridHeaderProps;
};

export default function CategoryGrid<
  TCategory extends { id: string; displayName: string },
>({
  categories,
  onSelectCategory,
  renderIcon,
  headerConfig,
}: CategoryGridProps<TCategory>) {
  return (
    <div className="p-4 md:p-6">
      {/* Optional header section */}
      {headerConfig && (
        <div className="mb-4">
          {headerConfig.header && (
            <h2 className="font-pixel text-lg tracking-wide text-primary">
              {headerConfig.header}
            </h2>
          )}
          {headerConfig.description && (
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              {headerConfig.description}
            </p>
          )}
          {headerConfig.stats && (
            <p className="mt-2 text-xs text-secondary opacity-60">
              {headerConfig.stats}
            </p>
          )}
        </div>
      )}

      {/* Category grid */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-4 2xl:grid-cols-5">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className="group flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-primary bg-card p-1.5 text-center transition-colors hover:border-highlight hover:bg-nav md:p-2 xl:p-3"
          >
            {renderIcon(category)}
            <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-primary md:text-[10px] xl:text-xs">
              {category.displayName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
