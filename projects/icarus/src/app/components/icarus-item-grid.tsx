import { ItemGrid } from "@shared/components/field-guide";
import { icarusConfig } from "@shared/config/games/icarus";
import type { IcarusItemIndexEntry } from "@/types/icarus";

const ICARUS_BASE_PATH = "/icarus";

function toAssetUrl(p: string) {
  return `${ICARUS_BASE_PATH}/game-assets/${p}`;
}

type Props = {
  categoryName: string;
  items: IcarusItemIndexEntry[];
  onSelectItem: (itemId: string) => void;
};

export default function IcarusItemGrid({
  categoryName,
  items,
  onSelectItem,
}: Props) {
  const { itemCard } = icarusConfig.fieldGuide!;

  return (
    <ItemGrid
      categoryName={categoryName}
      items={items}
      onSelectItem={(item) => onSelectItem(item.itemId)}
      getItemId={(item) => item.itemId}
      getItemName={(item) => item.displayName}
      renderIcon={(item) => {
        if (item.icon.exists) {
          return (
            <img
              src={toAssetUrl(item.icon.assetPath)}
              alt={item.displayName}
              className="h-8 w-8 object-contain md:h-12 md:w-12 xl:h-16 xl:w-16"
              loading="lazy"
            />
          );
        }
        return (
          <div className="h-8 w-8 rounded bg-main md:h-12 md:w-12 xl:h-16 xl:w-16" />
        );
      }}
      renderBadges={(item) => {
        const badges: React.ReactNode[] = [];

        // Top-left badge (feature-level)
        if (itemCard?.badges?.topLeft) {
          const config = itemCard.badges.topLeft;
          const value = item[config.sourceField as keyof typeof item];
          if (value && config.iconMap?.[value as string]) {
            badges.push(
              <img
                key="topLeft"
                src={config.iconMap[value as string]}
                alt=""
                aria-hidden
                className={config.style?.className}
              />,
            );
          }
        }

        // Bottom-left badge (cosmetic pack or feature-level pack)
        if (itemCard?.badges?.bottomLeft) {
          const config = itemCard.badges.bottomLeft;
          // Try cosmeticPack first, then requiredFeatureLevel
          const cosmeticValue = item.cosmeticPack;
          const flValue = item.requiredFeatureLevel;
          const iconUrl =
            (cosmeticValue && config.iconMap?.[cosmeticValue]) ||
            (flValue && config.iconMap?.[flValue]);

          if (iconUrl) {
            badges.push(
              <span
                key="bottomLeft"
                className={config.style?.containerClassName}
              >
                <img
                  src={iconUrl}
                  alt=""
                  aria-hidden
                  className={config.style?.iconClassName}
                />
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
      borderVariant={(item) => {
        if (itemCard?.borderHighlight?.condition(item)) {
          return "highlight";
        }
        return "default";
      }}
    />
  );
}
