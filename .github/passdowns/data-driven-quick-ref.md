# Data-Driven Architecture Quick Reference

## Three-Layer Model

```
Layer 1: Semantic Data (items.json)
  ↓ Fields: rarity, requiredFeatureLevel, mapAvailability
  ↓ NOT: borderColor, badgeIcon, className

Layer 2: Visual Mapping (game config)
  ↓ Maps: "legendary" → "border-highlight"
  ↓ Maps: "NewFrontiers" → DLC icon path

Layer 3: Component Adapter (game-specific)
  ↓ Reads config
  ↓ Applies mappings to data
  ↓ Passes to shared component

Layer 4: Shared Component (structure)
  ↓ Provides layout, slots, variants
  ↓ Game-agnostic
```

## Golden Rules

1. **Data = WHAT, Config = HOW, Component = WHERE**
2. Never put CSS/colors in extracted data
3. Never hard-code game field names in shared components
4. New features must be optional (don't break existing games)
5. "Can I change presentation without re-running pipeline?" → If no, refactor

## Extraction Checklist

Before staging data:

- [ ] Use semantic fields (category, tier, rarity)
- [ ] Use gameplay attributes (isCraftable, isDLC)
- [ ] Use asset references (icon.assetPath)
- [ ] Exclude styling (no colors, CSS, layout)
- [ ] Exclude derived UI state (no isSelected)
- [ ] Use camelCase naming
- [ ] Document field meanings

## Config Pattern Example

```ts
// Config (how to show legendary items)
badges: {
  topLeft: {
    sourceField: 'rarity',
    iconMap: { 'legendary': '/icons/star.png' }
  }
},
borderHighlight: {
  condition: (item) => item.rarity === 'legendary'
}
```

## Component Pattern Example

```tsx
// Shared component (structure)
<ItemGrid
  items={items}
  renderIcon={(item) => <img src={item.icon} />}
  renderBadges={(item) => {
    // Apply config here
    if (item.rarity === 'legendary') {
      return <Badge icon="/icons/star.png" />;
    }
  }}
  borderVariant={(item) => 
    item.rarity === 'legendary' ? 'highlight' : 'default'
  }
/>
```

## Files to Reference

- `.github/instructions/data-driven-architecture.instructions.md` - Full guide
- `.github/instructions/scalability.instructions.md` - Component design
- `.github/documentation/field-guide-overlap-matrix.md` - Extraction roadmap
