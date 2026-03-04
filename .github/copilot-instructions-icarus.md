# Icarus Companion — Copilot Instructions

## Overview

This is an offline-friendly companion site for the survival game **Icarus**, served at `thelysdexicone.github.io/icarus`. It is a Next.js 15 App Router project with a static export (`output: 'export'`). All game data is pre-processed from ripped game assets and shipped as static JSON files under `public/data/`.

## Project Location

```
projects/icarus/
  next.config.js          basePath: "/icarus", assetPrefix: "/icarus/"
  src/app/
    layout.tsx            Root layout — mounts <Nav /> sidebar
    page.tsx              Home — links to Field Guide and Progression tools
    globals.css           Imports shared/styles/globals.css
    tailwind.css
    components/
      nav.tsx             Fixed sidebar (desktop) / slide-out (mobile)
      header.tsx          In-page header with back/breadcrumb/search
      category-grid.tsx   Default main panel: all categories as responsive grid
      category-panel.tsx  Left accordion — categories + expandable item lists
      item-grid.tsx       Main panel: items within a selected category
      item-detail-panel.tsx  Full item detail: lore, stats, workshop costs, recipes, workflow graph
      field-guide-layout.tsx  Two-pane shell (left panel + main content)
      field-guide-items.tsx   State owner for the Items field guide section
      field-guide-placeholder.tsx  Placeholder for Bestiary / Fishing sections
      recipe-explorer.tsx     Standalone recipe search/filter tool
      tier-cheatsheet.tsx     Tier progression page — T1→T2→T3→T4 narrative with interactive item chips and detail modal
      workflow-graph.tsx      @xyflow/react DAG for crafting dependency graphs
    field-guide/
      items/page.tsx      /field-guide/items  — item browser
      bestiary/page.tsx   /field-guide/bestiary — placeholder
      fishing/page.tsx    /field-guide/fishing  — placeholder
    items/page.tsx        /items — recipe explorer
    progression/          /progression — tier guide
  public/
    data/221.2/           Static JSON data (see Data section below)
    game-assets/          Mirrored item icons (WebP)
```

## Key Design Constraints

- **Static export only.** No server components with data fetching at runtime. All JSON is loaded client-side via `fetch('/icarus/data/...')` or imported directly.
- **`basePath: "/icarus"`** — all `href`, `src`, and fetch paths must be relative or prefixed appropriately. Use Next.js `<Link>` and `<Image>` components; they apply basePath automatically.
- **`<nav>` tag is poisoned.** `shared/styles/globals.css` applies `position: fixed; left: 0; top: 0; z-index: 40; height: 100vh; width: 16rem` to ALL `nav` elements. Field guide panels must use `<div role="navigation">` instead of `<nav>`.
- **Tailwind CSS** with the shared theme (`shared/styles/globals.css` + `shared/styles/tailwind-theme.css`). CSS variables: `bg-main`, `bg-card`, `text-primary`, `text-secondary`, `border-primary`.
- **No `aspect-square`** on icon cards — let content size determine height.
- **Do NOT use `image-rendering: pixelated`** (or `-moz-crisp-edges` / `crisp-edges`). Icarus is a 3D survival game with high-resolution icon art — pixelated rendering makes everything look terrible. The `image-rendering` block in `shared/styles/globals.css` is commented out for this reason.

## Data Pipeline

All game data originates from Unreal Engine pak files ripped with FModel/UnrealPak. A separate Python pipeline at `e:\_assets_ripped\Icarus_Ripped\scripts\stage_icarus_data.py` processes the raw JSON exports and produces the staged data consumed by the web app.

### Pipeline Location

