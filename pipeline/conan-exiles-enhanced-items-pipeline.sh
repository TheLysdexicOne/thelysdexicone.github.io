#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
DATA_REPO="${CONAN_DATA_REPO:-$REPO_ROOT/../conan-exiles-enhanced-data}"

SOURCE_DATASET="$DATA_REPO/temp/staged/items/items.json"
SOURCE_ICON_DIR="$DATA_REPO/temp/staged/items/icons"
VALIDATOR_SCRIPT="$DATA_REPO/scripts/validate_items_dataset.py"
TARGET_DATASET="$REPO_ROOT/projects/conan-exiles-enhanced/public/data/items.json"
TARGET_ICON_DIR="$REPO_ROOT/projects/conan-exiles-enhanced/public/data/item-icons"

if [[ ! -d "$DATA_REPO" ]]; then
  echo "Error: Conan data repository not found: $DATA_REPO" >&2
  exit 1
fi

if [[ ! -f "$SOURCE_DATASET" ]]; then
  echo "Error: staged items dataset not found: $SOURCE_DATASET" >&2
  exit 1
fi

if [[ ! -f "$VALIDATOR_SCRIPT" ]]; then
  echo "Error: item validator not found: $VALIDATOR_SCRIPT" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 is required to validate the staged items dataset." >&2
  exit 1
fi

mkdir -p "$(dirname -- "$TARGET_DATASET")"

echo "==============================================="
echo " Conan Exiles Enhanced items handoff pipeline "
echo "==============================================="
echo "[pipeline] source:    $SOURCE_DATASET"
echo "[pipeline] validator: $VALIDATOR_SCRIPT"
echo "[pipeline] target:    $TARGET_DATASET"

python3 "$VALIDATOR_SCRIPT" "$SOURCE_DATASET"
cp "$SOURCE_DATASET" "$TARGET_DATASET"

if [[ -d "$SOURCE_ICON_DIR" ]]; then
  rm -rf "$TARGET_ICON_DIR"
  mkdir -p "$(dirname -- "$TARGET_ICON_DIR")"
  cp -R "$SOURCE_ICON_DIR" "$TARGET_ICON_DIR"
  echo "[pipeline] Item icons copied successfully."
else
  echo "[pipeline] No staged item icons directory found; skipping icon copy."
fi

echo "[pipeline] Items dataset copied successfully."