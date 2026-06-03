import type { ItemEntry } from "@/lib/items";

export type ItemCategory = {
  id: string;
  rawName: string;
  displayName: string;
  officialIconPath: string | null;
  representativeEntry: ItemEntry | null;
  items: ItemEntry[];
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildPlaceholderMark(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return "--";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .padEnd(2, "-");
}

export function humanizeCategoryName(name: string): string {
  const overrides: Record<string, string> = {
    BuildingItem: "Building Item",
    PetItem: "Pet Item",
    Craftingstations: "Crafting Stations",
  };

  if (overrides[name]) {
    return overrides[name];
  }

  return name.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function matchesItemSearch(
  entry: ItemEntry,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  return [
    entry.name,
    entry.description,
    entry.itemType,
    entry.rarity,
    entry.sortLabel,
    entry.obtainMethods.join(" "),
    entry.tags.join(" "),
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

export function mapBadgeTone(
  mapAvailability: ItemEntry["mapAvailability"],
): string {
  if (mapAvailability === "Exiled Lands") {
    return "border-amber-400/40 bg-amber-500/10 text-amber-100";
  }

  if (mapAvailability === "Isle of Siptah") {
    return "border-cyan-400/40 bg-cyan-500/10 text-cyan-100";
  }

  if (mapAvailability === "Both") {
    return "border-emerald-400/40 bg-emerald-500/10 text-emerald-100";
  }

  return "border-highlight bg-highlight/10 text-secondary";
}

export function mapShortBadge(
  mapAvailability: ItemEntry["mapAvailability"],
): string {
  if (mapAvailability === "Exiled Lands") {
    return "EL";
  }

  if (mapAvailability === "Isle of Siptah") {
    return "S";
  }

  if (mapAvailability === "Both") {
    return "B";
  }

  return "?";
}

export function IconTile({
  className,
  alt,
  iconPath,
  placeholderLabel,
}: {
  className: string;
  alt: string;
  iconPath?: string | null;
  placeholderLabel: string;
}) {
  if (iconPath) {
    return (
      <img
        src={iconPath}
        alt={alt}
        className={`${className} object-contain`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center rounded border border-primary bg-main text-[10px] font-semibold tracking-[0.2em] text-secondary md:text-xs`}
      aria-hidden="true"
    >
      {buildPlaceholderMark(placeholderLabel)}
    </div>
  );
}

export function ItemIcon({
  entry,
  className,
}: {
  entry: ItemEntry;
  className: string;
}) {
  return (
    <IconTile
      className={className}
      alt={entry.name}
      iconPath={entry.iconPath}
      placeholderLabel={entry.name}
    />
  );
}
