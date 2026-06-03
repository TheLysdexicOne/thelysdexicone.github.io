---
description: "Data-driven architecture principles for the game companion monorepo. Governs data extraction, staging contracts, and config-driven presentation."
applyTo: "**"
---

# Data-Driven Architecture Principles

## Core Philosophy

**Data describes WHAT things are, not HOW to display them.**

This site is designed to be 75-80% data-driven, meaning:

- Content, configuration, and presentation rules live in data files
- Components interpret data through configs, not hard-coded logic
- Adding a new game = new config + new dataset, minimal code changes

---

## Three-Layer Model

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: Semantic Data (Game Pipelines)            │
│ ─────────────────────────────────────────────────── │
│ Items have fields like: rarity, requiredFeatureLevel│
│ NOT fields like: borderColor, badgeIcon            │
│ Output: JSON datasets in public/data/               │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ Layer 2: Visual Mapping (Game Configs)             │
│ ─────────────────────────────────────────────────── │
│ Configs map semantic fields to visual treatments    │
│ "requiredFeatureLevel: NewFrontiers" → DLC icon     │
│ Location: shared/config/games/                      │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ Layer 3: Component Adapters (Game-Specific)        │
│ ─────────────────────────────────────────────────── │
│ Read config, apply to data, pass to shared component│
│ Location: projects/{game}/src/app/components/       │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ Layer 4: Shared Components (Structure)             │
│ ─────────────────────────────────────────────────── │
│ Provide layout, slots, and interaction patterns     │
│ Location: shared/components/                        │
└─────────────────────────────────────────────────────┘
```

---

## Layer 1: Semantic Data (Extraction & Staging)

### Principle: Store Meaning, Not Appearance

Data extraction pipelines (UE5 scripts, staging scripts) output **semantic fields** that describe what an item/entity is, not how it should look.

### ✅ Good: Semantic Fields

```json
{
  "itemId": "Pickaxe_Iron_T2",
  "displayName": "Iron Pickaxe",
  "category": "Tools",
  "tier": 2,
  "requiredFeatureLevel": "NewFrontiers",
  "cosmeticPack": null,
  "rarity": "epic",
  "mapAvailability": "ExiledLands",
  "isCraftable": true,
  "icon": {
    "assetPath": "Assets/Icons/Pickaxe_T2.webp",
    "exists": true
  }
}
```

**These fields answer**:

- What is this? (category, tier)
- Where did it come from? (requiredFeatureLevel, mapAvailability)
- How do you get it? (isCraftable)
- What does it look like? (icon.assetPath)

### ❌ Bad: Presentation Fields

```json
{
  "itemId": "Pickaxe_Iron_T2",
  "displayName": "Iron Pickaxe",
  "borderColor": "#f6eade",
  "badgeIcon": "/badges/dlc-new-frontiers.png",
  "badgePosition": "top-left",
  "highlightBorder": false,
  "cardBackground": "bg-card"
}
```

**Problems**:

- Can't change styling without regenerating data
- Locks presentation decisions into data pipeline
- Can't reuse same data for different presentations (grid, detail, tooltip)
- Hard to theme or rebrand

### Dataset Contract Guidelines

When writing staging scripts or extraction pipelines:

1. **Include semantic identifiers**: `id`, `category`, `type`, `rarity`, `tier`
2. **Include gameplay attributes**: `isCraftable`, `isDLC`, `isQuestItem`, `mapExclusive`
3. **Include relationships**: `recipe`, `droppedBy`, `unlocksAt`
4. **Include asset references**: `icon.assetPath`, `soundPath` (paths, not rendered elements)
5. **Exclude styling**: No colors, no CSS classes, no layout hints
6. **Exclude derived UI state**: No `isSelected`, `isHighlighted` (runtime state)

### Field Naming Conventions

- Use camelCase: `requiredFeatureLevel`, not `required_feature_level`
- Use full words: `displayName`, not `dispName`
- Use booleans for flags: `isCraftable`, not `craftable: 1`
- Use enums for categories: `rarity: "legendary"`, not `rarityLevel: 5`
- Namespace complex objects: `icon.assetPath`, not `iconPath` and `iconExists` separately

---

## Layer 2: Visual Mapping (Game Configs)

### Principle: Configs Interpret Data for Presentation

Game configs live in `shared/config/games/{gameId}.ts` and define **how** to visually present semantic data.

### Config Structure

```ts
// shared/config/games/icarus.ts
export const icarusConfig = {
  // ── Identity ──
  id: "icarus",
  name: "Icarus Companion",
  description: "An offline-friendly companion built from ripped game data...",

  // ── Metadata ──
  dataVersion: "1.0.0",
  stats: {
    itemCount: 1845,
    label: "craftable items",
  },

  // ── Home Page ──
  homePage: {
    hero: {
      title: "Icarus Companion",
      description: "...",
      stats: "Data version {dataVersion} · {itemCount} craftable items",
    },
    sections: [
      {
        id: "field-guide",
        label: "Field Guide",
        href: "/field-guide/items",
        description: "...",
      },
      {
        id: "progression",
        label: "Progression",
        href: "/progression",
        description: "...",
      },
    ],
  },

  // ── Field Guide ──
  fieldGuide: {
    // Section tabs
    tabs: ["Items", "Bestiary", "Fishing"],

    // Searchable fields (from item data)
    searchableFields: ["displayName", "description", "tags"],

    // Item card visual mapping
    itemCard: {
      // Badge system: map semantic fields to positioned badges
      badges: {
        topLeft: {
          sourceField: "requiredFeatureLevel",
          type: "icon",
          iconMap: {
            NewFrontiers:
              "/icarus/game-assets/Assets/.../T_FeatureLevelIcon_NewFrontiers3.webp",
            GreatHunts: "/icarus/game-assets/Assets/.../T_FeatureLevel_GH.webp",
          },
          style: {
            className: "h-4 w-4 brightness-0 invert",
          },
        },
        bottomLeft: {
          sourceField: "cosmeticPack",
          type: "icon",
          iconMap: {
            Workshop:
              "/icarus/game-assets/Assets/.../T_ICON_Money_Symbol_Double.webp",
          },
          style: {
            containerClassName: "border border-[#f1ad1c] bg-[#191919] p-px",
            iconClassName: "h-full w-full",
          },
        },
      },

      // Border highlight rules
      borderHighlight: {
        condition: (item) => item.cosmeticPack === "Workshop",
      },

      // Secondary label rules
      secondaryLabel: {
        condition: (item) => item.recipeCount > 1,
        format: (item) => `${item.recipeCount}×`,
      },
    },

    // Item detail panel fields
    itemDetail: {
      fields: [
        { key: "tier", label: "Tier", type: "badge" },
        { key: "station", label: "Crafted At", type: "text" },
        { key: "requiredFeatureLevel", label: "DLC", type: "badge" },
      ],
    },
  },
};

