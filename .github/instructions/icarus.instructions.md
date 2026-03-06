---
applyTo: "projects/icarus/**"
---

# Icarus Companion — Copilot Instructions

## Overview

This is an offline-friendly companion site for the survival game **Icarus**, served at `thelysdexicone.github.io/icarus`. It is a Next.js 15 App Router project with a static export (`output: 'export'`). All game data is pre-processed from ripped game assets and shipped as static JSON files under `public/data/`.

## Project Location

```
projects/icarus/
  next.config.js          basePath: "/icarus", assetPrefix: "/icarus/"
  pipeline/               Data pipeline scripts (Python)
    stage_icarus_data.py  Main pipeline script
    pipeline_config.py    Machine-specific paths (tracked in repo)
    pipeline_config.py.example  Path template for reference
    requirements.txt      Pillow only
    README.md             Setup and run instructions
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

All game data originates from Unreal Engine pak files ripped with FModel/UnrealPak. The Python pipeline lives in the repo at `projects/icarus/pipeline/` and processes the raw JSON exports into the staged data consumed by the web app.

### Pipeline Location

```
projects/icarus/pipeline/
  stage_icarus_data.py   Main pipeline script (~600 lines)
  pipeline_config.py     Machine-specific path constants (committed to repo)
  pipeline_config.py.example  Template for reference when migrating machines
  requirements.txt       Pillow only

pipeline_config.py constants:
  DATA_DIR        = r"E:\_assets_ripped\Icarus_Ripped\Data"
  ICONS_SRC_DIR   = r"E:\_assets_ripped\Icarus_Ripped\staging\ui-pngs"
  OUT_DIR         = r"C:\Projects\thelysdexicone.github.io\projects\icarus\public\data\221.2"
  ASSETS_DEST_DIR = r"C:\Projects\thelysdexicone.github.io\projects\icarus\public\game-assets"
  VERSION         = "221.2"
```

### Raw Data Layout

The ripped game data lives at `E:\_assets_ripped\Icarus_Ripped\` with the following layout:

```
E:\_assets_ripped\Icarus_Ripped\
  Data/                          Raw FModel JSON exports (DataTables)
    Items/
      D_ItemsStatic.json         Central trait-pointer table
      D_ItemTemplate.json        Template name → static row name mapping
    Traits/
      D_Itemable.json            Display name, description, flavorText, weight, maxStack, icon
      D_Durable.json             Durability stats
      D_Armour.json              Armour stats (ArmourStats sub-dict)
      D_Consumable.json          Food/medicine stats (Stats sub-dict)
      D_Ballistic.json           Projectile/ammo stats
    Tools/
      D_ToolDamage.json          Melee/tool stats
      D_FirearmData.json         Firearm stats
    Crafting/
      D_ProcessorRecipes.json    All crafting recipes
      D_RecipeSets.json          Crafting station definitions
    MetaWorkshop/
      D_WorkshopItems.json       Workshop catalog
    Currency/
      D_MetaCurrency.json        Workshop currency definitions
    Talents/
      D_Talents.json             Talent tree entries (Rows is an ARRAY, not a dict)
      D_TalentTrees.json         Talent tree definitions
    Tags/
      D_TagQueries.json          Tag query definitions
    FieldGuide/
      D_FieldGuideCategories.json
  staging/
    ui-pngs/                     Extracted item icons (source PNGs)
      Items/Item_Icons/**/*.png  Item icons by category subfolder
      FieldGuide/CategoryIcons/  Category icons
      Icons/                     Misc UI icons
  .venv/                         Python venv (Pillow installed)
