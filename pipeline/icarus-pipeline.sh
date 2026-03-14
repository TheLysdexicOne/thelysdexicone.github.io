#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
PIPELINE_DIR="$REPO_ROOT/projects/icarus/pipeline"

PYTHON_CANDIDATES=(
  "$PIPELINE_DIR/.venv/bin/python"
  "$REPO_ROOT/node_modules/@thelysdexicone/icarus/pipeline/.venv/bin/python"
)

PYTHON_BIN=""
for candidate in "${PYTHON_CANDIDATES[@]}"; do
  if [[ -x "$candidate" ]]; then
    PYTHON_BIN="$candidate"
    break
  fi
done

if [[ -z "$PYTHON_BIN" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="$(command -v python3)"
  elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="$(command -v python)"
  else
    echo "Error: no Python interpreter found." >&2
    exit 1
  fi
fi

if [[ ! -d "$PIPELINE_DIR" ]]; then
  echo "Error: pipeline directory not found: $PIPELINE_DIR" >&2
  exit 1
fi

if [[ ! -f "$PIPELINE_DIR/stage_icarus_data.py" ]]; then
  echo "Error: pipeline entrypoint not found: $PIPELINE_DIR/stage_icarus_data.py" >&2
  exit 1
fi

if [[ ! -f "$PIPELINE_DIR/pipeline_config.py" ]]; then
  echo "Error: missing $PIPELINE_DIR/pipeline_config.py" >&2
  echo "Copy pipeline_config.py.example to pipeline_config.py and update the paths first." >&2
  exit 1
fi

echo "====================================="
echo " Running Icarus staging pipeline   "
echo "====================================="
echo "[pipeline] repo:   $REPO_ROOT"
echo "[pipeline] script: $PIPELINE_DIR/stage_icarus_data.py"
echo "[pipeline] python: $PYTHON_BIN"

cd "$PIPELINE_DIR"
"$PYTHON_BIN" stage_icarus_data.py "$@"