```
e:\_assets_ripped\Icarus_Ripped\
  scripts/
    stage_icarus_data.py     Main pipeline script
    combine_json.py          Helper
    extract_paks.py          Pak extraction helper
  staged/221.2/              Pipeline output (copied to public/data/221.2/)
  versions/221.2/Content/    Raw FModel JSON exports
    Data/Items/D_ItemsStatic.json      central trait-pointer table
    Data/Items/D_ItemTemplate.json
    Data/Traits/D_Itemable.json         display name, description, flavorText, weight, maxStack, icon
    Data/Crafting/D_ProcessorRecipes.json
    Data/Crafting/D_RecipeSets.json     crafting stations
    Data/Traits/D_Durable.json          durability stats
    Data/Traits/D_Armour.json           armour stats (ArmourStats sub-dict)
    Data/Traits/D_Consumable.json       food/medicine stats (Stats sub-dict)
    Data/Traits/D_Ballistic.json        projectile/ammo stats
    Data/Tools/D_ToolDamage.json        melee/tool stats
    Data/Tools/D_FirearmData.json       firearm stats
    Data/MetaWorkshop/D_WorkshopItems.json
    Data/Currency/D_MetaCurrency.json
    Data/Talents/D_Talents.json
    Assets/2DArt/UI/Items/Item_Icons/**/*.png   ← source PNGs (converted to .webp on mirror)
```

### Running the Pipeline

```powershell
cd e:\_assets_ripped\Icarus_Ripped
# Activate the venv first
.venv\Scripts\Activate.ps1
python scripts\stage_icarus_data.py
```

