import type { ItemEntry } from "@/lib/items";
import {
  ItemIcon,
  mapBadgeTone,
  mapShortBadge,
} from "./conan-field-guide-items-helpers";

type Props = {
  categoryName: string;
  items: ItemEntry[];
  onSelectItem: (itemId: string) => void;
};

export default function ConanItemGrid({
  categoryName,
  items,
  onSelectItem,
}: Props) {
  return (
    <div className="p-4 md:p-6">
      <h2 className="font-pixel mb-4 text-lg tracking-wide text-primary">
        {categoryName}
      </h2>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 2xl:grid-cols-10">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item.id)}
            className="group flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-primary bg-card p-1.5 text-center transition-colors hover:border-highlight hover:bg-nav md:p-2"
          >
            <div className="relative">
              <ItemIcon
                entry={item}
                className="h-8 w-8 md:h-12 md:w-12 xl:h-16 xl:w-16"
              />
              <span
                className={`pointer-events-none absolute bottom-0 right-0 rounded border px-1 py-0.5 text-[8px] leading-none ${mapBadgeTone(item.mapAvailability)}`}
              >
                {mapShortBadge(item.mapAvailability)}
              </span>
            </div>
            <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-primary md:text-[10px] xl:text-xs">
              {item.name}
            </span>
            {item.isCraftable && (
              <span className="text-[8px] text-secondary opacity-50 md:text-[9px]">
                crafted
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
