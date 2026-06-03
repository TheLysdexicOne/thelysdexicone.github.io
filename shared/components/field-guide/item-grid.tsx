/**
 * Shared item grid for field guides.
 *
 * Displays item cards in a responsive grid with configurable badges, borders, and labels.
 * Games control visual presentation via render props and variant functions.
 */

export type ItemGridProps<TItem> = {
  categoryName: string;
  items: TItem[];
  onSelectItem: (item: TItem) => void;

  /** Get unique ID from item */
  getItemId: (item: TItem) => string;

  /** Get display name from item */
  getItemName: (item: TItem) => string;

  /** Render item icon */
  renderIcon: (item: TItem) => React.ReactNode;

  /** Optional: Render badge overlays */
  renderBadges?: (item: TItem) => React.ReactNode;

  /** Optional: Render secondary label below name */
  renderSecondaryLabel?: (item: TItem) => React.ReactNode;

  /** Optional: Border variant logic */
  borderVariant?: (item: TItem) => "default" | "highlight" | "muted";
};

export default function ItemGrid<TItem>({
  categoryName,
  items,
  onSelectItem,
  getItemId,
  getItemName,
  renderIcon,
  renderBadges,
  renderSecondaryLabel,
  borderVariant,
}: ItemGridProps<TItem>) {
  return (
    <div className="p-4 md:p-6">
      <h2 className="font-pixel mb-4 text-lg tracking-wide text-primary">
        {categoryName}
      </h2>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 2xl:grid-cols-10">
        {items.map((item) => {
          const itemId = getItemId(item);
          const displayName = getItemName(item);
          const variant = borderVariant?.(item) ?? "default";
          const borderClass = {
            default: "border-primary",
            highlight: "border-highlight",
            muted: "border-secondary",
          }[variant];

          return (
            <button
              key={itemId}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group flex flex-col items-center justify-center gap-1 rounded-lg border-2 ${borderClass} bg-card p-1.5 text-center transition-colors hover:border-highlight hover:bg-nav md:p-2`}
            >
              {/* Icon with badge overlay */}
              <div className="relative">
                {renderIcon(item)}
                {renderBadges?.(item)}
              </div>

              {/* Item name */}
              <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-primary md:text-[10px] xl:text-xs">
                {displayName}
              </span>

              {/* Optional secondary label */}
              {renderSecondaryLabel?.(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