The script uses default args and writes staged output to both `staged/221.2/` (debug) **and** directly to `C:\Projects\thelysdexicone.github.io\projects\icarus\public\data\221.2\`. No separate copy step is needed.

Outputs summary: `Items total | Craftable items | Categories | Letter chunks | Mirrored assets: N converted, N skipped (unchanged), N missing`.

### Asset Mirroring — WebP Conversion

All game icons are stored in `public/game-assets/` as **WebP** (converted from the source PNGs ripped by FModel).

**Pipeline behavior (`mirror_assets()`):**

- `unreal_to_asset_path()` emits `.webp` extensions — every `assetPath` in every JSON output file ends in `.webp`.
- `BADGE_ICON_PATHS` and `FIELD_GUIDE_ICON_MAP` constants also use `.webp` paths.
- Source files are `.png` (in the FModel export tree). The mirror function substitutes `.webp`→`.png` to locate the source, converts via Pillow (`quality=80, method=4`), and writes `.webp` to the destination.
- **Hash-based change detection**: SHA-256 of the source PNG is stored in `asset-mirror-report.json` (`copied[].srcHash`). On re-runs, unchanged files are skipped (no re-conversion).
- **Old PNG cleanup**: if a `.png` already exists at the destination (legacy), it is deleted after the `.webp` is written.

**Report schema (`public/data/221.2/asset-mirror-report.json`):**

```json
{
  "copiedCount": 2254,
  "skippedCount": 0,
  "missingCount": 1,
  "copied": [{"path": "Assets/.../ITEM_Fibre.webp", "srcHash": "sha256hex"}, ...],
  "skipped": ["..."],
  "missing": ["..."]
}
```

**Frontend:** All hardcoded icon paths in `item-grid.tsx` and `workshop-catalog.tsx` use `.webp`.

### Staged Data Files (`public/data/221.2/`)

| File | Purpose |
|------|---------|
| `meta.json` | Version, item count, timestamp |
| `categories.json` | 24 PFG category definitions (id, displayName, icon path, itemCount) |
| `item-index.json` | Lightweight list of all ~2560 craftable items (itemId, displayName, category, icon, recipeCount, stationIds, requiredFeatureLevel, cosmeticPack) |
| `item-lookup.json` | Map of `itemId → {id, displayName, icon}` for ingredient resolution |
| `stations.json` | Crafting station definitions |
| `tier-sections.json` | Tier 2/3/4 progression data |
| `query-tags.json` | Tag query definitions (wildcard ingredient groups) |
| `workshop-items.json` | Workshop catalog: `{currencies, items[]}` — 312 Workshop items with research/replication costs |
| `items/{letter}.json` | Per-first-letter item detail chunks (27 files: 0, a–z). Each chunk is `Record<itemId, IcarusItemDetail>` |

### Letter Chunk Fields (`items/{letter}.json`)

Each item entry in a letter chunk contains:

| Field | Type | Source |
|-------|------|--------|
| `itemId` | `string` | D_ItemTemplate row name |
| `displayName` | `string` | D_Itemable.DisplayName (parsed NSLOCTEXT) |
| `category` | `string` | `classify_category()` result |
| `icon` | `{assetPath, exists}` | D_Itemable.Icon |
| `recipes` | `IcarusItemRecipe[]` | D_ProcessorRecipes |
| `requiredFeatureLevel` | `string` | D_ItemsStatic.Metadata.RequiredFeatureLevel |
| `cosmeticPack` | `string` | Manual_Tags or Workshop set |
| `description` | `string \| null` | D_Itemable.Description |
| `flavorText` | `string \| null` | D_Itemable.FlavorText |
| `weight` | `number \| null` | D_Itemable.Weight (grams) |
| `maxStack` | `number \| null` | D_Itemable.MaxStack |
| `stats` | `Record<string, number\|string> \| null` | Joined from stat trait tables (display-ready labels) |
| `tags` | `string[]` | D_ItemsStatic.Generated_Tags |
| `workshopCosts` | `{researchCost, replicationCost} \| null` | D_WorkshopItems (embedded; no extra fetch needed) |

### Stat Trait Tables

Six stat tables are loaded by `gather_item_stats(paths)` and joined per-item via pointer fields in `D_ItemsStatic`:

| D_ItemsStatic field | Trait table path | Stat labels emitted |
|---|---|---|
| `ToolDamage` | `Data/Tools/D_ToolDamage.json` | Melee Damage, Felling Damage, Felling Efficiency, Mining Efficiency |
| `Durable` | `Data/Traits/D_Durable.json` | Durability (`Max_Durability`) |
| `Armour` | `Data/Traits/D_Armour.json` | Damage Resistance %, Upgrade Slots, Oxygen/Water/Food Slots (`ArmourStats` sub-dict) |
| `Consumable` | `Data/Traits/D_Consumable.json` | Food/Health/Water/Oxygen/Stamina Recovery (`Stats` sub-dict) |
| `Ballistic` | `Data/Traits/D_Ballistic.json` | Projectile Damage, Break Chance |
| `FirearmData` | `Data/Tools/D_FirearmData.json` | Fire Rate (RPM), Mag Size, Reload Time (s) |

The `ArmourStats` and `Stats` sub-dicts use Unreal UPROPERTYMAP keys like `(Value="BaseFoodRecovery_+")` — parsed by `_parse_unreal_stat_dict()`. Zero-valued stats are suppressed.

### Workshop Costs Embedding

In `stage()`, a `workshop_costs_by_item_id` lookup is built from `gather_workshop_data()` output, then passed into `build_item_chunks()`. Each Workshop item's letter chunk entry will have a populated `workshopCosts` field; all other items get `null`. The frontend does **not** need to load `workshop-items.json` to show Workshop costs in the item detail panel — they are already embedded.

### Item Classification (`classify_category`)

Items are classified by their icon's folder path (`Item_Icons/<folder>/`). Key mappings:

| Icon folder | Category |
|-------------|----------|
| `Fish/` | Fish (species: Fish_01 – Fish_17 variants) |
| `Fishing/` | Attachments (fishing lures — they are rod attachments, NOT fish) |
| `Carcasses/` | Carcasses by default; `*Trophy*` → Trophies; `*Serum*` → Husbandry |
| `Voxels/` | Ores |
| `Resources/` | Resources |
| `Projectiles/` | Ammo |
| `Modules/` | Suits & Modules |
| `Weapons/` | Ranged (or Shields if `Shield` in item_id) |
| `Buildables/` | Buildings |
| `Armour/` | Armor (or Suits & Modules if `Module`/`Suit` in item_id) |

### Feature Level Gating

All currently known `RequiredFeatureLevel` values (`Galileo`, `GreatHunts`, `Homestead`, `Laika`, `NewFrontiers`) correspond to **shipped DLC/expansions** — none are filtered out. When "Dangerous Horizons" is released and its data is extracted, add its `RowName` value as a new filter condition in `build_item_index` and `build_item_chunks`.

### DLC / Paid-Pack Overlay Badges

Each item in `item-index.json` (and the per-letter chunks) now carries two optional fields:

| Field | Source | Values |
|---|---|---|
| `requiredFeatureLevel` | `D_Itemable.Metadata.RequiredFeatureLevel.RowName` | `""`, `Galileo`, `GreatHunts`, `Homestead`, `Laika`, `NewFrontiers` |
| `cosmeticPack` | `D_ItemsStatic.Manual_Tags.GameplayTags[].TagName` → `_TAG_TO_COSMETIC_PACK`, or `_Workshop` suffix in item_id | `""`, `ArtDeco`, `Industrial`, `Interior`, `Workshop` |

**Badge rendering in `item-grid.tsx`:**

Two badge lookup tables (`FL_BADGE`, `CP_BADGE`) map these values to PNG paths under `public/game-assets/`:

| Badge type | Position | Style | Scope |
|---|---|---|---|
| `FL_BADGE` (top-left) | absolute top-0 left-0 | `brightness-0 invert` (white, no bg) | `GreatHunts`, `NewFrontiers` |
| `CP_BADGE` (bottom-left) | absolute bottom-0 left-0 | gold img, dark bg `#191919`, gold border `#f1ad1c` | `Homestead`, `Laika`, `ArtDeco`, `Industrial`, `Interior` |

