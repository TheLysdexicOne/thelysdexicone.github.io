# Field Guide Overlap Matrix

> **Generated**: June 3, 2026  
> **Purpose**: Document component overlaps between Conan and Icarus field-guide implementations to guide shared primitive extraction.

## Summary

Both Conan and Icarus now share nearly identical component boundaries. All field-guide components follow the same layout pattern, use the same shared Tailwind theme, and implement the same user interactions. The primary differences are game-specific badges, icons, and metadata display.

## Component-by-Component Analysis

### 1. FieldGuideLayout / ConanFieldGuideLayout

**Overlap**: 95% identical structure and styling

**Similarities**:
- Two-pane shell (left accordion panel + main content area)
- Top control bar with search slot, section tabs, nav buttons
- Same nav buttons: Back (chevron), Categories (grid), Home
- Identical styling: `h-14` top bar, `border-b-2 border-highlight`, `w-64` left panel
- Same responsive behavior: left panel hidden below `lg:` breakpoint
- Same FontAwesome icons

**Differences**:
- Icarus: 3 section tabs (Items, Bestiary, Fishing) with active highlighting via `usePathname()`
- Conan: 1 section tab (Items) without pathname logic
- Section configuration could be props-based

**Extraction Strategy**: Create `FieldGuideLayout` in `shared/components/field-guide/` accepting `sections` prop and active path logic. Projects pass section config.

---

### 2. CategoryGrid / ConanCategoryGrid

**Overlap**: 90% identical structure and grid logic

**Similarities**:
- Same responsive grid: `grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-4 2xl:grid-cols-5`
- Same icon sizes at breakpoints: `h-8 w-8 md:h-16 md:w-16 xl:h-32 xl:w-32`
- Same card styling: `border-2 border-primary bg-card`, hover states
- Same layout: icon above, display name below
- Same padding, gap, and text sizing

**Differences**:
- Conan: Uses `IconTile` helper for icon rendering, includes dataset version + item count header
- Icarus: Inline `<img>` with fallback `<div>`, simpler header
- Category data shape differs (Conan has `officialIconPath`, Icarus has `representativeIcon.exists/assetPath`)

**Extraction Strategy**: Create `CategoryGrid` accepting generic category type with icon resolver prop. Header metadata optional. Projects provide icon rendering adapter.

---

### 3. CategoryPanel / ConanCategoryPanel

**Overlap**: 95% identical accordion logic and styling

**Similarities**:
- Accordion structure: category header + collapsible item list
- Split-button pattern: left button navigates to grid, right button toggles accordion
- Auto-expand on search
- Item list: alternating row backgrounds, selected item highlighting
- Same layout: icon + name (left), item count + expand icon (right)
- Identical styling: `border-b border-primary/20`, `hover:bg-highlight/30`
- Secondary indicators: recipe count, DLC/status dots

**Differences**:
- Conan: Categories pre-include items array, uses `matchesItemSearch()` helper
- Icarus: Computes `itemsByCategory` map via `useMemo`, uses inline `.includes()` search
- Icon rendering: Conan uses `IconTile`, Icarus uses inline `<img>`
- Dot color logic differs (Conan: craftable indicator, Icarus: DLC pack indicator)

**Extraction Strategy**: Create `CategoryPanel` with generic category/item types. Accept `renderCategoryIcon`, `filterItems`, and `renderItemIndicator` props for game-specific logic.

---

### 4. ItemGrid / ConanItemGrid

**Overlap**: 90% identical grid structure and card layout

**Similarities**:
- Same responsive grid: `grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 2xl:grid-cols-10`
- Same icon sizes: `h-8 w-8 md:h-12 md:w-12 xl:h-16 xl:w-16`
- Same card styling: `border-2 border-primary bg-card`, hover states
- Same layout: icon (with overlaid badges) + name + optional secondary label
- Relative positioned icon container for badge overlays

**Differences**:
- Conan: Map availability badges (EL/IOS/Both), "crafted" label for craftable items
- Icarus: DLC badges (feature-level top-left, cosmetic-pack bottom-left), recipe count label
- Workshop items in Icarus have `border-highlight` instead of `border-primary`
- Badge rendering: different data sources, different badge images

**Extraction Strategy**: Create `ItemGrid` with generic item type. Accept `renderItemIcon`, `renderBadges`, and `renderSecondaryLabel` props. Projects provide badge/label logic.

---

### 5. ItemDetailPanel / ConanItemDetailPanel

**Overlap**: 85% identical structure

