---
description: "Architectural principles for building scalable, game-agnostic components that can grow without breaking existing implementations."
applyTo: "shared/components/**"
---

# Component Scalability Instructions

## Core Principle

**New game requirements must not break existing game implementations.**

When a new game needs additional functionality, that functionality should be:
1. **Optional** - Existing games work without it
2. **Composable** - New features layer on top of base behavior
3. **Config-driven** - Behavior differences live in config, not component internals
4. **Render-flexible** - Visual customization via render props or slots

---

## Design Patterns

### 1. Optional Props with Safe Defaults

All new props should be optional with sensible defaults that preserve existing behavior.

```tsx
// ✅ GOOD: New prop is optional
type ItemCardProps = {
  item: ItemEntry;
  onSelect: (id: string) => void;
  renderBadges?: (item: ItemEntry) => React.ReactNode; // NEW: optional
  highlightBorder?: boolean; // NEW: optional, defaults to false
};

export function ItemCard({ 
  item, 
  onSelect, 
  renderBadges, // Existing games can ignore this
  highlightBorder = false // Safe default
}: ItemCardProps) {
  return (
    <button 
      className={`border-2 ${highlightBorder ? 'border-highlight' : 'border-primary'}`}
      onClick={() => onSelect(item.id)}
    >
      {/* Base rendering */}
      <img src={item.icon} />
      
      {/* Game-specific badges (optional) */}
      {renderBadges?.(item)}
    </button>
  );
}

// ❌ BAD: New prop is required, breaks existing code
type ItemCardProps = {
  item: ItemEntry;
  onSelect: (id: string) => void;
  badgeConfig: BadgeConfig; // BREAKING: now required
};
```

---

### 2. Render Props for Visual Customization

Use render props when games need different visual elements in the same slot.

**Example: Item Grid Badges**

```tsx
// shared/components/field-guide/item-grid.tsx
type ItemGridProps<TItem> = {
  items: TItem[];
  onSelectItem: (id: string) => void;
  
  // Render props for game-specific visuals
  renderIcon: (item: TItem) => React.ReactNode;
  renderBadges?: (item: TItem) => React.ReactNode; // optional
  renderSecondaryLabel?: (item: TItem) => React.ReactNode; // optional
};

export function ItemGrid<TItem extends { id: string }>({
  items,
  onSelectItem,
  renderIcon,
  renderBadges,
  renderSecondaryLabel,
}: ItemGridProps<TItem>) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(item => (
        <button key={item.id} onClick={() => onSelectItem(item.id)}>
          <div className="relative">
            {renderIcon(item)}
            {renderBadges?.(item)} {/* Game provides badge logic */}
          </div>
          {renderSecondaryLabel?.(item)}
        </button>
      ))}
    </div>
  );
}
```

**Icarus Implementation** (3 badge types):
```tsx
<ItemGrid
  items={items}
  renderIcon={item => <img src={item.icon} />}
  renderBadges={item => (
    <>
      {item.requiredFeatureLevel && (
        <img src={dlcIcon} className="absolute top-0 left-0" />
      )}
      {item.cosmeticPack && (
        <span className="absolute bottom-0 left-0 border border-highlight">
          <img src={cosmeticIcon} />
        </span>
      )}
    </>
  )}
/>
```

**Conan Implementation** (different badge types):
```tsx
<ItemGrid
  items={items}
  renderIcon={item => <ItemIcon entry={item} />}
  renderBadges={item => (
    <span className={mapBadgeTone(item.mapAvailability)}>
      {mapShortBadge(item.mapAvailability)}
    </span>
  )}
/>
```

**Key**: Shared component owns the **structure** (grid, positioning), games own the **content** (what badges, where).

---

### 3. Conditional Styling via Props

Support game-specific styling variations through boolean/enum props.

