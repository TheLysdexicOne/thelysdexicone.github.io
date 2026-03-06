# Prompt

We are definitely making good progress.

## References

Update pipeline_config.py with the correct paths for this machine:

```
DATA_DIR        = ~/git/icarus-data/versions/<latest>
ICONS_SRC_DIR   = ~/git/icarus-data/versions/<latest>/Content/Assets/2DArt/UI$
OUT_DIR         = ~/git/thelysdexicone.github.io\projects\icarus\public\data\221.2
ASSETS_DEST_DIR = ~/git/thelysdexicone.github.io\projects\icarus\public\game-assets
VERSION         = "3.0.0.150025"
```

After updating the file, run the pipeline to verify it works:

```powershell
cd [NEW_REPO_ROOT]\projects\icarus\pipeline
python stage_icarus_data.py
```

Expected output: `Items: 2154 | Craftable: 1845 | Categories: 21 | Letter chunks: 25 | Assets: N converted, N skipped, N missing`

If the venv/Pillow isn't set up yet, create it first:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install Pillow
```

Then commit the updated `pipeline_config.py` and push.> DATA_DIR        = [NEW_DATA_DIR]
ICONS_SRC_DIR   = [NEW_ICONS_DIR]
OUT_DIR         = [NEW_REPO_ROOT]\projects\icarus\public\data\221.2
ASSETS_DEST_DIR = [NEW_REPO_ROOT]\projects\icarus\public\game-assets
VERSION         = "221.2"

```

After updating the file, run the pipeline to verify it works:
```powershell
cd [NEW_REPO_ROOT]\projects\icarus\pipeline
python stage_icarus_data.py
```

Expected output: `Items: 2154 | Craftable: 1845 | Categories: 21 | Letter chunks: 25 | Assets: N converted, N skipped, N missing`

If the venv/Pillow isn't set up yet, create it first:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install Pillow
```

Then commit the updated `pipeline_config.py` and push.