`CP_BADGE` is also keyed by `requiredFeatureLevel` for `Homestead` and `Laika` (which use feature-level field, not cosmeticPack). Priority: `cosmeticPack` first, then fallback to `requiredFeatureLevel`.

**Workshop card styling:** items with `cosmeticPack === "Workshop"` use `border-highlight` instead of `border-primary`. Workshop items do **not** get a `CP_BADGE` icon — only the gold border distinguishes them. (`Workshop` was intentionally removed from `CP_BADGE`.)

**Badge WebP paths:**

```
public/game-assets/Assets/2DArt/UI/Icons/
  T_FeatureLevelIcon_NewFrontiers3.webp  ← NewFrontiers top-left
  FeatureLevel/T_FeatureLevel_GH.webp    ← GreatHunts top-left
  T_Icon_Homestead.webp                  ← Homestead bottom-left
  T_ICON_Paws.webp                       ← Laika bottom-left
  T_ICON_Money_Symbol_Double.webp        ← ArtDeco / Industrial / Interior bottom-left
```

**Badge sizes:** `h-3 w-3` (base) · `h-4 w-4` (md) · `h-5 w-5` (xl)

**Dot indicators in `category-panel.tsx`:** After the `recipeCount×` span, a tiny dot is appended when `requiredFeatureLevel` or `cosmeticPack` is set:

- Gold dot (`bg-highlight opacity-70`): cosmetic packs OR Homestead/Laika feature levels (paid content)
- Muted dot (`bg-secondary opacity-30`): GreatHunts/NewFrontiers feature expansions

**Pipeline detection (`stage_icarus_data.py`):**

```python
_TAG_TO_COSMETIC_PACK = {
    "Item.Decoration.ArtDeco":       "ArtDeco",
    "Item.Decoration.Industrialist": "Industrial",
    "Item.Decoration.Brutalist":     "Industrial",
    "Item.Decoration.Painting":      "Interior",
    "Item.Decoration.Geode":         "Interior",
}
# Workshop detection: uses the authoritative set of IDs from D_WorkshopItems
# (item must appear as Item.RowName in D_WorkshopItems to get cosmeticPack="Workshop")
# This correctly handles items like Meta_Axe_Inaris_Charlie with no "_Workshop" suffix.
```

## Field Guide Navigation Flow

```
field-guide-items.tsx manages:
  selectedCategoryId (string)  →  drives ItemGrid
  selectedItemId (string)      →  drives ItemDetailPanel
  expandedCategoryId (string)  →  controls CategoryPanel accordion

No selection          → CategoryGrid (all 24 categories)
Category selected     → ItemGrid (items in that category)
Item selected         → ItemDetailPanel

onBack:
  if selectedItemId   → clear item (stay in category)
  else                → clear category (back to CategoryGrid)

onCategories:         → clear both (back to CategoryGrid)
```

## TypeScript Types (`src/types/icarus.ts`)

### `IcarusItemDetail`

The full item detail type loaded from letter chunks. All fields beyond `recipes` are optional (may be absent for items with no lore/stats):

