import { ItemGrid } from "@shared/components/field-guide";
import { ItemIcon } from "./conan-field-guide-items-helpers";
import type { ItemEntry } from "@/lib/items";
import { conanConfig } from "@shared/config/games/conan";

type Props = {
  categoryName: string;
  items: ItemEntry[];
  onSelectItem: (itemId: string) => void;
};

export default function ConanItemGridShared({
  categoryName,
  items,
  onSelectItem,
}: Props) {
  const { itemCard } = conanConfig.fieldGuide!;

  return (
    <ItemGrid
      categoryName={categoryName}
      items={items}
      onSelectItem={(item) => onSelectItem(item.id)}
      getItemId={(item) => item.id}
      getItemName={(item) => item.name}
      renderIcon={(item) => (
        <ItemIcon
          entry={item}
          className="h-8 w-8 md:h-12 md:w-12 xl:h-16 xl:w-16"
        />
      )}
      renderBadges={(item) => {
        const badges: React.ReactNode[] = [];

        // Bottom-right badge (map availability)
        if (itemCard?.badges?.bottomRight) {
          const config = itemCard.badges.bottomRight;
          const value = item.mapAvailability;

          if (value && config.textMap?.[value] && config.styleMap?.[value]) {
            badges.push(
              <span
                key="bottomRight"
                className={`${config.style?.className} ${config.styleMap[value]}`}
              >
                {config.textMap[value]}
              </span>,
            );
          }
        }

        return <>{badges}</>;
      }}
      renderSecondaryLabel={(item) => {
        if (itemCard?.secondaryLabel?.condition(item)) {
          return (
            <span className="text-[8px] text-secondary opacity-50 md:text-[9px]">
              {itemCard.secondaryLabel.format(item)}
            </span>
          );
        }
        return null;
      }}
    />
  );
}