export type IcarusConfig = typeof icarusConfig;
```

### Mapping Patterns

**Pattern 1: Icon Badges**

```ts
badges: {
  topLeft: {
    sourceField: 'requiredFeatureLevel', // Read from item data
    type: 'icon',
    iconMap: { 'NewFrontiers': '/path/to/icon.png' }, // Map value to icon
  },
}
```

**Pattern 2: Text Badges**

```ts
badges: {
  bottomRight: {
    sourceField: 'mapAvailability',
    type: 'text',
    textMap: { 'ExiledLands': 'EL', 'IsleOfSiptah': 'IOS' }, // Map value to text
    styleMap: { 'ExiledLands': 'bg-highlight', 'IsleOfSiptah': 'bg-secondary' }, // Map value to style
  },
}
```

**Pattern 3: Conditional Styling**

```ts
borderHighlight: {
  condition: (item) => item.cosmeticPack === 'Workshop', // Function evaluates item
}
```

**Pattern 4: Dynamic Formatting**

```ts
secondaryLabel: {
  condition: (item) => item.recipeCount > 1,
  format: (item) => `${item.recipeCount}×`,
}
```

---

## Layer 3: Component Adapters

### Principle: Adapters Apply Config to Data

Game-specific adapter components live in `projects/{game}/src/app/components/` and bridge semantic data + config → shared components.

### Adapter Pattern

```tsx
// projects/icarus/src/app/components/icarus-item-grid.tsx
import { ItemGrid } from "@shared/components/field-guide/item-grid";
import { icarusConfig } from "@shared/config/games/icarus";
import type { IcarusItemIndexEntry } from "@/types/icarus";

type Props = {
  items: IcarusItemIndexEntry[];
  onSelectItem: (itemId: string) => void;
};