```typescript
export type IcarusItemDetail = {
  itemId: string;
  displayName: string;
  category: string;
  icon: { assetPath: string; exists: boolean };
  recipes: IcarusItemRecipe[];
  requiredFeatureLevel?: string;
  cosmeticPack?: string;
  description?: string;         // D_Itemable.Description
  flavorText?: string;          // D_Itemable.FlavorText (italic lore)
  weight?: number;              // grams
  maxStack?: number;
  stats?: Record<string, number | string>;  // display-label → value
  tags?: string[];              // Generated_Tags
  workshopCosts?: {
    researchCost: WorkshopCostEntry[];
    replicationCost: WorkshopCostEntry[];
  } | null;
};
```

### `WorkshopCostEntry`

```typescript
export type WorkshopCostEntry = { currencyId: string; amount: number };
```

### `WorkshopCurrencyDef`

```typescript
export type WorkshopCurrencyDef = {
  displayName: string;
  iconPath: string;   // asset path relative to game-assets root
  color: string;      // CSS hex e.g. "#f8c944"
};
```

## Component Patterns

### `item-detail-panel.tsx` — Rendering Order

Panel now renders multiple sections regardless of whether the item has crafting recipes. Workshop items that have no recipes but have `workshopCosts` will no longer show a blank panel.

1. **Header** — icon + `displayName` + `category` subtext
2. **Lore block** (when `description`, `flavorText`, `weight`, or `maxStack` present)
   - `description` paragraph
   - `flavorText` in italic + reduced opacity
   - Weight chip: `Weight: {n}g` · Stack chip: `×{n}`
3. **Stats panel** (when `stats` has entries) — two-column grid of label → value
4. **Workshop costs panel** (when `workshopCosts` has entries) — `border-highlight` border, Research Cost / Replication Cost rows with currency icons from `workshopCurrencies` prop
5. **Recipe section** — only rendered when `recipes.length > 0 && recipe` is defined:
   - Recipe tabs (if >1 recipe)
   - Station + power badges
   - Inputs / Outputs grid
   - Raw Materials
   - Crafting Graph (WorkflowGraph)
6. **Fallback** — "No crafting recipe available" when no recipes and no workshop costs

**Props:**

```typescript
type Props = {
  detail: IcarusItemDetail;
  selectedRecipeIndex: number;
  onRecipeSelect: (i: number) => void;
  stationById: Map<string, IcarusStation>;
  queryTagById: Map<string, IcarusQueryTag>;
  itemLookup: IcarusItemLookupMap;
  workshopCurrencies?: Record<string, WorkshopCurrencyDef>;  // from workshop-items.json
};
```

### `field-guide-items.tsx` — Data Loading

Loads on mount (parallel `Promise.all`):

- `item-index.json`
- `categories.json`
- `stations.json`
- `item-lookup.json`
- `query-tags.json`
- `workshop-items.json` → extracts `currencies` into `workshopCurrencies` state

Lazy-loads per-first-letter item chunks (`items/{letter}.json`) only when a specific item is selected and its bucket hasn't been fetched yet.

**Note:** `tier-cheatsheet.tsx` uses the same lazy-loading pattern independently (its own `detailCache` + `fetchedBuckets` ref).

### Icon sizing convention

- **Category cards**: `h-8 w-8` (base/sm) · `h-16 w-16` (md/lg) · `h-32 w-32` (xl/2xl, native 128px)
- **Item cards**: `h-8 w-8` (base) · `h-12 w-12` (md) · `h-16 w-16` (xl, native 64px)
- **Category panel items**: no icon

### `tier-cheatsheet.tsx` — Tier Progression Page

Complete rewrite from the old "All Unlocks [Expand]" dump. Now a narrative T1→T2→T3→T4 walkthrough.

**Removed:** `CRITICAL_PATH` hardcoded record, `TierCard` component, `showAll`/`query` state, unlock grid, `useMemo`.

**Static data — `PROGRESSION_STEPS: StepDef[]`** (3 entries):

| Step | Gateway | `tierId` | Ingredient/prereq source |
|---|---|---|---|
| T1→T2 | Crafting Bench (hand-crafted) | `"T2"` | Hardcoded (60 Fiber, 50 Wood, 12 Stone, 20 Leather) |
| T2→T3 | Machine Bench at Crafting_Bench | `"T3"` | Hardcoded (game-verified: 20 Wood, 12 Stone, 120 Iron Nails, 40 Iron Ingots, 10 Epoxy, 24 Rope) |
| T3→T4 | Fabricator at Machining_Bench | `"T4"` | From `items/f.json` Fabricator recipe (40 Aluminium, 30 Electronics, 30 Concrete Mix, 8 Carbon Fiber, 30 Steel Screw) |