```tsx
// ✅ GOOD: Conditional styling via props
type ItemCardProps = {
  item: ItemEntry;
  variant?: 'default' | 'workshop' | 'rare'; // Game-specific variants
  borderStyle?: 'solid' | 'dashed' | 'none';
};

export function ItemCard({ item, variant = 'default', borderStyle = 'solid' }: ItemCardProps) {
  const borderClass = {
    default: 'border-primary',
    workshop: 'border-highlight',
    rare: 'border-secondary',
  }[variant];
  
  return <div className={`border-2 ${borderClass}`}>...</div>;
}

// ❌ BAD: Hard-coded game-specific logic in shared component
export function ItemCard({ item }: ItemCardProps) {
  const isWorkshop = item.cosmeticPack === 'Workshop'; // Assumes Icarus data structure
  return <div className={isWorkshop ? 'border-highlight' : 'border-primary'}>...</div>;
}
```

---

### 4. Config-Driven Behavior

Move game-specific logic to config files, not component internals.

**Example: Field Guide Badge Systems**

```ts
// shared/config/games/icarus.ts
export const icarusFieldGuideConfig = {
  itemBadges: {
    topLeft: { field: 'requiredFeatureLevel', type: 'icon', iconMap: { ... } },
    bottomLeft: { field: 'cosmeticPack', type: 'icon', iconMap: { ... } },
  },
  itemBorder: {
    highlightCondition: (item) => item.cosmeticPack === 'Workshop',
  },
};

// shared/config/games/conan.ts
export const conanFieldGuideConfig = {
  itemBadges: {
    bottomRight: { field: 'mapAvailability', type: 'text', formatter: mapShortBadge },
  },
  itemBorder: {
    colorField: 'rarity', // Future: border color based on rarity
  },
};
```

Component uses config to determine behavior:
```tsx
export function ItemCard({ item, config }: ItemCardProps) {
  const badges = [];
  
  if (config.itemBadges?.topLeft) {
    const badge = config.itemBadges.topLeft;
    const value = item[badge.field];
    if (value) badges.push(<TopLeftBadge value={value} iconMap={badge.iconMap} />);
  }
  
  // ... similar for other badge positions
}
```

---

### 5. Graceful Feature Detection

Check for feature support, don't assume data structure.

```tsx
// ✅ GOOD: Feature detection
function hasWorkshopItems(item: unknown): boolean {
  return typeof item === 'object' && item !== null && 'cosmeticPack' in item;
}

if (hasWorkshopItems(item) && item.cosmeticPack === 'Workshop') {
  // Apply workshop styling
}

// ❌ BAD: Assumes all items have cosmeticPack
if (item.cosmeticPack === 'Workshop') { // Runtime error if field doesn't exist
  // ...
}
```

---

## Real-World Example: Field Guide Item Cards

### Scenario
- **Icarus** needs: Workshop border highlight, 2 badge types (DLC top-left, cosmetic bottom-left)
- **Conan** needs: Map availability badge (bottom-right), planned rarity border colors
- **Future Game** might need: Top-right badge, hover tooltip, different border styles

### Shared Component Design

```tsx
// shared/components/field-guide/item-card.tsx
export type ItemCardBadgeSlots = {
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
  bottomLeft?: React.ReactNode;
  bottomRight?: React.ReactNode;
};

export type ItemCardProps<TItem> = {
  item: TItem;
  onSelect: (item: TItem) => void;
  
  // Visual customization
  renderIcon: (item: TItem) => React.ReactNode;
  badges?: ItemCardBadgeSlots;
  borderVariant?: 'default' | 'highlight' | 'muted';
  secondaryLabel?: React.ReactNode;
  
  // Optional interactions
  onHover?: (item: TItem) => void;
  tooltip?: React.ReactNode;
};

export function ItemCard<TItem>({
  item,
  onSelect,
  renderIcon,
  badges,
  borderVariant = 'default',
  secondaryLabel,
  onHover,
  tooltip,
}: ItemCardProps<TItem>) {
  const borderClass = {
    default: 'border-primary',
    highlight: 'border-highlight',
    muted: 'border-secondary',
  }[borderVariant];
  
  return (
    <button
      className={`relative border-2 ${borderClass} bg-card p-2 hover:bg-nav`}
      onClick={() => onSelect(item)}
      onMouseEnter={() => onHover?.(item)}
    >
      {/* Icon with badge slots */}
      <div className="relative">
        {renderIcon(item)}
        {badges?.topLeft && (
          <div className="absolute top-0 left-0">{badges.topLeft}</div>
        )}
        {badges?.topRight && (
          <div className="absolute top-0 right-0">{badges.topRight}</div>
        )}
        {badges?.bottomLeft && (
          <div className="absolute bottom-0 left-0">{badges.bottomLeft}</div>
        )}
        {badges?.bottomRight && (
          <div className="absolute bottom-0 right-0">{badges.bottomRight}</div>
        )}
      </div>
      
      {/* Optional secondary label */}
      {secondaryLabel}
      
      {/* Optional tooltip */}
      {tooltip}
    </button>
  );
}
```

