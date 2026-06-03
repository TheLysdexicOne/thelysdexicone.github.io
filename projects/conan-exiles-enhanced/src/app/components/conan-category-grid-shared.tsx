import { CategoryGrid } from "@shared/components/field-guide";
import { IconTile, type ItemCategory } from "./conan-field-guide-items-helpers";
import { conanConfig } from "@shared/config/games/conan";

type Props = {
  categories: ItemCategory[];
  onSelectCategory: (categoryId: string) => void;
  datasetVersion: string;
  itemCount: number;
};

export default function ConanCategoryGridShared({
  categories,
  onSelectCategory,
  datasetVersion,
  itemCount,
}: Props) {
  const { categoryGrid } = conanConfig.fieldGuide!;

  // Resolve template variables in stats
  const resolvedStats = categoryGrid?.stats
    ?.replace("{dataVersion}", datasetVersion)
    .replace("{itemCount}", itemCount.toLocaleString());

  return (
    <CategoryGrid
      categories={categories}
      onSelectCategory={onSelectCategory}
      renderIcon={(category) => (
        <IconTile
          className="h-8 w-8 md:h-16 md:w-16 xl:h-32 xl:w-32"
          alt={`${category.displayName} category`}
          iconPath={category.officialIconPath}
          placeholderLabel={category.displayName}
        />
      )}
      headerConfig={{
        header: categoryGrid?.header,
        description: categoryGrid?.description,
        stats: resolvedStats,
      }}
    />
  );
}