export function IcarusItemGrid({ items, onSelectItem }: Props) {
  const { itemCard } = icarusConfig.fieldGuide;

  return (
    <ItemGrid
      items={items}
      onSelectItem={onSelectItem}
      // Icon rendering (game-specific asset path handling)
      renderIcon={(item) => (
        <img
          src={toAssetUrl(item.icon.assetPath)}
          alt={item.displayName}
          className="h-8 w-8 object-contain md:h-12 md:w-12 xl:h-16 xl:w-16"
        />
      )}
      // Badges (config-driven)
      renderBadges={(item) => {
        const badges = [];

        // Apply top-left badge config
        const topLeftConfig = itemCard.badges.topLeft;
        const topLeftValue = item[topLeftConfig.sourceField];
        if (topLeftValue && topLeftConfig.iconMap[topLeftValue]) {
          badges.push(
            <img
              key="top-left"
              src={topLeftConfig.iconMap[topLeftValue]}
              className={topLeftConfig.style.className}
            />,
          );
        }

        // Apply bottom-left badge config
        const bottomLeftConfig = itemCard.badges.bottomLeft;
        const bottomLeftValue = item[bottomLeftConfig.sourceField];
        if (bottomLeftValue && bottomLeftConfig.iconMap[bottomLeftValue]) {
          badges.push(
            <span
              key="bottom-left"
              className={bottomLeftConfig.style.containerClassName}
            >
              <img
                src={bottomLeftConfig.iconMap[bottomLeftValue]}
                className={bottomLeftConfig.style.iconClassName}
              />
            </span>,
          );
        }

        return <>{badges}</>;
      }}
      // Border variant (config-driven)
      borderVariant={(item) =>
        itemCard.borderHighlight.condition(item) ? "highlight" : "default"
      }
      // Secondary label (config-driven)
      renderSecondaryLabel={(item) => {
        const { condition, format } = itemCard.secondaryLabel;
        return condition(item) ? (
          <span className="text-[8px] text-secondary">{format(item)}</span>
        ) : null;
      }}
    />
  );
}
```

### Adapter Responsibilities

1. **Read config** - Import game config, extract relevant sections
2. **Transform data** - Apply config mappings to semantic data
3. **Handle asset paths** - Convert relative paths to URLs (game-specific base paths)
4. **Render game-specific elements** - Badges, icons, labels per config rules
5. **Pass to shared component** - Provide structure via render props

### When to Create an Adapter

Create an adapter when:

- ✅ Semantic data structure differs between games
- ✅ Visual presentation differs (different badges, borders, labels)
- ✅ Asset path handling differs (different base URLs, directory structures)
- ✅ Interaction behavior differs (tooltips, modals, context menus)

Don't create an adapter when:

- ❌ Only styling differs (use config + shared component variants)
- ❌ Only text differs (use config strings)
- ❌ Structure is identical (use shared component directly)

---

## Layer 4: Shared Components

### Principle: Components Provide Structure, Not Content

Shared components in `shared/components/` define **layout, slots, and interaction patterns** but remain agnostic to game-specific data.

### Shared Component Guidelines

1. **Accept generic types**: `<TItem>` for item data, `<TCategory>` for category data
2. **Provide render props**: Let games control visual content
3. **Provide slots**: Position badges, labels, tooltips without dictating content
4. **Provide variants**: Support styling variations via props (`borderVariant`, `size`)
5. **Remain semantic**: No game-specific field names (`item.requiredFeatureLevel`)

### Example: Item Grid

```tsx
// shared/components/field-guide/item-grid.tsx
export type ItemGridProps<TItem> = {
  items: TItem[];
  onSelectItem: (item: TItem) => void;

  // Required: Game provides icon rendering
  renderIcon: (item: TItem) => React.ReactNode;

  // Optional: Game provides badge rendering
  renderBadges?: (item: TItem) => React.ReactNode;

  // Optional: Game provides secondary label
  renderSecondaryLabel?: (item: TItem) => React.ReactNode;

  // Optional: Game provides border variant logic
  borderVariant?: (item: TItem) => "default" | "highlight" | "muted";
};

export function ItemGrid<TItem extends { id: string }>({
  items,
  onSelectItem,
  renderIcon,
  renderBadges,
  renderSecondaryLabel,
  borderVariant,
}: ItemGridProps<TItem>) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 2xl:grid-cols-10">
      {items.map((item) => {
        const variant = borderVariant?.(item) ?? "default";
        const borderClass = {
          default: "border-primary",
          highlight: "border-highlight",
          muted: "border-secondary",
        }[variant];

        return (
          <button
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={`relative border-2 ${borderClass} bg-card p-2 hover:bg-nav`}
          >
            {/* Icon with badge overlay */}
            <div className="relative">
              {renderIcon(item)}
              {renderBadges?.(item)}
            </div>

            {/* Optional secondary label */}
            {renderSecondaryLabel?.(item)}
          </button>
        );
      })}
    </div>
  );
}
```

**Component owns**: Grid layout, card shell, border variants, hover states  
**Game controls**: Icon rendering, badge content/positioning, secondary labels, border logic

---

## Data Flow Example: Icarus Workshop Item

### 1. Semantic Data (Extraction)

```json
{
  "itemId": "Chair_Workshop_Fancy",
  "displayName": "Fancy Chair",
  "icon": { "assetPath": "Assets/Icons/Chair.webp", "exists": true },
  "requiredFeatureLevel": null,
  "cosmeticPack": "Workshop",
  "category": "Decoration",
  "recipeCount": 1
}
```

### 2. Config Mapping

```ts
icarusConfig.fieldGuide.itemCard = {
  badges: {
    bottomLeft: {
      sourceField: "cosmeticPack",
      iconMap: { Workshop: "/icons/money.webp" },
    },
  },
  borderHighlight: {
    condition: (item) => item.cosmeticPack === "Workshop", // TRUE
  },
};
```

### 3. Adapter Applies Config

```tsx
<ItemGrid
  renderBadges={(item) => {
    if (item.cosmeticPack === "Workshop") {
      return <img src="/icons/money.webp" />; // From config.iconMap
    }
  }}
  borderVariant={
    (item) => (item.cosmeticPack === "Workshop" ? "highlight" : "default") // From config.condition
  }
