## Plan: Icarus Data Pipeline + Responsive Companion MVP (DRAFT)

This plan delivers a production-ready path for the Icarus site by separating heavy extraction from frontend runtime. Industry-standard for this setup is: keep raw extraction/normalization in the data-source repo, then publish versioned, precomputed artifacts to the web app repo. That keeps the frontend small, deterministic, and fast for static hosting (GitHub Pages), while preserving reproducibility per game version.  
Chosen assumptions from alignment: English-first text, workflow graph includes dependencies + stations + power/resource flow, and cheatsheet supports data-driven sections plus curated notes blocks.

**Steps**

1. Define the staged artifact contract in the data pipeline (versioned by game build), including `items`, `recipes`, `stations`, `tiers`, `workflows`, and `iconManifest`, sourced from:
   - [Icarus_Ripped/versions/221.2/Content/Data/Crafting/D_ProcessorRecipes.json](Icarus_Ripped/versions/221.2/Content/Data/Crafting/D_ProcessorRecipes.json)
   - [Icarus_Ripped/versions/221.2/Content/Data/Crafting/D_RecipeSets.json](Icarus_Ripped/versions/221.2/Content/Data/Crafting/D_RecipeSets.json)
   - [Icarus_Ripped/versions/221.2/Content/Data/Items/D_ItemTemplate.json](Icarus_Ripped/versions/221.2/Content/Data/Items/D_ItemTemplate.json)
   - [Icarus_Ripped/versions/221.2/Content/Data/Items/D_ItemsStatic.json](Icarus_Ripped/versions/221.2/Content/Data/Items/D_ItemsStatic.json)
   - [Icarus_Ripped/versions/221.2/Content/Data/Traits/D_Itemable.json](Icarus_Ripped/versions/221.2/Content/Data/Traits/D_Itemable.json)
2. Build a robust normalizer in [Icarus_Ripped/scripts](Icarus_Ripped/scripts) to join item identity/display/icon data, canonicalize IDs, and produce deterministic output ordering for stable diffs.
3. Implement recipe expansion logic from `D_ProcessorRecipes` to resolve:
   - direct inputs/outputs
   - query/tag-based ingredients via [Icarus_Ripped/versions/221.2/Content/Data/Crafting/D_CraftingTags.json](Icarus_Ripped/versions/221.2/Content/Data/Crafting/D_CraftingTags.json) and [Icarus_Ripped/versions/221.2/Content/Data/Tags/D_TagQueries.json](Icarus_Ripped/versions/221.2/Content/Data/Tags/D_TagQueries.json)
   - station membership and power/resource requirements
4. Compute workflow DAGs and transitive raw-material rollups during staging (not in browser) so item detail pages render instantly with minimal client compute.
5. Build tier mapping (T2/T3/T4) using:
   - [Icarus_Ripped/versions/221.2/Content/Data/Talents/D_TalentTrees.json](Icarus_Ripped/versions/221.2/Content/Data/Talents/D_TalentTrees.json)
   - [Icarus_Ripped/versions/221.2/Content/Data/Talents/D_Talents.json](Icarus_Ripped/versions/221.2/Content/Data/Talents/D_Talents.json)
   and generate a cheatsheet-oriented section dataset that supports future section additions.
6. Resolve and stage UI media references from:
   - [Icarus_Ripped/versions/221.2/Content/Assets/2DArt/UI/Items/Item_Icons](Icarus_Ripped/versions/221.2/Content/Assets/2DArt/UI/Items/Item_Icons)
   - [Icarus_Ripped/versions/221.2/Content/Assets/2DArt/UI/Icons](Icarus_Ripped/versions/221.2/Content/Assets/2DArt/UI/Icons)
   with PNG-first fallback rules and explicit missing-asset markers in the manifest.
7. Publish generated artifacts + curated icon subset into the web repo under the Icarus app (committed artifacts is the recommended standard for this static-hosted workflow), then wire runtime loading in:
   - [projects/icarus/src/app](projects/icarus/src/app)
   - [projects/icarus/public](projects/icarus/public)
8. Implement the Icarus UX in phases:
   - Recipe explorer page: search/filter, recipe cards, station/power badges
   - Recipe detail view: expandable raw materials and workflow graph
   - Tier 2-4 cheatsheet single page with left nav + section anchors + optional curated notes blocks
9. Keep performance-first delivery constraints from:
   - [projects/icarus/next.config.js](projects/icarus/next.config.js)
   - [scripts/deploy.js](scripts/deploy.js)
   by shipping precomputed JSON chunks and lazy-loading graph payloads per selected item.
10. Add operational update flow: when new game version is ripped, rerun pipeline in `Icarus_Ripped`, copy/version artifacts into monorepo, then build/export for GitHub Pages.

**Verification**

- Data pipeline checks
  - Validate staged JSON schema consistency across all generated files.
  - Validate recipe graph integrity (no broken item refs, no orphan stations, no unresolved tags).
  - Validate icon manifest coverage and fallback counts.
- Frontend checks
  - Build all with `npm run build` at monorepo root.
  - Run `npm run dev:icarus` and verify:
    - fast initial render with no perceptible lag
    - search/filter responsiveness on full dataset
    - accurate raw-material expansion
    - workflow graph correctness including power/resource indicators
    - Tier 2-4 nav anchors and section extensibility.
- Responsive checks
  - Manual viewport pass at 320, 768, 1024, 1440 widths for recipe explorer, detail/workflow, and cheatsheet.

**Decisions**

- Pipeline location: extraction + staging in `Icarus_Ripped`; consume versioned artifacts in monorepo.
- Artifact transport: commit generated artifacts into monorepo (recommended/industry-standard for static deploy + reproducibility).
- Language scope: English-only v1.
- Workflow scope: include dependencies, station chain, and power/resource flow.
- Cheatsheet model: data-driven structure with optional curated notes blocks for strategy context.
