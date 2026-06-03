import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  IconTile,
  matchesItemSearch,
  type ItemCategory,
} from "./conan-field-guide-items-helpers";

type Props = {
  categories: ItemCategory[];
  search: string;
  selectedItemId: string;
  openCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  onSelectItem: (itemId: string) => void;
  onSelectCategory: (categoryId: string) => void;
};

export default function ConanCategoryPanel({
  categories,
  search,
  selectedItemId,
  openCategories,
  onToggleCategory,
  onSelectItem,
  onSelectCategory,
}: Props) {
  const normalizedQuery = search.trim().toLowerCase();

  return (
    <div role="navigation" aria-label="Item categories" className="py-2">
      {categories.map((category) => {
        const filteredItems = normalizedQuery
          ? category.items.filter((entry) =>
              matchesItemSearch(entry, normalizedQuery),
            )
          : category.items;

        if (normalizedQuery && filteredItems.length === 0) {
          return null;
        }

        const isOpen =
          openCategories.has(category.id) || normalizedQuery.length > 0;

        return (
          <div
            key={category.id}
            className="border-b border-primary/20 last:border-0"
          >
            <div className="flex w-full items-center">
              <button
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-highlight/30"
              >
                <IconTile
                  className="h-5 w-5 shrink-0 rounded bg-main"
                  alt={`${category.displayName} category`}
                  iconPath={category.officialIconPath}
                  placeholderLabel={category.displayName}
                />
                <span className="flex-1 truncate text-sm font-semibold text-primary lg:text-base">
                  {category.displayName}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onToggleCategory(category.id)}
                className="flex shrink-0 items-center gap-1.5 px-2 py-2 transition-colors hover:bg-highlight/30"
              >
                <span className="text-xs text-secondary opacity-50 sm:text-sm">
                  {filteredItems.length}
                </span>
                <FontAwesomeIcon
                  icon={isOpen ? faMinus : faPlus}
                  className="w-3 shrink-0 text-secondary opacity-60"
                />
              </button>
            </div>

            {isOpen && (
              <ul>
                {filteredItems.map((item, index) => (
                  <li
                    key={item.id}
                    className={index % 2 === 1 ? "bg-primary/[0.04]" : ""}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectItem(item.id)}
                      className={`flex w-full items-center gap-2 py-1 pl-6 pr-3 text-left transition-colors ${
                        item.id === selectedItemId
                          ? "bg-highlight text-primary"
                          : "text-secondary hover:bg-highlight/40 hover:text-primary"
                      }`}
                    >
                      <span className="flex-1 truncate text-xs sm:text-sm">
                        {item.name}
                      </span>
                      {item.recipe.length > 0 && (
                        <span className="shrink-0 text-[10px] opacity-40 sm:text-xs">
                          {item.recipe.length}x
                        </span>
                      )}
                      <span
                        className={`ml-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          item.isCraftable
                            ? "bg-highlight opacity-70"
                            : "bg-secondary opacity-30"
                        }`}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