**Similarities**:
- Header: icon + item name
- Acquisition/stats section with key-value pairs
- Recipe inputs section (if applicable)
- Tags section (if applicable)
- Same card styling: `rounded border border-primary bg-card p-3`
- Same text hierarchy: `text-lg font-bold text-primary` for name, `text-sm font-bold` for section headers

**Differences**:
- Conan: Map availability, learned from, found in, biome, source references
- Icarus: Different metadata fields (tier, station, feature-level, etc.)
- Recipe format differs (Conan uses `recipe[]`, Icarus uses different structure)
- Both render game-specific metadata sections

**Extraction Strategy**: Create `ItemDetailPanel` shell with slots for header, metadata sections, recipe, and tags. Projects provide section content components.

---

### 6. Helpers (IconTile, ItemIcon, matchesItemSearch, etc.)

**Overlap**: Varies by utility

**IconTile (Conan-only)**:
- Renders icon with fallback placeholder
- Could be generalized with `renderIcon` prop

**ItemIcon (Conan-only)**:
- Wrapper for item icon rendering
- Similar to Icarus inline icon rendering

**matchesItemSearch (Conan-only)**:
- Searches item name + tags
- Icarus uses inline `.includes()`
- Could be shared with customizable search fields

**Badge mapping helpers**:
- Conan: `mapBadgeTone()`, `mapShortBadge()` for map availability
- Icarus: Inline badge logic for DLC packs
- Game-specific, should stay local

**Extraction Strategy**: Create shared `IconTile` component for icon-with-fallback pattern. Create shared `matchesItemSearch()` accepting field selectors.

---

## Extraction Priority

### Phase 1: Core Layout (Immediate)
1. **FieldGuideLayout** - 95% overlap, minimal game-specific logic
2. **EmptyState / LoadingState / ErrorState** - Not yet written but needed by both

### Phase 2: Grid Components (Next)
3. **CategoryGrid** - 90% overlap, icon rendering varies
4. **ItemGrid** - 90% overlap, badge logic varies

### Phase 3: Panel Components (Then)
5. **CategoryPanel** - 95% overlap, item filtering varies
6. **ItemDetailPanel** - 85% overlap, metadata sections vary

### Phase 4: Utilities (Last)
7. **IconTile** - Shared icon rendering primitive
8. **matchesItemSearch** - Shared search logic with field selectors

---

## Design Principles for Shared Components

1. **Generic Types**: All shared components accept generic type parameters for category/item shapes
2. **Render Props**: Game-specific rendering (icons, badges, metadata) provided via render props or component props
3. **Minimal Assumptions**: Shared components assume only the core UI contract, not game data structure
4. **Styling Preserved**: All shared components use the unified Tailwind theme already in place
5. **Local Adapters**: Projects create thin adapter components that wire game data to shared primitives

---

## Example Usage Pattern

```tsx
// shared/components/field-guide/item-grid.tsx
export function ItemGrid<TItem>({
  categoryName,
  items,
  onSelectItem,
  renderItemIcon,
  renderBadges,
  renderSecondaryLabel,
}: ItemGridProps<TItem>) {
  // ... grid layout logic
}

// projects/conan-exiles-enhanced/src/app/components/conan-item-grid.tsx
export default function ConanItemGrid({ categoryName, items, onSelectItem }: Props) {
  return (
    <ItemGrid
      categoryName={categoryName}
      items={items}
      onSelectItem={onSelectItem}
      renderItemIcon={(item) => <ItemIcon entry={item} />}
      renderBadges={(item) => (
        <span className={mapBadgeTone(item.mapAvailability)}>
          {mapShortBadge(item.mapAvailability)}
        </span>
      )}
      renderSecondaryLabel={(item) =>
        item.isCraftable ? <span className="text-[8px]">crafted</span> : null
      }
    />
  );
}
```

---

## Next Steps

1. Create `shared/components/field-guide/` directory
2. Extract FieldGuideLayout first (highest overlap, minimal game logic)
3. Extract EmptyState, LoadingState, ErrorState shells
4. Migrate Icarus first (validate pattern works)
5. Migrate Conan second (prove it works for both)
6. Extract remaining grid/panel components iteratively
7. Document shared component API contracts

---

## Notes

- Both projects already consume `shared/types/field-guide.ts` for dataset contracts
- Both projects already consume `shared/styles/tailwind-theme.js` for unified theme
- No styling changes required—shared components inherit the existing theme
- Local helpers (badge mapping, specific search logic) stay in project-local files