/>
```

### 4. Shared Component Renders

```html
<button class="border-2 border-highlight bg-card">
  <div class="relative">
    <img src="/icarus/game-assets/Assets/Icons/Chair.webp" />
    <img src="/icons/money.webp" class="absolute bottom-0 left-0" />
  </div>
</button>
```

**Result**: Workshop item has gold border + money badge, all driven by config.

---

## When Extracting New Data

### Checklist for Data Pipeline Engineers

Before writing a new extraction script or staging script:

- [ ] **Define semantic fields first** - What describes this entity?
- [ ] **Avoid presentation fields** - No colors, no CSS, no layout
- [ ] **Use consistent naming** - camelCase, full words, semantic booleans
- [ ] **Document field meanings** - Add schema comments or type definitions
- [ ] **Output stable JSON** - Same structure every run (deterministic ordering)
- [ ] **Version your data** - Include `dataVersion` in root or metadata
- [ ] **Test with multiple consumers** - Grid, detail, search, export

### Example: Adding Rarity to Conan Items

**❌ Wrong Approach** (presentation in data):

```json
{
  "id": "sword_01",
  "rarityColor": "#FFD700",
  "rarityBorder": "border-2 border-[#FFD700]",
  "rarityBadge": "⭐⭐⭐"
}
```

**✅ Right Approach** (semantic data + config):

**Data** (extraction script output):

```json
{
  "id": "sword_01",
  "name": "Sword of Crom",
  "rarity": "legendary"
}
```

**Config** (game config):

```ts
conanConfig.fieldGuide.itemCard = {
  rarityBorders: {
    sourceField: "rarity",
    colorMap: {
      legendary: "border-highlight",
      epic: "border-secondary",
      common: "border-primary",
    },
  },
};
```

**Adapter** (applies mapping):

```tsx
borderVariant={(item) => {
  const colorMap = conanConfig.fieldGuide.itemCard.rarityBorders.colorMap;
  return colorMap[item.rarity] || 'default';
}}
```

---

## Benefits of Data-Driven Architecture

✅ **Rebrand in minutes** - Change colors in theme, swap icons in config  
✅ **A/B test presentations** - Multiple configs, same data  
✅ **Localization-ready** - Text in configs, not hard-coded  
✅ **Designer-friendly** - Non-developers can edit configs  
✅ **Type-safe** - TypeScript validates configs at compile time  
✅ **Testable** - Mock configs to test different scenarios  
✅ **Reusable** - Same data powers grids, details, tooltips, exports  
✅ **Scalable** - New game = new config, minimal code

---

## Summary: The Data-Driven Workflow

### Adding a New Game

1. **Extract semantic data** (pipeline engineer)
   - Run UE5 extraction scripts
   - Stage data with semantic fields only
   - Output to `projects/{game}/public/data/`

2. **Create game config** (frontend engineer)
   - Define visual mappings in `shared/config/games/{game}.ts`
   - Map semantic fields to badges, borders, labels
   - Define home page content, sections, metadata

3. **Create adapters** (frontend engineer)
   - Write `{game}-item-grid.tsx` that reads config
   - Apply config rules to semantic data
   - Pass to shared components

4. **Validate** (both)
   - Build site, check TypeScript errors
   - Visual QA: badges, borders, labels correct?
   - Update config if presentation needs adjustment

**Time estimate**: 4-6 hours for full game setup (was 20+ hours with hard-coded approach).

---

## Golden Rules

1. **Data = WHAT, Config = HOW, Component = WHERE**
2. **Never put CSS classes or hex colors in extracted data**
3. **Never hard-code game-specific field names in shared components**
4. **Always make new features opt-in via config**
5. **When in doubt, ask: "Can I change the presentation without re-running the pipeline?"**

If the answer is no, you've put presentation in data. Refactor.
