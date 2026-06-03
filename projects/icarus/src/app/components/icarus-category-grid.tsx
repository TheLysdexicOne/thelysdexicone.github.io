import { CategoryGrid } from "@shared/components/field-guide";
import { icarusConfig } from "@shared/config/games/icarus";
import type { IcarusCategory } from "@/types/icarus";

const ICARUS_BASE_PATH = "/icarus";

function toAssetUrl(p: string) {
  return `${ICARUS_BASE_PATH}/game-assets/${p}`;
}

type Props = {
  categories: IcarusCategory[];
  onSelectCategory: (categoryId: string) => void;
};

export default function IcarusCategoryGrid({
  categories,
  onSelectCategory,
}: Props) {
  const { categoryGrid } = icarusConfig.fieldGuide!;

  return (
    <CategoryGrid
      categories={categories}
      onSelectCategory={onSelectCategory}
      renderIcon={(cat) => {
        if (cat.representativeIcon.exists) {
          return (
            <img
              src={toAssetUrl(cat.representativeIcon.assetPath)}
              alt={cat.displayName}
              className="h-8 w-8 object-contain md:h-16 md:w-16 xl:h-32 xl:w-32"
              loading="lazy"
            />
          );
        }
        return (
          <div className="h-8 w-8 rounded bg-main md:h-16 md:w-16 xl:h-32 xl:w-32" />
        );
      }}
      headerConfig={categoryGrid}
    />
  );
}
