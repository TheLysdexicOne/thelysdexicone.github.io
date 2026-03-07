"""
stage_icarus_data.py
Icarus companion site — data pipeline

Reads raw Unreal Engine JSON exports and writes staged JSON for the Next.js app.

Config: pipeline_config.py (gitignored — copy from pipeline_config.py.example)
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import defaultdict, deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Config — load from pipeline_config.py and resolve latest version
# ---------------------------------------------------------------------------
def _find_latest_version(versions_root: Path) -> Path:
    """Return the version subfolder with the most recent mtime."""
    candidates = [p for p in versions_root.iterdir() if p.is_dir()]
    if not candidates:
        print(f"ERROR: No version folders found in {versions_root}", file=sys.stderr)
        sys.exit(1)
    return max(candidates, key=lambda p: p.stat().st_mtime)


try:
    import pipeline_config as _cfg  # type: ignore
    _versions_root  = Path(_cfg.ICARUS_DATA_VERSIONS_DIR)
    _latest         = _find_latest_version(_versions_root)
    VERSION: str    = _latest.name
    DATA_DIR        = _latest / "Content" / "Data"
    ICONS_SRC_DIR   = _latest / "Content" / "Assets" / "2DArt" / "UI"
    OUT_DIR         = Path(_cfg.OUT_DIR_BASE) / VERSION
    ASSETS_DEST_DIR = Path(_cfg.ASSETS_DEST_DIR)
    print(f"[pipeline] Resolved version: {VERSION}")
except ModuleNotFoundError:
    print(
        "ERROR: pipeline_config.py not found.\n"
        "Copy pipeline_config.py.example → pipeline_config.py and fill in your local paths.",
        file=sys.stderr,
    )
    sys.exit(1)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Tags that indicate cosmetic pack membership
_TAG_TO_COSMETIC_PACK: dict[str, str] = {
    "Item.Decoration.ArtDeco":       "ArtDeco",
    "Item.Decoration.Industrialist": "Industrial",
    "Item.Decoration.Brutalist":     "Industrial",
    "Item.Decoration.Painting":      "Interior",
    "Item.Decoration.Geode":         "Interior",
}

# DLC feature levels that are currently live (not filtered out)
_KNOWN_FEATURE_LEVELS = {"", "Galileo", "GreatHunts", "Homestead", "Laika", "NewFrontiers", "DangerousHorizons"}

# Gateway item for each tier transition — minimal justified hardcode.
# The gateway identity is game-design knowledge not extractable from data alone.
# Format: tierId → (gateway_item_id, from_tier_label, to_tier_label)
_TIER_GATEWAYS: dict[str, tuple[str, str, str]] = {
    "T2": ("Crafting_Bench",      "Tier 1", "Tier 2"),
    "T3": ("Kit_Machining_Bench", "Tier 2", "Tier 3"),
    "T4": ("Fabricator",          "Tier 3", "Tier 4"),
    "T5": ("Manufacturer",        "Tier 4", "Tier 5"),
}

# Talent trees that correspond to Tier 2 / 3 / 4
_TIER_TREE_MAP: dict[str, str] = {
    "Blueprint_T2_Crafting":    "T2",
    "Blueprint_T3_Machine":     "T3",
    "Blueprint_T4_Fabricator":  "T4",
    "Blueprint_T5_Manufacturer": "T5",
}

# Query tag IDs we care about (ingredient wildcards used in recipes)
_INGREDIENT_QUERY_IDS = {
    "Any_Raw_Meat", "Any_Spoiled_Item", "Any_Raw_Fish", "Any_Saltwater_Fish",
    "Any_Freshwater_Fish", "Any_Chicken_Vestige", "Any_Fruit", "Any_Vegetable",
    "Any_Herb", "Any_Grain", "Any_Speciality", "Any_Enzyme",
}

# Human-readable display names for query tags (game doesn't expose these)
_QUERY_DISPLAY_NAMES: dict[str, str] = {
    "Any_Raw_Meat":           "Raw Meat",
    "Any_Spoiled_Item":       "Spoiled",
    "Any_Raw_Fish":           "Raw Fish",
    "Any_Saltwater_Fish":     "Saltwater Fish",
    "Any_Freshwater_Fish":    "Freshwater Fish",
    "Any_Chicken_Vestige":    "Chicken Vestige",
    "Any_Fruit":              "Fruit",
    "Any_Vegetable":          "Vegetable",
    "Any_Herb":               "Herb",
    "Any_Grain":              "Grain",
    "Any_Speciality":         "Delicacy",
    "Any_Enzyme":             "Terraforming Enzyme",
}

# queryId used in recipe matching (may differ from the query row name)
_QUERY_ID_OVERRIDE: dict[str, str] = {
    "Any_Raw_Fish": "Any_Fish",
}

# Icon filenames for query tags (relative to ICONS_SRC_DIR/Items/Item_Icons/Query/)
_QUERY_ICON_FILENAME: dict[str, str] = {
    "Any_Raw_Meat":           "T_QUERY_Raw_Meat.png",
    "Any_Spoiled_Item":       "T_QUERY_Spoiled.png",
    "Any_Raw_Fish":           "T_QUERY_Fish_Raw.png",
    "Any_Saltwater_Fish":     "T_QUERY_Fish_Salt2.png",
    "Any_Freshwater_Fish":    "T_QUERY_Fish_Fresh2.png",
    "Any_Chicken_Vestige":    "T_QUERY_Vestige_Common.png",
    "Any_Fruit":              "T_QUERY_Crop_Fruit.png",
    "Any_Vegetable":          "T_QUERY_Crop_Vegetable.png",
    "Any_Herb":               "T_QUERY_Crop_Herb.png",
    "Any_Grain":              "T_QUERY_Crop_Grain.png",
    "Any_Speciality":         "T_QUERY_Crop_Speciality.png",
    "Any_Enzyme":             "T_QUERY_Enzyme.png",
}

# Category icon filenames (relative to ICONS_SRC_DIR/FieldGuide/CategoryIcons/)
_CATEGORY_ICONS: dict[str, str] = {
    "Tools":              "T_ICON_FieldGuide_ToolsMelee.png",
    "Ranged":             "T_ICON_FieldGuide_Ranged.png",
    "Ammo":               "T_ICON_FieldGuide_Ammo.png",
    "Equipment":          "T_ICON_FieldGuide_Equipments.png",
    "Benches":            "T_ICON_FieldGuide_Benches.png",
    "Armor":              "T_ICON_FieldGuide_Armor.png",
    "Suits & Modules":    "T_ICON_FieldGuide_SuitsModules.png",
    "Attachments":        "T_ICON_FieldGuide_Attachments.png",
    "Medicine":           "T_ICON_FieldGuide_Medicine.png",
    "Plants":             "T_ICON_FieldGuide_Plants.png",
    "Food":               "T_ICON_FieldGuide_Food.png",
    "Fish":               "T_ICON_FieldGuide_Filsh.png",
    "Ores":               "T_ICON_FieldGuide_Ore.png",
    "Resources":          "T_ICON_FieldGuide_Resources.png",
    "Carcasses":          "T_ICON_FieldGuide_Carcasses.png",
    "Trophies":           "T_ICON_FieldGuide_Trophies.png",
    "Decorations":        "T_ICON_FieldGuide_Decorations.png",
    "Shields":            "T_ICON_FieldGuide_Shield.png",
    "Defenses":           "T_ICON_FieldGuide_Defense.png",
    "Husbandry":          "T_ICON_FieldGuide_AnimalParts.png",
    "Buildings":          "T_ICON_FieldGuide_Buildings.png",
    "Resource Networks":  "T_ICON_FieldGuide_ResourceNetworks.png",
    "Vehicles":           "T_ICON_FieldGuide_Deployables.png",
    "Other":              "T_ICON_FieldGuide_Deployables.png",
}

# Stat trait tables: (rel_path, stat_key_or_special, label) triples
# special values: "ArmourStats" and "Stats" mean parse the sub-dict
_STAT_TABLE_DEFS: list[tuple[str, str, dict[str, str]]] = [
    (
        "Tools/D_ToolDamage.json",
        "direct",
        {
            "Melee_Damage":       "Melee Damage",
            "Felling_Damage":     "Felling Damage",
            "Felling_Efficiency": "Felling Efficiency",
            "Mining_Efficiency":  "Mining Efficiency",
        },
    ),
    (
        "Traits/D_Durable.json",
        "direct",
        {
            "Max_Durability": "Durability",
        },
    ),
    (
        "Traits/D_Armour.json",
        "ArmourStats",
        {
            "BasePhysicalDamageResistance_%":   "Damage Resistance %",
            "BaseUpgradeSlots_+":               "Upgrade Slots",
            "BaseOxygenSlots_+":                "Oxygen Slots",
            "BaseWaterSlots_+":                 "Water Slots",
            "BaseFoodSlots_+":                  "Food Slots",
        },
    ),
    (
        "Traits/D_Consumable.json",
        "Stats",
        {
            "BaseFoodRecovery_+":    "Food Recovery",
            "BaseHealthRecovery_+":  "Health Recovery",
            "BaseWaterRecovery_+":   "Water Recovery",
            "BaseOxygenRecovery_+":  "Oxygen Recovery",
            "BaseStaminaRecovery_+": "Stamina Recovery",
            "BaseUnitsConsumed_+":   "Units Consumed",
        },
    ),
    (
        "Traits/D_Ballistic.json",
        "direct",
        {
            "Damage":      "Projectile Damage",
            "BreakChance": "Break Chance",
        },
    ),
    (
        "Tools/D_FirearmData.json",
        "firearm",
        {
            "FireRate":      "Fire Rate (RPM)",
            "MagSize":       "Mag Size",
            "ReloadTime":    "Reload Time (s)",
        },
    ),
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_NSLOCTEXT_RE = re.compile(r'NSLOCTEXT\s*\(\s*"[^"]*"\s*,\s*"[^"]*"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)')
_INVTEXT_RE   = re.compile(r'INVTEXT\s*\(\s*"((?:[^"\\]|\\.)*)"\s*\)')


def parse_nsloctext(s: str | None) -> str:
    """Extract localised display text from NSLOCTEXT / INVTEXT wrapper."""
    if not s:
        return ""
    m = _NSLOCTEXT_RE.search(s)
    if m:
        return m.group(1).replace('\\"', '"').replace("\\\\", "\\")
    m = _INVTEXT_RE.search(s)
    if m:
        return m.group(1).replace('\\"', '"')
    return s  # bare string (some rows already have plain text)


def unreal_to_asset_path(u: str | None) -> str:
    """
    Convert a Unreal object reference to a web-relative asset path with .webp extension.
    /Game/Assets/2DArt/UI/Items/.../ITEM_Fibre.ITEM_Fibre → Assets/2DArt/UI/Items/.../ITEM_Fibre.webp
    Returns "" for None / "None".
    """
    if not u or u == "None":
        return ""
    # Strip /Game/ prefix
    u = u.lstrip("/")
    if u.startswith("Game/"):
        u = u[5:]
    # Strip engine object suffix: path/to/Asset.Asset → path/to/Asset
    # The suffix after the last dot duplicates the filename
    last_slash = u.rfind("/")
    last_dot   = u.rfind(".")
    if last_dot > last_slash:
        u = u[:last_dot]
    return u + ".webp"


def unreal_to_png_src(u: str | None) -> Path | None:
    """
    Map Unreal object reference to the source PNG on disk.
    /Game/Assets/2DArt/UI/Items/.../ITEM_Fibre.ITEM_Fibre → ICONS_SRC_DIR/Items/.../ITEM_Fibre.png
    """
    if not u or u == "None":
        return None
    u = u.lstrip("/")
    if u.startswith("Game/"):
        u = u[5:]
    # Drop the leading "Assets/2DArt/UI/" prefix and map to ICONS_SRC_DIR
    prefix = "Assets/2DArt/UI/"
    if u.startswith(prefix):
        rel = u[len(prefix):]
    else:
        rel = u
    # Strip object suffix
    last_slash = rel.rfind("/")
    last_dot   = rel.rfind(".")
    if last_dot > last_slash:
        rel = rel[:last_dot]
    return ICONS_SRC_DIR / (rel + ".png")


def icon_record(unreal_path: str | None, *, include_unreal: bool = True) -> dict[str, Any]:
    """Build an icon dict: {unreal?, assetPath, exists}."""
    ap = unreal_to_asset_path(unreal_path)
    src = unreal_to_png_src(unreal_path)
    exists = src is not None and src.is_file()
    rec: dict[str, Any] = {"assetPath": ap, "exists": exists}
    if include_unreal:
        rec = {"unreal": unreal_path or "", **rec}
    return rec


def load_table(rel_path: str) -> dict[str, dict[str, Any]]:
    """
    Load a Unreal DataTable JSON from DATA_DIR/rel_path.
    Returns {row_name: merged_row} — each row has Defaults applied for absent keys.
    """
    path = DATA_DIR / rel_path
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    defaults = data.get("Defaults", {})
    rows: dict[str, dict[str, Any]] = {}
    for row in data.get("Rows", []):
        name = row["Name"]
        merged = {**defaults, **row}
        rows[name] = merged
    return rows


def _parse_unreal_stat_dict(d: dict[str, Any], label_map: dict[str, str]) -> dict[str, Any]:
    """Parse ArmourStats / Consumable.Stats dicts whose keys look like (Value="BaseXxx")."""
    out: dict[str, Any] = {}
    for raw_key, value in d.items():
        # key: (Value="BasePhysicalDamageResistance_%")
        m = re.search(r'"([^"]+)"', raw_key)
        key = m.group(1) if m else raw_key
        label = label_map.get(key)
        if label and value:
            out[label] = value
    return out


# ---------------------------------------------------------------------------
# Stage 1: Load & index core tables
# ---------------------------------------------------------------------------

def load_item_static_rows() -> dict[str, dict[str, Any]]:
    return load_table("Items/D_ItemsStatic.json")


def load_item_template() -> dict[str, str]:
    """Returns {template_row_name → static_row_name}."""
    table = load_table("Items/D_ItemTemplate.json")
    return {
        name: row.get("ItemStaticData", {}).get("RowName", name)
        for name, row in table.items()
    }


def load_itemable_table() -> dict[str, dict[str, Any]]:
    return load_table("Traits/D_Itemable.json")


def load_stat_tables() -> dict[str, tuple[str, dict[str, Any]]]:
    """
    Returns {trait_name: (mode, {row_name: row})} where mode is one of
    "direct", "ArmourStats", "Stats", "firearm".
    """
    result: dict[str, tuple[str, dict[str, Any]]] = {}
    for rel_path, mode, _labels in _STAT_TABLE_DEFS:
        table_name = Path(rel_path).stem  # e.g. D_ToolDamage
        result[table_name] = (mode, load_table(rel_path))
    return result


def load_recipe_sets() -> dict[str, dict[str, Any]]:
    return load_table("Crafting/D_RecipeSets.json")


def load_processor_recipes() -> list[dict[str, Any]]:
    path = DATA_DIR / "Crafting/D_ProcessorRecipes.json"
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    defaults = data.get("Defaults", {})
    rows = []
    for row in data.get("Rows", []):
        rows.append({**defaults, **row})
    return rows


def load_workshop_table() -> dict[str, dict[str, Any]]:
    return load_table("MetaWorkshop/D_WorkshopItems.json")


def load_currency_table() -> dict[str, dict[str, Any]]:
    return load_table("Currency/D_MetaCurrency.json")


def load_tag_queries() -> dict[str, dict[str, Any]]:
    return load_table("Tags/D_TagQueries.json")


def load_talents() -> dict[str, dict[str, Any]]:
    return load_table("Talents/D_Talents.json")


# ---------------------------------------------------------------------------
# Category classification
# ---------------------------------------------------------------------------

def classify_category(item_id: str, icon_unreal: str) -> str:
    """Classify an item into one of the 24 companion site categories."""
    # Extract the folder segment after Item_Icons/
    m = re.search(r"Item_Icons/([^/]+)/", icon_unreal)
    folder = m.group(1) if m else ""

    if folder == "Fish":
        return "Fish"
    if folder == "Fishing":
        return "Attachments"
    if folder == "Carcasses":
        if "Trophy" in item_id:
            return "Trophies"
        if "Serum" in item_id:
            return "Husbandry"
        return "Carcasses"
    if folder == "Voxels":
        return "Ores"
    if folder == "Resources":
        return "Resources"
    if folder == "Projectiles":
        return "Ammo"
    if folder == "Modules":
        return "Suits & Modules"
    if folder == "Weapons":
        if "Shield" in item_id:
            return "Shields"
        return "Ranged"
    if folder == "Buildables":
        return "Buildings"
    if folder == "Armour":
        if "Module" in item_id or "Suit" in item_id:
            return "Suits & Modules"
        return "Armor"
    if folder == "Deployables":
        lid = item_id.lower()
        if any(k in lid for k in ("turret", "trap", "fence", "spike", "mine")):
            return "Defenses"
        if any(k in lid for k in ("bench", "furnace", "anvil", "fabricator", "machining",
                                   "mortar", "dissolver", "composter", "processor",
                                   "extractor", "cooking", "carpentry", "kiln", "press")):
            return "Benches"
        return "Decorations"
    if folder in ("Consumeables", "Consumables"):
        lid = item_id.lower()
        if "seed" in lid or "packet" in lid:
            return "Plants"
        if any(k in lid for k in ("medicine", "bandage", "vaccine", "antidote",
                                   "compress", "antibio", "painkill", "splint",
                                   "syringe", "antivenin")):
            return "Medicine"
        return "Food"
    if folder == "Attachments":
        lid = item_id.lower()
        if "husbandry" in lid or "saddle" in lid or "tame" in lid:
            return "Husbandry"
        return "Attachments"
    if folder == "LegendaryWeapons":
        return "Ranged"
    if folder == "Tools":
        return "Tools"
    if folder == "UseableItems":
        lid = item_id.lower()
        if "vehicle" in lid or "speeder" in lid:
            return "Vehicles"
        return "Equipment"
    if folder == "Vehicles":
        return "Vehicles"
    if folder == "Seeds":
        return "Plants"
    if folder == "ResourcePack":
        return "Resources"
    if folder == "Props":
        return "Decorations"
    if folder == "Bags":
        return "Equipment"
    if folder == "QuestItems":
        return "Resources"

    # Fallback
    return "Other"


# ---------------------------------------------------------------------------
# Stage 2: Build itemable lookup
# ---------------------------------------------------------------------------

def build_itemable_lookup(
    itemable_rows: dict[str, dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    """Returns {itemable_row_name: {displayName, icon_unreal, weight, maxStack, description, flavorText}}."""
    result: dict[str, dict[str, Any]] = {}
    for name, row in itemable_rows.items():
        result[name] = {
            "displayName":  parse_nsloctext(row.get("DisplayName", "")),
            "icon_unreal":  row.get("Icon", ""),
            "weight":       row.get("Weight") or None,
            "maxStack":     row.get("MaxStack") or None,
            "description":  parse_nsloctext(row.get("Description", "")) or None,
            "flavorText":   parse_nsloctext(row.get("FlavorText", "")) or None,
        }
    return result


# ---------------------------------------------------------------------------
# Stage 3: Gather stations
# ---------------------------------------------------------------------------

def gather_stations(recipe_sets: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    stations = []
    for name, row in recipe_sets.items():
        unreal = row.get("RecipeSetIcon", "")
        ap     = unreal_to_asset_path(unreal)
        src    = unreal_to_png_src(unreal)
        stations.append({
            "id":                  name,
            "name":                parse_nsloctext(row.get("RecipeSetName", "")) or name,
            "description":         parse_nsloctext(row.get("DisplayText", "")) or "",
            "icon": {
                "unreal":    unreal,
                "assetPath": ap,
                "exists":    src is not None and src.is_file(),
            },
            "experienceMultiplier": row.get("ExperienceMultiplier", 0.2),
        })
    return stations


# ---------------------------------------------------------------------------
# Stage 4: Gather recipes
# ---------------------------------------------------------------------------

def _resolve_output_item_id(output: dict[str, Any], item_template: dict[str, str]) -> str | None:
    """Resolve a recipe output element to a canonical itemId (D_ItemsStatic row name)."""
    elem      = output.get("Element", {})
    row_name  = elem.get("RowName", "None")
    table     = elem.get("DataTableName", "D_ItemTemplate")
    if row_name in ("None", ""):
        return None
    if table == "D_ItemsStatic":
        return row_name
    # D_ItemTemplate → look up static row name
    return item_template.get(row_name, row_name)


def gather_recipes(
    raw_recipes: list[dict[str, Any]],
    item_template: dict[str, str],
    tag_queries: dict[str, dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    """
    Returns {output_item_id: [recipe, ...]} where each recipe is:
    {
        recipeId, requiredMillijoules, stationIds,
        inputs: [{kind, itemId/queryId, itemName, count}],
        queryInputs: [...],
        resourceInputs: [...],
        outputs: [{itemId, itemName, count}],
    }
    """
    by_item: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for row in raw_recipes:
        if row.get("bForceDisableRecipe"):
            continue

        recipe_id = row["Name"]

        # Outputs
        outputs_raw = row.get("Outputs", [])
        if not outputs_raw:
            continue
        primary_out  = outputs_raw[0]
        out_id       = _resolve_output_item_id(primary_out, item_template)
        if not out_id:
            continue

        # Station IDs
        station_ids = [rs.get("RowName", "") for rs in row.get("RecipeSets", []) if rs.get("RowName")]

        # Regular item inputs
        inputs: list[dict[str, Any]] = []
        for inp in row.get("Inputs", []):
            elem     = inp.get("Element", {})
            row_name = elem.get("RowName", "None")
            if row_name in ("None", ""):
                continue
            table = elem.get("DataTableName", "D_ItemsStatic")
            if table == "D_ItemTemplate":
                resolved = item_template.get(row_name, row_name)
            else:
                resolved = row_name
            inputs.append({"kind": "item", "itemId": resolved, "count": inp.get("Count", 1)})

        # Query inputs (wildcard ingredient groups)
        query_inputs: list[dict[str, Any]] = []
        for qi in row.get("QueryInputs", []):
            qelem    = qi.get("QueryInput", {})
            q_name   = qelem.get("RowName", "None")
            if q_name in ("None", ""):
                continue
            query_inputs.append({
                "kind":    "query",
                "queryId": _QUERY_ID_OVERRIDE.get(q_name, q_name),
                "count":   qi.get("Count", 1),
            })

        # Resource inputs
        resource_inputs: list[dict[str, Any]] = []
        for ri in row.get("ResourceInputs", []):
            relem    = ri.get("ResourceInput", {})
            r_name   = relem.get("RowName", "None")
            if r_name in ("None", ""):
                continue
            resource_inputs.append({"kind": "resource", "resourceId": r_name, "count": ri.get("Count", 1)})

        # Build outputs list
        outputs: list[dict[str, Any]] = []
        for o in outputs_raw:
            oid = _resolve_output_item_id(o, item_template)
            if oid:
                outputs.append({"itemId": oid, "count": o.get("Count", 1)})

        recipe: dict[str, Any] = {
            "recipeId":            recipe_id,
            "requiredMillijoules": row.get("RequiredMillijoules", 2500),
            "stationIds":          station_ids,
            "inputs":              inputs,
            "queryInputs":         query_inputs,
            "resourceInputs":      resource_inputs,
            "outputs":             outputs,
        }
        by_item[out_id].append(recipe)

    return dict(by_item)


# ---------------------------------------------------------------------------
# Stage 5a: Natural (non-crafting) raw resource set
# ---------------------------------------------------------------------------

def build_raw_item_set(data_dir: Path) -> set[str]:
    """
    Build a set of item row names that can be obtained directly from the game
    world without crafting (mining, harvesting, creature drops, fishing, etc.).

    These items should be treated as terminal leaf nodes in workflow graphs even
    when a crafting recipe that produces them also exists (e.g. Wood via
    Frozen_Wood thaw should still be a raw material because trees give Wood).
    """
    def _load_rows(path: Path) -> dict[str, dict[str, Any]]:
        with path.open("r", encoding="utf-8") as fh:
            return {row["Name"]: row for row in json.load(fh).get("Rows", [])}

    def _reward_item_names(reward_rows: dict[str, dict[str, Any]], row_name: str) -> list[str]:
        if not row_name or row_name == "None":
            return []
        row = reward_rows.get(row_name)
        if not row:
            return []
        return [
            r["Item"]["RowName"]
            for r in row.get("Rewards", [])
            if r.get("Item", {}).get("RowName", "None") != "None"
        ]

    reward_rows = _load_rows(data_dir / "Items" / "D_ItemRewards.json")
    raw: set[str] = set()

    # 1) Mining voxels
    for row in json.load((data_dir / "World" / "D_VoxelSetupData.json").open(encoding="utf-8")).get("Rows", []):
        for field in ("ResourceType", "SecondaryResourceType", "PyriticCrustResourceType"):
            name = row.get(field, {}).get("RowName", "None")
            if name and name != "None":
                raw.add(name)

    # 2) Breakable rocks / deposits
    for row in json.load((data_dir / "World" / "D_BreakableRockData.json").open(encoding="utf-8")).get("Rows", []):
        raw.update(_reward_item_names(reward_rows, row.get("ItemReward", {}).get("RowName", "None")))
        pc = row.get("PyriticCrustItemType", {}).get("RowName", "None")
        if pc and pc != "None":
            raw.add(pc)

    # 2b) Drillable ore deposits / special deposits (e.g. Frozen_Wood)
    for row in json.load((data_dir / "World" / "D_OreDeposit.json").open(encoding="utf-8")).get("Rows", []):
        name = row.get("ResourceType", {}).get("RowName", "None")
        if name and name != "None":
            raw.add(name)

    # 3) Foliage / harvestables (FLOD)
    for row in json.load((data_dir / "FLOD" / "D_FLODDescriptions.json").open(encoding="utf-8")).get("Rows", []):
        raw.update(_reward_item_names(reward_rows, row.get("ViewTraceActorItemRewards", {}).get("RowName", "None")))
        direct = row.get("ViewTraceActorItemTemplate", {}).get("RowName", "None")
        if direct and direct != "None":
            raw.add(direct)

    # 4) Farming crop harvest
    for row in json.load((data_dir / "Farming" / "D_FarmingSeeds.json").open(encoding="utf-8")).get("Rows", []):
        raw.update(_reward_item_names(reward_rows, row.get("CropRewards", {}).get("RowName", "None")))

    # 5) Fish pickup
    for row in json.load((data_dir / "World" / "D_FishSetup.json").open(encoding="utf-8")).get("Rows", []):
        raw.update(_reward_item_names(reward_rows, row.get("ItemReward", {}).get("RowName", "None")))

    # 6) Creature loot / skinning / trophies
    for row in json.load((data_dir / "AI" / "D_AISetup.json").open(encoding="utf-8")).get("Rows", []):
        for field in ("Loot", "Trophy", "Hitable"):
            raw.update(_reward_item_names(reward_rows, row.get(field, {}).get("RowName", "None")))

    # 7) Generic tree reward rows (hardcoded — game blueprint links not in exported data)
    for tree_row in (
        "Generic_Tree_Root", "Generic_Tree_Trunk", "Generic_Tree_Trunk_Dense",
        "Generic_Tree_Stick", "Generic_Tree_Burnt", "TreePrimitive",
    ):
        raw.update(_reward_item_names(reward_rows, tree_row))

    raw.discard("None")
    return raw


# ---------------------------------------------------------------------------
# Stage 5b: Workflow graph builder
# ---------------------------------------------------------------------------

def build_workflow_graph(
    root_item_id: str,
    recipe: dict[str, Any],
    all_recipes: dict[str, list[dict[str, Any]]],
    output_count: int = 1,
    raw_item_set: set[str] | None = None,
) -> dict[str, Any]:
    """
    Build a DAG showing the full crafting dependency tree for one recipe.
    Returns {rawMaterials, nodes, edges}.
    """
    # BFS: (item_id, count_needed, parent_item_id, recipe_id_that_produces_item)
    #
    # We track fractional counts scaled to 1 unit of top-level output.
    nodes:    set[str]            = {root_item_id}
    edges:    list[dict[str, Any]] = []
    raw_mats: dict[str, float]    = {}
    visited:  set[str]            = {root_item_id}

    # Queue items: (item_id, count_per_1_of_root, parent_id, recipe_id_producing_item)
    queue: deque[tuple[str, float, str, str | None]] = deque()

    def enqueue_recipe_inputs(
        item_id: str,
        rec: dict[str, Any],
        scale: float,
        parent: str,
    ) -> None:
        produced_count = max(rec["outputs"][0]["count"] if rec["outputs"] else 1, 1)
        for inp in rec["inputs"]:
            child_id    = inp["itemId"]
            child_count = inp["count"] * scale / produced_count
            queue.append((child_id, child_count, item_id, rec["recipeId"]))
        for qi in rec["queryInputs"]:
            # Treat query inputs as raw — we can't resolve them further
            q_label = f"QUERY:{qi['queryId']}"
            raw_mats[q_label] = raw_mats.get(q_label, 0) + qi["count"] * scale / produced_count
        for ri in rec["resourceInputs"]:
            r_label = f"RESOURCE:{ri['resourceId']}"
            raw_mats[r_label] = raw_mats.get(r_label, 0) + ri["count"] * scale / produced_count

    enqueue_recipe_inputs(root_item_id, recipe, output_count, root_item_id)

    while queue:
        item_id, count_needed, parent_id, producing_recipe_id = queue.popleft()

        nodes.add(item_id)

        # Add edge: item_id is consumed by parent_id via producing_recipe_id
        edges.append({
            "from":     item_id,
            "to":       parent_id,
            "count":    round(count_needed, 6),
            "recipeId": producing_recipe_id,
        })

        if item_id in visited:
            # Already expanded this item — avoid cycles
            continue
        visited.add(item_id)

        child_recipes = all_recipes.get(item_id, [])
        is_natural_raw = raw_item_set is not None and item_id in raw_item_set
        if not child_recipes or is_natural_raw:
            # Leaf / raw material — either has no recipe or is directly
            # obtainable from the world (mining, harvesting, creature drops…)
            raw_mats[item_id] = raw_mats.get(item_id, 0) + count_needed
        else:
            # Use first recipe
            child_rec = child_recipes[0]
            enqueue_recipe_inputs(item_id, child_rec, count_needed, item_id)

    # Round raw material counts
    raw_materials = [
        {"itemId": k, "count": round(v, 4)}
        for k, v in sorted(raw_mats.items())
        if v > 0
    ]

    return {
        "rawMaterials": raw_materials,
        "nodes": sorted(nodes),
        "edges": edges,
    }


# ---------------------------------------------------------------------------
# Stage 6: Item stats gathering
# ---------------------------------------------------------------------------

def gather_item_stats(
    static_row: dict[str, Any],
    stat_tables: dict[str, tuple[str, dict[str, Any]]],
) -> dict[str, Any] | None:
    """Extract display-ready stats for one item using its trait pointer fields."""
    stats: dict[str, Any] = {}

    # ToolDamage
    td_ref = static_row.get("ToolDamage", {}).get("RowName", "None")
    if td_ref and td_ref != "None":
        mode, table = stat_tables.get("D_ToolDamage", ("direct", {}))
        row = table.get(td_ref, {})
        _, _, labels = _STAT_TABLE_DEFS[0]
        for k, label in labels.items():
            v = row.get(k)
            if v:
                stats[label] = v

    # Durable
    dur_ref = static_row.get("Durable", {}).get("RowName", "None")
    if dur_ref and dur_ref != "None":
        mode, table = stat_tables.get("D_Durable", ("direct", {}))
        row = table.get(dur_ref, {})
        _, _, labels = _STAT_TABLE_DEFS[1]
        for k, label in labels.items():
            v = row.get(k)
            if v:
                stats[label] = v

    # Armour (ArmourStats sub-dict)
    arm_ref = static_row.get("Armour", {}).get("RowName", "None")
    if arm_ref and arm_ref != "None":
        mode, table = stat_tables.get("D_Armour", ("ArmourStats", {}))
        row = table.get(arm_ref, {})
        _, _, labels = _STAT_TABLE_DEFS[2]
        sub = row.get("ArmourStats", {})
        stats.update(_parse_unreal_stat_dict(sub, labels))

    # Consumable (Stats sub-dict)
    con_ref = static_row.get("Consumable", {}).get("RowName", "None")
    if con_ref and con_ref != "None":
        mode, table = stat_tables.get("D_Consumable", ("Stats", {}))
        row = table.get(con_ref, {})
        _, _, labels = _STAT_TABLE_DEFS[3]
        sub = row.get("Stats", {})
        stats.update(_parse_unreal_stat_dict(sub, labels))

    # Ballistic
    bal_ref = static_row.get("Ballistic", {}).get("RowName", "None")
    if bal_ref and bal_ref != "None":
        mode, table = stat_tables.get("D_Ballistic", ("direct", {}))
        row = table.get(bal_ref, {})
        _, _, labels = _STAT_TABLE_DEFS[4]
        for k, label in labels.items():
            v = row.get(k)
            if v:
                stats[label] = v

    # FirearmData
    fa_ref = static_row.get("FirearmData", {}).get("RowName", "None")
    if fa_ref and fa_ref != "None":
        mode, table = stat_tables.get("D_FirearmData", ("firearm", {}))
        row = table.get(fa_ref, {})
        fr = row.get("FireRate")
        ms = row.get("MagSize")
        rt = row.get("ReloadTime")
        if fr: stats["Fire Rate (RPM)"] = fr
        if ms: stats["Mag Size"] = ms
        if rt: stats["Reload Time (s)"] = rt

    return stats if stats else None


# ---------------------------------------------------------------------------
# Stage 7: Workshop data
# ---------------------------------------------------------------------------

def gather_workshop_data(
    workshop_rows: dict[str, dict[str, Any]],
    currency_rows: dict[str, dict[str, Any]],
    item_template: dict[str, str],
    itemable_lookup: dict[str, dict[str, Any]],
    static_rows: dict[str, dict[str, Any]],
) -> tuple[dict[str, Any], set[str]]:
    """
    Returns (workshop_items_payload, workshop_item_id_set).
    workshop_items_payload = {currencies: {...}, items: [...]}
    """
    # Build currencies map
    currencies: dict[str, dict[str, Any]] = {}
    for cur_id, row in currency_rows.items():
        icon_u = row.get("Icon", "")
        ap     = unreal_to_asset_path(icon_u)
        color_obj = row.get("Color", {})
        r = color_obj.get("R", 0)
        g = color_obj.get("G", 0)
        b = color_obj.get("B", 0)
        raw_name = parse_nsloctext(row.get("DisplayName", "")) or cur_id
        colored_ap = ap.replace(".webp", "_tinted.webp") if ap else ""
        currencies[cur_id] = {
            "displayName":    re.sub(r"^\[DNT\]\s*", "", raw_name),
            "iconPath":       ap,
            "coloredIconPath": colored_ap,
            "color":          f"#{r:02x}{g:02x}{b:02x}",
        }

    # Build items list
    items: list[dict[str, Any]] = []
    workshop_ids: set[str] = set()

    def _resolve_costs(cost_list: list[dict[str, Any]]) -> list[dict[str, Any]]:
        out = []
        for entry in cost_list:
            meta = entry.get("Meta", {})
            cur_id = meta.get("RowName", "None")
            if cur_id and cur_id != "None":
                out.append({"currencyId": cur_id, "amount": entry.get("Amount", 0)})
        return out

    for ws_id, row in workshop_rows.items():
        item_elem    = row.get("Item", {})
        template_key = str(item_elem.get("RowName") or "None")
        if template_key in ("None", ""):
            continue
        static_key = str(item_template.get(template_key, template_key) or template_key)
        static_row = static_rows.get(static_key, {})

        # Resolve display info from itemable trait
        itemable_key = static_row.get("Itemable", {}).get("RowName", "None")
        info = itemable_lookup.get(itemable_key, {})
        display_name = info.get("displayName", "") or static_key
        icon_u       = info.get("icon_unreal", "")
        ap           = unreal_to_asset_path(icon_u)
        src          = unreal_to_png_src(icon_u)
        exists       = src is not None and src.is_file()
        category     = classify_category(static_key, icon_u)

        feat_level = (
            static_row.get("Metadata", {}).get("RequiredFeatureLevel", {}).get("RowName", "")
            or ""
        )

        items.append({
            "workshopId":           ws_id,
            "itemId":               static_key,
            "displayName":          display_name,
            "setId":                ws_id,
            "icon":                 {"assetPath": ap, "exists": exists},
            "category":             category,
            "requiredFeatureLevel": feat_level,
            "researchCost":         _resolve_costs(row.get("ResearchCost", [])),
            "replicationCost":      _resolve_costs(row.get("ReplicationCost", [])),
        })
        workshop_ids.add(static_key)

    return {"currencies": currencies, "items": items}, workshop_ids


# ---------------------------------------------------------------------------
# Stage 8: Query tags
# ---------------------------------------------------------------------------

def build_query_tags(tag_query_rows: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    result = []
    for qid in _INGREDIENT_QUERY_IDS:
        row = tag_query_rows.get(qid, {})
        tag_dict  = row.get("Query", {}).get("TagDictionary", [])
        tags      = [t["TagName"] for t in tag_dict if t.get("TagName")]
        icon_file = _QUERY_ICON_FILENAME.get(qid, "")
        icon_src  = ICONS_SRC_DIR / "Items" / "Item_Icons" / "Query" / icon_file if icon_file else None
        ap        = (
            f"Assets/2DArt/UI/Items/Item_Icons/Query/{icon_file.replace('.png', '.webp')}"
            if icon_file else ""
        )
        result.append({
            "id":          qid,
            "displayName": _QUERY_DISPLAY_NAMES.get(qid, qid),
            "queryId":     _QUERY_ID_OVERRIDE.get(qid, qid),
            "queryTags":   tags,
            "icon": {
                "unreal":    "",
                "assetPath": ap,
                "exists":    icon_src is not None and icon_src.is_file(),
            },
        })
    return result


# ---------------------------------------------------------------------------
# Stage 9: Tier sections
# ---------------------------------------------------------------------------

def build_tier_sections(
    talent_rows: dict[str, dict[str, Any]],
    itemable_lookup: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    # Group by tier
    tiers: dict[str, list[dict[str, Any]]] = {"T2": [], "T3": [], "T4": [], "T5": []}

    for name, row in talent_rows.items():
        tree_ref = row.get("TalentTree", {}).get("RowName", "None")
        tier_id  = _TIER_TREE_MAP.get(tree_ref)
        if not tier_id:
            continue

        # Icon — prefer talent icon, fall back to ExtraData itemable icon
        icon_u = row.get("Icon", "") or ""
        if not icon_u or icon_u == "None":
            extra_ref = row.get("ExtraData", {}).get("RowName", "None")
            if extra_ref and extra_ref != "None":
                info   = itemable_lookup.get(extra_ref, {})
                icon_u = info.get("icon_unreal", "") or ""

        # Display name — from talent, or from itemable
        display_name = parse_nsloctext(row.get("DisplayName", ""))
        if not display_name:
            extra_ref = row.get("ExtraData", {}).get("RowName", "None")
            if extra_ref and extra_ref != "None":
                info         = itemable_lookup.get(extra_ref, {})
                display_name = info.get("displayName", "") or name

        itemable_ref = row.get("ExtraData", {}).get("RowName", "None")
        if itemable_ref == "None":
            itemable_ref = ""

        pos = row.get("Position", {"X": 0, "Y": 0})

        tiers[tier_id].append({
            "id":            name,
            "name":          display_name or name,
            "iconUnreal":    icon_u if icon_u != "None" else "",
            "iconAssetPath": unreal_to_asset_path(icon_u),
            "itemableRef":   itemable_ref,
            "requiredLevel": row.get("RequiredLevel", 0),
            "_sort":         (pos.get("Y", 0), pos.get("X", 0)),
        })

    result = []
    for tier_id, entries in tiers.items():
        entries.sort(key=lambda e: e["_sort"])
        clean = [{k: v for k, v in e.items() if k != "_sort"} for e in entries]
        result.append({
            "id":          tier_id,
            "name":        f"Tier {tier_id[1]}",
            "entryCount":  len(clean),
            "entries":     clean,
        })

    return result


# ---------------------------------------------------------------------------
# Stage 9b: Build tier progression
# ---------------------------------------------------------------------------

def build_tier_progression(
    chunks: dict[str, dict[str, Any]],
    stations: list[dict[str, Any]],
    raw_item_set: set[str] | None = None,
) -> list[dict[str, Any]]:
    """Build data-driven tier-progression steps from _TIER_GATEWAYS."""
    # Flatten all letter-chunks into a single item lookup
    all_items: dict[str, Any] = {}
    for chunk in chunks.values():
        all_items.update(chunk)

    station_map: dict[str, dict[str, Any]] = {s["id"]: s for s in stations}

    result: list[dict[str, Any]] = []
    for tier_id, (gateway_item_id, from_tier, to_tier) in _TIER_GATEWAYS.items():
        gateway_detail = all_items.get(gateway_item_id)
        if not gateway_detail or not gateway_detail.get("recipes"):
            continue

        gateway_recipe = gateway_detail["recipes"][0]
        raw_station_ids: list[str] = gateway_recipe.get("stationIds", [])
        gateway_station_id: str | None = (
            None
            if not raw_station_ids or raw_station_ids[0] == "Character"
            else raw_station_ids[0]
        )

        ingredients: list[dict[str, Any]] = []
        prereq_station_ids: list[str] = []

        for inp in gateway_recipe.get("inputs", []):
            if inp.get("kind") != "item":
                continue
            ing_id = inp["itemId"]
            ing_detail = all_items.get(ing_id)
            ing_name = (ing_detail or {}).get("displayName") or ing_id
            ing_station_id: str | None = None
            is_raw_ingredient = raw_item_set is not None and ing_id in raw_item_set
            if ing_detail and ing_detail.get("recipes") and not is_raw_ingredient:
                ing_sids: list[str] = ing_detail["recipes"][0].get("stationIds", [])
                if ing_sids and ing_sids[0] != "Character":
                    ing_station_id = ing_sids[0]
                    if ing_station_id not in prereq_station_ids:
                        prereq_station_ids.append(ing_station_id)
            ingredients.append({
                "itemId":      ing_id,
                "displayName": ing_name,
                "count":       inp["count"],
                "stationId":   ing_station_id,
            })

        prerequisites: list[dict[str, Any]] = []
        for sid in prereq_station_ids:
            st = station_map.get(sid)
            if st:
                prerequisites.append({
                    "stationId":    sid,
                    "displayName":  st["name"],
                    "iconAssetPath": st["icon"]["assetPath"],
                })

        result.append({
            "tierId":   tier_id,
            "fromTier": from_tier,
            "toTier":   to_tier,
            "gateway": {
                "itemId":      gateway_item_id,
                "displayName": gateway_detail["displayName"],
                "stationId":   gateway_station_id,
            },
            "ingredients":   ingredients,
            "prerequisites": prerequisites,
        })

    return result


# ---------------------------------------------------------------------------
# Stage 10: Build outputs
# ---------------------------------------------------------------------------

def build_item_lookup(
    static_rows: dict[str, dict[str, Any]],
    itemable_lookup: dict[str, dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    """All items (not just craftable) for ingredient icon resolution."""
    result: dict[str, dict[str, Any]] = {}
    for item_id, row in static_rows.items():
        itemable_key = row.get("Itemable", {}).get("RowName", "None")
        if itemable_key in ("None", ""):
            continue
        info   = itemable_lookup.get(itemable_key, {})
        icon_u = info.get("icon_unreal", "")
        ap     = unreal_to_asset_path(icon_u)
        src    = unreal_to_png_src(icon_u)
        result[item_id] = {
            "id":          item_id,
            "displayName": info.get("displayName", "") or item_id,
            "icon": {
                "unreal":    icon_u,
                "assetPath": ap,
                "exists":    src is not None and src.is_file(),
            },
        }
    return result


def _get_manual_tags(static_row: dict[str, Any]) -> list[str]:
    return [
        t["TagName"]
        for t in static_row.get("Manual_Tags", {}).get("GameplayTags", [])
        if t.get("TagName")
    ]


def _get_generated_tags(static_row: dict[str, Any]) -> list[str]:
    return [
        t["TagName"]
        for t in static_row.get("Generated_Tags", {}).get("GameplayTags", [])
        if t.get("TagName")
    ]


def _detect_cosmetic_pack(manual_tags: list[str], item_id: str, workshop_ids: set[str]) -> str:
    for tag in manual_tags:
        pack = _TAG_TO_COSMETIC_PACK.get(tag)
        if pack:
            return pack
    if item_id in workshop_ids:
        return "Workshop"
    return ""


def build_item_index(
    static_rows: dict[str, dict[str, Any]],
    itemable_lookup: dict[str, dict[str, Any]],
    recipes: dict[str, list[dict[str, Any]]],
    workshop_ids: set[str],
) -> list[dict[str, Any]]:
    """Lightweight list of craftable items for the browse index."""
    result = []
    for item_id, row in static_rows.items():
        item_recipes = recipes.get(item_id, [])
        is_workshop  = item_id in workshop_ids
        if not item_recipes and not is_workshop:
            continue

        itemable_key = row.get("Itemable", {}).get("RowName", "None")
        if itemable_key in ("None", ""):
            continue
        info         = itemable_lookup.get(itemable_key, {})
        icon_u       = info.get("icon_unreal", "")
        ap           = unreal_to_asset_path(icon_u)
        src          = unreal_to_png_src(icon_u)
        category     = classify_category(item_id, icon_u)
        manual_tags  = _get_manual_tags(row)
        feat_level   = (
            row.get("Metadata", {}).get("RequiredFeatureLevel", {}).get("RowName", "") or ""
        )
        cosmetic_pack = _detect_cosmetic_pack(manual_tags, item_id, workshop_ids)

        # Deduplicated station IDs across all recipes
        station_ids: list[str] = []
        seen_stations: set[str] = set()
        for rec in item_recipes:
            for sid in rec.get("stationIds", []):
                if sid not in seen_stations:
                    seen_stations.add(sid)
                    station_ids.append(sid)

        result.append({
            "itemId":               item_id,
            "displayName":          info.get("displayName", "") or item_id,
            "category":             category,
            "icon":                 {"assetPath": ap, "exists": src is not None and src.is_file()},
            "recipeCount":          len(item_recipes),
            "stationIds":           station_ids,
            "requiredFeatureLevel": feat_level,
            "cosmeticPack":         cosmetic_pack,
        })

    return result


def build_categories(item_index: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Derive 24 category entries from the item index."""
    counts: dict[str, int] = defaultdict(int)
    for entry in item_index:
        counts[entry["category"]] += 1

    result = []
    for cat_id, icon_file in _CATEGORY_ICONS.items():
        if counts.get(cat_id, 0) == 0:
            continue
        src = ICONS_SRC_DIR / "FieldGuide" / "CategoryIcons" / icon_file
        ap  = f"Assets/2DArt/UI/FieldGuide/CategoryIcons/{icon_file.replace('.png', '.webp')}"
        result.append({
            "id":                cat_id,
            "displayName":       cat_id,
            "itemCount":         counts[cat_id],
            "representativeIcon": {
                "assetPath": ap,
                "exists":    src.is_file(),
            },
        })

    return result