```

**Important:** `D_Talents.json` `Rows` is a JSON **array** (not a dict). Each entry has a `Name` field — this differs from most other DataTables which use an object keyed by row name. `load_table()` handles both via `for row in data.get("Rows", [])`.

### Running the Pipeline

```powershell
cd c:\Projects\thelysdexicone.github.io\projects\icarus\pipeline
# Activate the venv (Pillow is installed)
E:\_assets_ripped\Icarus_Ripped\.venv\Scripts\Activate.ps1
python stage_icarus_data.py
```

All outputs are written directly to `public/data/221.2/` and `public/game-assets/`. No separate copy step is needed.

Expected summary line: `Items: 2154 | Craftable: 1845 | Categories: 21 | Letter chunks: 25 | Assets: N converted, N skipped, N missing`

**1 persistent "missing" asset:** `Developers/francisliardet/UI/Icons/FontAwesome/arrows-up-down-left-right-solid.webp` — a developer-folder FontAwesome icon referenced somewhere in the data. This is not a game item icon and is safely ignorable.

### Migrating to a New Machine

Update the 4 path constants in `projects/icarus/pipeline/pipeline_config.py`:
```python
DATA_DIR        = r"<new_data_path>"
ICONS_SRC_DIR   = r"<new_icons_path>"
OUT_DIR         = r"<new_repo_path>\projects\icarus\public\data\221.2"
ASSETS_DEST_DIR = r"<new_repo_path>\projects\icarus\public\game-assets"
```

### Asset Mirroring — WebP Conversion

All game icons are stored in `public/game-assets/` as **WebP** (converted from the source PNGs at `ICONS_SRC_DIR`).

**Pipeline behavior (`mirror_assets()`):**

- `unreal_to_asset_path()` emits `.webp` extensions — every `assetPath` in every JSON output file ends in `.webp`.
- Source files are `.png` under `ICONS_SRC_DIR`. The mirror function maps the Unreal path to the source PNG, converts via Pillow (`quality=80, method=4`), and writes `.webp` to `ASSETS_DEST_DIR`.
- **Hash-based change detection**: SHA-256 of the source PNG is stored in `asset-mirror-report.json` (`copied[].srcHash`). On re-runs, unchanged files are skipped (no re-conversion).
- **Old PNG cleanup**: if a `.png` already exists at the destination (legacy), it is deleted after the `.webp` is written.

**Report schema (`public/data/221.2/asset-mirror-report.json`):**

```json
{
  "copiedCount": 35,
  "skippedCount": 2741,
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
| `categories.json` | 21 category definitions (array of `{id, displayName, icon, itemCount}`) |
| `item-index.json` | Lightweight list of all ~1845 craftable items (itemId, displayName, category, icon, recipeCount, stationIds, requiredFeatureLevel, cosmeticPack) |
| `item-lookup.json` | Map of `itemId → {id, displayName, icon}` for ingredient resolution |
| `stations.json` | **Array** of crafting station objects `{id, name, description, icon, experienceMultiplier}` |
| `tier-sections.json` | **Array** of tier progression data — T2, T3, T4, T5 (see Tier Trees below) |
| `query-tags.json` | Tag query definitions (wildcard ingredient groups) |
| `workshop-items.json` | Workshop catalog: `{currencies, items[]}` |
| `items/{letter}.json` | Per-first-letter item detail chunks (25 files: a–z, with 0 for non-alpha). Each chunk is `Record<itemId, IcarusItemDetail>` |

**Note:** `stations.json` is an **array**, not a dict — iterate with `.find(s => s.id === stationId)` or build a `Map` from it.

### Tier Tree Names

The `D_Talents.json` `TalentTree.RowName` values that map to progression tiers:

| RowName | Tier |
|---|---|
| `Blueprint_T2_Crafting` | T2 |
| `Blueprint_T3_Machine` | T3 |
| `Blueprint_T4_Fabricator` | T4 |
| `Blueprint_T5_Manufacturer` | T5 |

Tier entry counts (v221.2): T2: 241, T3: 206, T4: 161, T5: 65.

Other talent trees (`Blueprint_T1_Player`, combat trees, construction trees, etc.) are NOT included in `tier-sections.json`.

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

### Recipe Schema (`IcarusItemRecipe`)

```typescript
{
  recipeId: string;
  requiredMillijoules: number;
  stationIds: string[];          // array, NOT a single "station" string
  inputs: { kind: "item"|"query"|"resource"; itemId: string; count: number }[];
  queryInputs: ...[];
  resourceInputs: ...[];
  outputs: { itemId: string; count: number }[];
  workflow: { rawMaterials: ...; nodes: string[]; edges: ... };
}
```

### Stat Trait Tables

Six stat tables are loaded by `gather_item_stats()` and joined per-item via pointer fields in `D_ItemsStatic`:

| D_ItemsStatic field | Trait table path | Stat labels emitted |
|---|---|---|
| `ToolDamage` | `Tools/D_ToolDamage.json` | Melee Damage, Felling Damage, Felling Efficiency, Mining Efficiency |
| `Durable` | `Traits/D_Durable.json` | Durability (`Max_Durability`) |
| `Armour` | `Traits/D_Armour.json` | Damage Resistance %, Upgrade Slots, Oxygen/Water/Food Slots (`ArmourStats` sub-dict) |
| `Consumable` | `Traits/D_Consumable.json` | Food/Health/Water/Oxygen/Stamina Recovery (`Stats` sub-dict) |
| `Ballistic` | `Traits/D_Ballistic.json` | Projectile Damage, Break Chance |
| `FirearmData` | `Tools/D_FirearmData.json` | Fire Rate (RPM), Mag Size, Reload Time (s) |

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

Each item in `item-index.json` (and the per-letter chunks) carries two optional fields:

| Field | Source | Values |
|---|---|---|
| `requiredFeatureLevel` | `D_Itemable.Metadata.RequiredFeatureLevel.RowName` | `""`, `Galileo`, `GreatHunts`, `Homestead`, `Laika`, `NewFrontiers` |
| `cosmeticPack` | `D_ItemsStatic.Manual_Tags.GameplayTags[].TagName` → `_TAG_TO_COSMETIC_PACK`, or Workshop item set | `""`, `ArtDeco`, `Industrial`, `Interior`, `Workshop` |

**Badge rendering in `item-grid.tsx`:**

Two badge lookup tables (`FL_BADGE`, `CP_BADGE`) map these values to PNG paths under `public/game-assets/`:

| Badge type | Position | Style | Scope |
|---|---|---|---|
| `FL_BADGE` (top-left) | absolute top-0 left-0 | `brightness-0 invert` (white, no bg) | `GreatHunts`, `NewFrontiers` |
| `CP_BADGE` (bottom-left) | absolute bottom-0 left-0 | gold img, dark bg `#191919`, gold border `#f1ad1c` | `Homestead`, `Laika`, `ArtDeco`, `Industrial`, `Interior` |

`CP_BADGE` is also keyed by `requiredFeatureLevel` for `Homestead` and `Laika`. Priority: `cosmeticPack` first, then fallback to `requiredFeatureLevel`.

**Workshop card styling:** items with `cosmeticPack === "Workshop"` use `border-highlight` instead of `border-primary`. Workshop items do **not** get a `CP_BADGE` icon.

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
```

## Field Guide Navigation Flow

```
field-guide-items.tsx manages:
  selectedCategoryId (string)  →  drives ItemGrid
  selectedItemId (string)      →  drives ItemDetailPanel
  expandedCategoryId (string)  →  controls CategoryPanel accordion

No selection          → CategoryGrid (all categories)
Category selected     → ItemGrid (items in that category)
Item selected         → ItemDetailPanel

onBack:
  if selectedItemId   → clear item (stay in category)
  else                → clear category (back to CategoryGrid)

onCategories:         → clear both (back to CategoryGrid)
```

## TypeScript Types (`src/types/icarus.ts`)

### `IcarusItemDetail`

```typescript
export type IcarusItemDetail = {
  itemId: string;
  displayName: string;
  category: string;
  icon: { assetPath: string; exists: boolean };
  recipes: IcarusItemRecipe[];
  requiredFeatureLevel?: string;
  cosmeticPack?: string;
  description?: string;
  flavorText?: string;
  weight?: number;              // grams
  maxStack?: number;
  stats?: Record<string, number | string>;
  tags?: string[];
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
  iconPath: string;
  color: string;      // CSS hex e.g. "#f8c944"
};
```

## Component Patterns

### `item-detail-panel.tsx` — Rendering Order

1. **Header** — icon + `displayName` + `category` subtext
2. **Lore block** (when `description`, `flavorText`, `weight`, or `maxStack` present)
3. **Stats panel** (when `stats` has entries) — two-column grid
4. **Workshop costs panel** (when `workshopCosts` has entries) — `border-highlight` border
5. **Recipe section** — only when `recipes.length > 0`
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
  workshopCurrencies?: Record<string, WorkshopCurrencyDef>;
};
```

### `field-guide-items.tsx` — Data Loading

Loads on mount (parallel `Promise.all`):

- `item-index.json`
- `categories.json`
- `stations.json` → build `Map<id, station>` after loading (it's an array)
- `item-lookup.json`
- `query-tags.json`
- `workshop-items.json` → extracts `currencies` into `workshopCurrencies` state

Lazy-loads per-first-letter item chunks only when a specific item is selected.

### Icon sizing convention

- **Category cards**: `h-8 w-8` (base/sm) · `h-16 w-16` (md/lg) · `h-32 w-32` (xl/2xl)
- **Item cards**: `h-8 w-8` (base) · `h-12 w-12` (md) · `h-16 w-16` (xl)
- **Category panel items**: no icon

### `tier-cheatsheet.tsx` — Tier Progression Page

Narrative T1→T2→T3→T4 walkthrough with interactive item chips and detail modal.

**Static data — `PROGRESSION_STEPS: StepDef[]`** (3 entries):

| Step | Gateway | `tierId` | Notes |
|---|---|---|---|
| T1→T2 | Crafting Bench (hand-crafted) | `"T2"` | Hardcoded ingredients |
| T2→T3 | **Machining Bench** at Crafting_Bench | `"T3"` | `itemId: "Machining_Bench"` |
| T3→T4 | Fabricator at Machining_Bench | `"T4"` | From `items/f.json` recipe |

**Important `itemId` rules:**

- Use `item-lookup.json` keys (e.g. `"Crafting_Bench"` not `"Kit_Crafting_Bench"`; `"Refined_Metal"` not `"Iron_Ingot"` — `Iron_Ingot` does not exist in the data, the item is `Refined_Metal` with displayName "Iron Ingot").
- `itemId` is used for icon lookup; use `iconAssetPath` override for station items absent from `item-lookup.json`.

**Data loading (parallel on mount, 5 fetches):** `tier-sections.json`, `item-lookup.json`, `stations.json`, `query-tags.json`, `workshop-items.json`.

**Station name resolution in "Benches Unlocked":**

- Use `stationById.get(entry.id)?.name` (from `stations.json`) NOT `entry.name` (talent tree raw names).
- Use `stationById.get(entry.id)?.icon.assetPath` as `iconAssetPath` override on the chip.

### CategoryPanel

- Root element: `<div role="navigation">` — never `<nav>`
- Clicking **name/icon side**: calls `onSelectCategory?.(cat.id)` (navigates to ItemGrid)
- Clicking **count/toggle side**: calls `onToggleCategory(cat.id)` (expands accordion)

### WorkflowGraph

- Uses `@xyflow/react` v12
- DAG layout via `@dagrejs/dagre`

## Dependencies

```json
"@dagrejs/dagre": "^1.1.4",
"@fortawesome/react-fontawesome": "^3.2.0",
"@xyflow/react": "^12.6.4",
"next": "15.4.6"
```

## Dev

```bash
npm run dev        # port 3002 (npm run dev:icarus from repo root)
npm run build      # static export to out/
```
