#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
DATA_REPO="${CONAN_DATA_REPO:-$REPO_ROOT/../conan-exiles-enhanced-data}"

SOURCE_DATASET="$DATA_REPO/temp/staged/lore/lore.json"
VALIDATOR_SCRIPT="$DATA_REPO/scripts/validate_lore_dataset.py"
TARGET_DATASET="$REPO_ROOT/projects/conan-exiles-enhanced/public/data/lore.json"

if [[ ! -d "$DATA_REPO" ]]; then
  echo "Error: Conan data repository not found: $DATA_REPO" >&2
  exit 1
fi

if [[ ! -f "$SOURCE_DATASET" ]]; then
  echo "Error: staged lore dataset not found: $SOURCE_DATASET" >&2
  exit 1
fi

if [[ ! -f "$VALIDATOR_SCRIPT" ]]; then
  echo "Error: lore validator not found: $VALIDATOR_SCRIPT" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 is required to validate the staged lore dataset." >&2
  exit 1
fi

mkdir -p "$(dirname -- "$TARGET_DATASET")"

echo "=============================================="
echo " Conan Exiles Enhanced lore handoff pipeline "
echo "=============================================="
echo "[pipeline] source:    $SOURCE_DATASET"
echo "[pipeline] validator: $VALIDATOR_SCRIPT"
echo "[pipeline] target:    $TARGET_DATASET"

python3 "$VALIDATOR_SCRIPT" "$SOURCE_DATASET"
cp "$SOURCE_DATASET" "$TARGET_DATASET"

echo "[pipeline] Lore dataset copied successfully."