def build_item_chunks(
    static_rows: dict[str, dict[str, Any]],
    itemable_lookup: dict[str, dict[str, Any]],
    recipes: dict[str, list[dict[str, Any]]],
    stat_tables: dict[str, tuple[str, dict[str, Any]]],
    workshop_costs_by_item: dict[str, dict[str, Any] | None],
    workshop_ids: set[str],
    raw_item_set: set[str] | None = None,
) -> dict[str, dict[str, Any]]:
    """
    Returns {letter: {item_id: IcarusItemDetail}} for writing as items/{letter}.json.
    """
    chunks: dict[str, dict[str, Any]] = defaultdict(dict)

    for item_id, row in static_rows.items():
        itemable_key = row.get("Itemable", {}).get("RowName", "None")
        if itemable_key in ("None", ""):
            continue
        info = itemable_lookup.get(itemable_key, {})

        icon_u   = info.get("icon_unreal", "")
        ap       = unreal_to_asset_path(icon_u)
        src      = unreal_to_png_src(icon_u)
        category = classify_category(item_id, icon_u)

        # Build recipe list with workflow graphs
        item_recipes = recipes.get(item_id, [])
        built_recipes: list[dict[str, Any]] = []
        for rec in item_recipes:
            wf = build_workflow_graph(item_id, rec, recipes, rec["outputs"][0]["count"] if rec["outputs"] else 1, raw_item_set)
            built_rec = dict(rec)
            built_rec["workflow"] = wf
            built_recipes.append(built_rec)

        # Stats
        item_stats = gather_item_stats(row, stat_tables)

        # Tags
        generated_tags = _get_generated_tags(row)
        manual_tags    = _get_manual_tags(row)
        feat_level     = (
            row.get("Metadata", {}).get("RequiredFeatureLevel", {}).get("RowName", "") or ""
        )
        cosmetic_pack  = _detect_cosmetic_pack(manual_tags, item_id, workshop_ids)

        # Workshop costs
        ws_costs = workshop_costs_by_item.get(item_id)

        detail: dict[str, Any] = {
            "itemId":               item_id,
            "displayName":          info.get("displayName", "") or item_id,
            "category":             category,
            "icon":                 {"assetPath": ap, "exists": src is not None and src.is_file()},
            "recipes":              built_recipes,
            "requiredFeatureLevel": feat_level,
            "cosmeticPack":         cosmetic_pack,
            "description":          info.get("description"),
            "flavorText":           info.get("flavorText"),
            "weight":               info.get("weight"),
            "maxStack":             info.get("maxStack"),
            "stats":                item_stats,
            "tags":                 generated_tags,
            "workshopCosts":        ws_costs,
        }

        first = item_id[0].lower() if item_id else "0"
        bucket = first if re.match(r"[a-z]", first) else "0"
        chunks[bucket][item_id] = detail

    return dict(chunks)


