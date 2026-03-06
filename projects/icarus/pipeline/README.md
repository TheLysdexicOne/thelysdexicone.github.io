# Icarus Data Pipeline

Processes raw Unreal Engine JSON exports (ripped from the game's pak files) into the static
JSON data files consumed by the Next.js Icarus companion site.

## Setup

### Prerequisites

- Python 3.11+
- Game data already extracted (via CUE4Parse or similar — not part of this repo)
- Icon PNGs already extracted to a `ui-pngs/` folder

### One-time setup

```powershell
# From the repo root (or anywhere — paths below are relative to pipeline/)
cd projects/icarus/pipeline

# Create a virtual environment (recommend placing it outside the repo)
python -m venv E:\_assets_ripped\Icarus_Ripped\.venv    # adjust path as needed

# Activate
E:\_assets_ripped\Icarus_Ripped\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Configure paths

```powershell
copy pipeline_config.py.example pipeline_config.py
# Then edit pipeline_config.py in your editor — set DATA_DIR, ICONS_SRC_DIR, OUT_DIR, ASSETS_DEST_DIR, VERSION
```

`pipeline_config.py` is **gitignored** — it contains local machine paths and will never be committed.
`pipeline_config.py.example` is tracked and always reflects the expected structure.

## Running

```powershell
# Activate venv first
E:\_assets_ripped\Icarus_Ripped\.venv\Scripts\Activate.ps1

# Run from the pipeline directory
cd projects/icarus/pipeline
python stage_icarus_data.py
```

Expected output:
```
Items: 2606 | Craftable: 2560 | Categories: 24 | Letter chunks: 25 | Assets: N converted, N skipped, N missing
```

## Output files

All files are written to `OUT_DIR` (configured in `pipeline_config.py`), which should be
`projects/icarus/public/data/<version>/`:

| File | Purpose |
|---|---|
| `meta.json` | Version, counts, timestamp |
| `categories.json` | 24 field guide categories |
| `item-index.json` | Lightweight list of all craftable items |
| `item-lookup.json` | Full itemId→name/icon map (includes non-craftable items) |
| `stations.json` | Crafting station definitions |
| `tier-sections.json` | T2/T3/T4 talent tree entries |
| `query-tags.json` | Ingredient wildcard query tags |
| `workshop-items.json` | Workshop catalog with currencies |
| `items/{letter}.json` | Per-letter item detail chunks (0, a–z) |
| `asset-mirror-report.json` | WebP mirror run report |

Icon WebP files are mirrored to `ASSETS_DEST_DIR` (configured in `pipeline_config.py`).

## Migrating to a new machine

1. Extract game data to new paths
2. Copy `pipeline_config.py.example` → `pipeline_config.py`
3. Update the four path constants to match the new machine
4. Create a venv, install requirements
5. Run `python stage_icarus_data.py`