**Important `itemId` rules for `PROGRESSION_STEPS`:**

- Use `item-lookup.json` keys for ingredients/prerequisites/gateways (e.g. `"Crafting_Bench"`, not `"Kit_Crafting_Bench"`; `"Stone_Furnace"`, not `"Kit_Stone_Furnace"`).
- `itemId` is used to look up icons in `itemLookup`; if not found, `iconAssetPath` override is needed.

**Sub-components:**

`IngredientChip` — clickable button showing item icon, `×count`, display name, optional station badge beneath.

- Accepts `iconAssetPath?: string` override — used for deployable station items absent from `item-lookup.json`.
- `onClick` receives `(itemId, DOMRect)` for zoom-from-icon modal positioning.

`ItemModal` — zoom-from-icon overlay:

- Captures `button.getBoundingClientRect()` on click, passed as `anchorRect`.
- On mount, computes `transformOrigin: "{ox}px {oy}px"` relative to card, then triggers `scale-75→scale-100 opacity-0→100` transition.
- Backdrop: `fixed inset-0 bg-black/60 backdrop-blur-sm`, click dismisses.
- Escape key also dismisses.
- Shows `<ItemDetailPanel>` with lazy-loaded detail ("Loading…" while fetching).
- Keyed by `itemId` so it remounts cleanly on selection change.

`ProgressionStep` — one card per step:

1. Step header: `"T1 → T2"` etc.
2. Gateway bench block (highlighted border) — large `IngredientChip` + crafted-at/hand-crafted note.
3. Ingredients — `flex flex-wrap` grid of `IngredientChip` with count and station badge.
4. Prerequisites ("You'll also need") — chip + `— reason` text.
5. Note (if non-null) — muted border box.
6. "Benches Unlocked in Tier X" — filtered from `tier-sections.json` entries where `stationById.has(entry.id)` for that tier.
7. "Key items — Coming Soon" dashed placeholder.

**Station name resolution in "Benches Unlocked":**

- Use `stationById.get(entry.id)?.name` (from `D_RecipeSets.RecipeSetName` via `stations.json`) NOT `entry.name` (from the talent tree, which uses raw game keys like "Armor Bench", "Masonry Bench T4").
- Use `stationById.get(entry.id)?.icon.assetPath` passed as `iconAssetPath` override on the chip — deployable station items are not in `item-lookup.json`.

**`TierCheatsheet` data loading (parallel on mount, 5 fetches):**

- `tier-sections.json` → `tiers` state
- `item-lookup.json` → `itemLookup` state
- `stations.json` → `stationById: Map<string, IcarusStation>`
- `query-tags.json` → `queryTagById: Map<string, IcarusQueryTag>` (for ItemDetailPanel)
- `workshop-items.json` → extracts `currencies` into `workshopCurrencies` state

**Lazy item detail loading:**

- `detailCache: Record<string, IcarusItemDetail>` + `fetchedBuckets: useRef<Set<string>>`
- On chip click: fetch `items/{firstLetter}.json` if bucket not yet loaded; merge into cache.
- Modal opens immediately (shows "Loading…") and updates once detail arrives.

### CategoryPanel

- Root element: `<div role="navigation">` — never `<nav>` (see constraint above)
- Header row is split: clicking the **name/icon side** calls `onSelectCategory?.(cat.id)` (navigates to ItemGrid); clicking the **count/toggle side** calls `onToggleCategory(cat.id)` (expands accordion)
- Item rows: no icon, `py-1` spacing, `bg-primary/[0.04]` on odd-indexed rows

### WorkflowGraph

- Uses `@xyflow/react` v12
- DAG layout via `@dagrejs/dagre`
- Renders the full ingredient dependency tree for a recipe

## Dependencies

```json
"@dagrejs/dagre": "^1.1.4",
"@fortawesome/react-fontawesome": "^3.2.0",
"@xyflow/react": "^12.6.4",
"next": "15.4.6"
```

## Dev

```bash
npm run dev        # port 3002
npm run build      # static export to out/
```