# ---------------------------------------------------------------------------
# Stage 11: Asset mirroring
# ---------------------------------------------------------------------------

def mirror_colored_currency_icons(currencies: dict[str, dict[str, Any]]) -> None:
    """
    For each currency with a color and an iconPath, produce a pre-tinted WebP
    saved at coloredIconPath.  The source PNG white icon is multiplied by the
    currency color so the icon inherits that hue without any runtime CSS magic.
    """
    from PIL import Image  # type: ignore

    for cur in currencies.values():
        tinted_path = cur.get("coloredIconPath", "")
        color_hex   = cur.get("color", "")
        src_path    = cur.get("iconPath", "")
        if not tinted_path or not src_path or not color_hex or len(color_hex) < 7:
            continue

        dest = ASSETS_DEST_DIR / tinted_path
        src  = unreal_to_png_src(f"/Game/{src_path.replace('.webp', '.png')}")
        if src is None or not src.is_file():
            continue

        # Regenerate if source is newer than the tinted output
        if dest.is_file() and dest.stat().st_mtime >= src.stat().st_mtime:
            continue

        tr = int(color_hex[1:3], 16)
        tg = int(color_hex[3:5], 16)
        tb = int(color_hex[5:7], 16)
        dest.parent.mkdir(parents=True, exist_ok=True)
        try:
            with Image.open(src) as img:
                img = img.convert("RGBA")
                r_c, g_c, b_c, a_c = img.split()
                r_out = r_c.point(lambda x, c=tr: x * c // 255)
                g_out = g_c.point(lambda x, c=tg: x * c // 255)
                b_out = b_c.point(lambda x, c=tb: x * c // 255)
                tinted = Image.merge("RGBA", (r_out, g_out, b_out, a_c))
                tinted.save(dest, "WEBP", quality=90, method=4)
        except Exception as exc:
            print(f"  WARNING: failed to tint {src}: {exc}", file=sys.stderr)


def mirror_assets(all_asset_paths: set[str]) -> dict[str, Any]:
    """
    Convert source PNGs to WebP and write to ASSETS_DEST_DIR.
    Uses SHA-256 hash-based change detection.
    Returns the report dict.
    """
    from PIL import Image  # type: ignore

    report_path = OUT_DIR / "asset-mirror-report.json"
    prev_hashes: dict[str, str] = {}
    if report_path.is_file():
        with report_path.open(encoding="utf-8") as f:
            prev = json.load(f)
        for entry in prev.get("copied", []):
            prev_hashes[entry["path"]] = entry.get("srcHash", "")

    copied:  list[dict[str, str]] = []
    skipped: list[str] = []
    missing: list[str] = []

    for ap in sorted(all_asset_paths):
        if not ap:
            continue
        dest = ASSETS_DEST_DIR / ap
        src  = unreal_to_png_src(f"/Game/{ap.replace('.webp', '.png')}")
        if src is None:
            missing.append(ap)
            continue

        # Compute hash of source file
        if not src.is_file():
            missing.append(ap)
            continue

        src_bytes = src.read_bytes()
        src_hash  = hashlib.sha256(src_bytes).hexdigest()

        if prev_hashes.get(ap) == src_hash and dest.is_file():
            skipped.append(ap)
            continue

        dest.parent.mkdir(parents=True, exist_ok=True)

        # Remove legacy .png if present
        legacy_png = dest.with_suffix(".png")
        if legacy_png.is_file():
            legacy_png.unlink()

        try:
            with Image.open(src) as img:
                img.save(dest, "WEBP", quality=80, method=4)
            copied.append({"path": ap, "srcHash": src_hash})
        except Exception as exc:
            print(f"  WARNING: failed to convert {src}: {exc}", file=sys.stderr)
            missing.append(ap)

    report = {
        "copiedCount":  len(copied),
        "skippedCount": len(skipped),
        "missingCount": len(missing),
        "copied":       copied,
        "skipped":      skipped,
        "missing":      missing,
    }
    with (OUT_DIR / "asset-mirror-report.json").open("w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    return report


# ---------------------------------------------------------------------------
# Main orchestration
# ---------------------------------------------------------------------------

def stage() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ASSETS_DEST_DIR.mkdir(parents=True, exist_ok=True)

    print("Loading data tables...")
    static_rows    = load_item_static_rows()
    item_template  = load_item_template()
    itemable_rows  = load_itemable_table()
    recipe_sets    = load_recipe_sets()
    raw_recipes    = load_processor_recipes()
    workshop_rows  = load_workshop_table()
    currency_rows  = load_currency_table()
    tag_query_rows = load_tag_queries()
    talent_rows    = load_talents()
    stat_tables    = load_stat_tables()

    print("Building itemable lookup...")
    itemable_lookup = build_itemable_lookup(itemable_rows)

    print("Gathering stations...")
    stations = gather_stations(recipe_sets)

    print("Gathering recipes...")
    recipes = gather_recipes(raw_recipes, item_template, tag_query_rows)

    print("Gathering workshop data...")
    workshop_payload, workshop_ids = gather_workshop_data(
        workshop_rows, currency_rows, item_template, itemable_lookup, static_rows
    )

    # Build per-item workshop costs lookup for embedding into item chunks
    workshop_costs_by_item: dict[str, dict[str, Any] | None] = {}
    ws_items_by_item_id: dict[str, dict[str, Any]] = {
        it["itemId"]: it for it in workshop_payload["items"]
    }
    for iid in static_rows:
        ws = ws_items_by_item_id.get(iid)
        if ws:
            costs: dict[str, Any] = {}
            if ws["researchCost"]:
                costs["researchCost"] = ws["researchCost"]
            if ws["replicationCost"]:
                costs["replicationCost"] = ws["replicationCost"]
            workshop_costs_by_item[iid] = costs if costs else None
        else:
            workshop_costs_by_item[iid] = None

    print("Building item lookup...")
    item_lookup = build_item_lookup(static_rows, itemable_lookup)

    print("Building item index...")
    item_index = build_item_index(static_rows, itemable_lookup, recipes, workshop_ids)
    item_index.sort(key=lambda e: e["displayName"].lower())

    print("Building categories...")
    categories = build_categories(item_index)

    print("Building tier sections...")
    tier_sections = build_tier_sections(talent_rows, itemable_lookup)

    print("Building query tags...")
    query_tags = build_query_tags(tag_query_rows)

    print("Building raw item set...")
    raw_item_set = build_raw_item_set(DATA_DIR)
    print(f"  {len(raw_item_set)} naturally-obtainable items identified.")

    print("Building item chunks...")
    chunks = build_item_chunks(
        static_rows, itemable_lookup, recipes, stat_tables,
        workshop_costs_by_item, workshop_ids, raw_item_set
    )

    print("Building tier progression...")
    tier_progression = build_tier_progression(chunks, stations, raw_item_set)

    # Collect all asset paths for mirroring
    all_asset_paths: set[str] = set()

    def _collect(obj: Any) -> None:
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k == "assetPath" and isinstance(v, str) and v.endswith(".webp"):
                    all_asset_paths.add(v)
                else:
                    _collect(v)
        elif isinstance(obj, list):
            for item in obj:
                _collect(item)

    _collect(stations)
    _collect(workshop_payload)
    # Currency icon paths use "iconPath" not "assetPath" — collect explicitly
    for cur in workshop_payload.get("currencies", {}).values():
        ip = cur.get("iconPath", "")
        if ip and ip.endswith(".webp"):
            all_asset_paths.add(ip)
    _collect(item_lookup)
    _collect(item_index)
    _collect(categories)
    _collect(tier_sections)
    _collect(query_tags)
    for chunk in chunks.values():
        _collect(chunk)

    # Always mirror feature-level badge icons even if not referenced by an item
    _PINNED_WEBP_PATHS = [
        "Assets/2DArt/UI/Icons/T_FeatureLevelIcon_NewFrontiers3.webp",
        "Assets/2DArt/UI/Icons/FeatureLevel/T_FeatureLevel_GH.webp",
        "Assets/2DArt/UI/Icons/FeatureLevel/T_FeatureLevel_DH.webp",
    ]
    all_asset_paths.update(_PINNED_WEBP_PATHS)

    # Write outputs
    print("Writing JSON outputs...")

    def _write(filename: str, data: Any) -> None:
        with (OUT_DIR / filename).open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    _write("stations.json",       stations)
    _write("workshop-items.json", workshop_payload)
    _write("item-lookup.json",    item_lookup)
    _write("item-index.json",     item_index)
    _write("categories.json",     categories)
    _write("tier-sections.json",    tier_sections)
    _write("tier-progression.json", tier_progression)
    _write("query-tags.json",       query_tags)
    _write("raw-resources.json",    sorted(raw_item_set))

    items_dir = OUT_DIR / "items"
    items_dir.mkdir(exist_ok=True)
    for letter, chunk in sorted(chunks.items()):
        with (items_dir / f"{letter}.json").open("w", encoding="utf-8") as f:
            json.dump(chunk, f, ensure_ascii=False, separators=(",", ":"))

    # Meta
    craftable_count = sum(1 for e in item_index if e["recipeCount"] > 0)
    _write("meta.json", {
        "version":          VERSION,
        "generatedAtUtc":   datetime.now(timezone.utc).isoformat(),
        "counts": {
            "items":          len(item_index),
            "craftableItems": craftable_count,
            "categories":     len(categories),
            "recipes":        sum(len(v) for v in recipes.values()),
            "stations":       len(stations),
            "queryTags":      len(query_tags),
            "tiers":          sum(t["entryCount"] for t in tier_sections),
            "letterChunks":   len(chunks),
        },
    })

    # Write latest.json pointer and regenerate the TypeScript version constant
    latest_json = OUT_DIR.parent / "latest.json"
    with latest_json.open("w", encoding="utf-8") as f:
        json.dump({"version": VERSION}, f)

    ts_lib_dir = OUT_DIR.parent.parent.parent / "src" / "lib"
    ts_lib_dir.mkdir(parents=True, exist_ok=True)
    (ts_lib_dir / "data-version.ts").write_text(
        "// AUTO-GENERATED by projects/icarus/pipeline/stage_icarus_data.py\n"
        "// Do not edit manually — re-run the pipeline to update.\n"
        f'export const DATA_VERSION = "{VERSION}";\n',
        encoding="utf-8",
    )

    print("Mirroring assets (PNG → WebP)...")
    report = mirror_assets(all_asset_paths)
    mirror_colored_currency_icons(workshop_payload.get("currencies", {}))

    print(
        f"\nItems: {len(item_index)} | "
        f"Craftable: {craftable_count} | "
        f"Categories: {len(categories)} | "
        f"Letter chunks: {len(chunks)} | "
        f"Assets: {report['copiedCount']} converted, "
        f"{report['skippedCount']} skipped, "
        f"{report['missingCount']} missing"
    )


if __name__ == "__main__":
    stage()