### Icarus Usage
```tsx
<ItemCard
  item={item}
  onSelect={handleSelect}
  renderIcon={item => <img src={item.icon} />}
  borderVariant={item.cosmeticPack === 'Workshop' ? 'highlight' : 'default'}
  badges={{
    topLeft: item.requiredFeatureLevel ? <DLCIcon level={item.requiredFeatureLevel} /> : null,
    bottomLeft: item.cosmeticPack ? <CosmeticIcon pack={item.cosmeticPack} /> : null,
  }}
  secondaryLabel={item.recipeCount > 1 ? `${item.recipeCount}×` : null}
/>
```

### Conan Usage
```tsx
<ItemCard
  item={item}
  onSelect={handleSelect}
  renderIcon={item => <ItemIcon entry={item} />}
  badges={{
    bottomRight: <MapBadge availability={item.mapAvailability} />,
  }}
  secondaryLabel={item.isCraftable ? 'crafted' : null}
/>
```

### Future Game Usage
```tsx
<ItemCard
  item={item}
  onSelect={handleSelect}
  renderIcon={item => <img src={item.icon} />}
  badges={{
    topRight: <NewBadgeType data={item.customField} />, // NEW: uses available slot
  }}
  borderVariant="muted" // NEW: uses existing variant
  tooltip={<ItemTooltip item={item} />} // NEW: uses optional tooltip
/>
```

**Result**: No changes to shared component, all three games work perfectly.

---

## Testing for Scalability

Before merging a shared component, validate:

1. **Backwards compatibility**: Can existing games use it without changes?
2. **Forward compatibility**: Can you add a prop without breaking builds?
3. **Prop flexibility**: Are all new props optional with safe defaults?
4. **Visual flexibility**: Can games customize appearance via render props/slots?
5. **Type safety**: Do generics allow game-specific types?

---

## Anti-Patterns to Avoid

❌ **Game-specific logic in shared components**
```tsx
// BAD: Icarus logic leaks into shared component
if (item.cosmeticPack === 'Workshop') { ... }
```

❌ **Required props that break existing implementations**
```tsx
// BAD: Adding required prop breaks Conan
type Props = { badges: BadgeConfig }; // Now all games must provide this
```

❌ **Assumptions about data structure**
```tsx
// BAD: Assumes all items have 'rarity' field
const rarityColor = RARITY_COLORS[item.rarity]; // Crashes if field doesn't exist
```

❌ **Hard-coded styling variants**
```tsx
// BAD: Hard-coded Icarus variant
<div className={item.isWorkshop ? 'border-highlight' : 'border-primary'}>
```

---

## Summary

**When building shared components:**
1. Make everything **optional** unless absolutely core to the component
2. Use **render props** for visual customization
3. Use **slot patterns** for positioned elements (badges, labels, tooltips)
4. Use **variant props** for style variations
5. Use **config files** for game-specific logic
6. **Never** hard-code game-specific field names or values

**Golden Rule**: If adding a feature to a shared component, ask: "Would this break an existing game?" If yes, make it optional or use a different approach.
