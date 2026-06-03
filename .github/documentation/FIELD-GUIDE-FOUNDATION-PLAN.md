# Field Guide Foundation Plan

## Purpose

This document defines the implementation plan for a reusable field-guide foundation in the website monorepo.

The goal is not to centralize game extraction or force every game into one raw-data pipeline. The goal is to normalize website-facing staged data before import into the monorepo, then build shared frontend structure on top of that stable boundary.

This plan assumes the following split remains in place:

- Game-data workspaces own extraction, raw exports, enrichment, staging, validation, and asset preparation.
- The website monorepo owns project routes, shared frontend primitives, project-level adapters, and deployment-facing integration.

## Goals

1. Reuse field-guide layout structure across multiple projects without forcing shared gameplay semantics.
2. Normalize staged website-facing data contracts where practical so multiple projects can plug into common UI patterns.
3. Preserve project flexibility for theme, terminology, filters, badges, detail sections, and search behavior.
4. Keep extraction and heavy transformation outside the monorepo.
5. Create a foundation that can support future survival and RPG projects without rebuilding the same browse shell from scratch.

## Non-Goals

1. Do not build a single shared extraction framework for all games.
2. Do not move Python ETL, scraping, staging, or asset extraction into the monorepo.
3. Do not force Icarus and Conan into an artificially identical data model.
4. Do not extract a large shared UI system before Conan is a real second consumer.
5. Do not build a scaffold generator before the shared primitives are proven stable.

## Core Decision

Normalize at the staging boundary, not at the extraction boundary.

That means each game workspace can keep its own extraction logic, tools, heuristics, and source-specific transformation steps. The contract that matters to the monorepo is the staged website-facing artifact that gets handed off into a project under `projects/`.

This preserves freedom in the data workspaces while giving the frontend a stable and reusable import surface.

## Architectural Model

Treat the system as three layers.

### Layer A: Source Extraction

This layer is always game-specific.

Responsibilities:

- Read raw game assets, exports, tables, or external source systems.
- Apply source-specific enrichment and cleanup.
- Produce staging inputs and validation artifacts.

Ownership:

- Game-data workspaces such as `conan-exiles-enhanced-data/`.

Must remain local because:

- Asset formats differ.
- Tooling differs.
- Heuristics differ.
- Source reliability differs.

### Layer B: Staged Website-Ready Contracts

This is the normalization boundary.

Responsibilities:

- Convert game-specific extraction outputs into stable website-facing JSON and asset references.
- Validate required fields, identity rules, and structural expectations.
- Preserve a predictable shape for the monorepo consumer.

Ownership:

- Still belongs to the game-data workspace.

Why it matters:

- This is the earliest layer where cross-project normalization becomes useful.
- It gives the frontend stable data without forcing shared extraction logic.

### Layer C: Frontend Adapters and Presentation

This layer lives inside the monorepo.

Responsibilities:

- Load staged artifacts.
- Map staged data into project-local view models.
- Render shared field-guide structure and project-specific content.

Ownership:

- `projects/<game>/` for project adapters and project-specific behavior.
- `shared/` for proven shared structural primitives.

## Shared vs Local Boundary

The rule is simple: share structure before semantics.

### Shared Now

These rules should be adopted immediately, even before component extraction:

1. Common navigation model for field-guide style pages.
2. Consistent naming for shared structural primitives.
3. Consistent split between project-local adapters and shared layout components.
4. Consistent expectation that monorepo imports consume staged website-facing artifacts, not raw extraction outputs.

### Local For Now

These should remain project-local until at least two mature consumers justify sharing:

1. Fetch/load code tied to project asset paths.
2. Category derivation logic.
3. Search matching and ranking behavior.
4. Badge semantics and metadata emphasis.
5. Detail-panel content sections.
6. Feature-specific filters and toggles.
7. Game-specific language and terminology.
8. Search-refinement rules such as synonym expansion, token weighting, and project-specific ranking heuristics.

### Shared Later

These are the expected first shared frontend primitives once Conan and Icarus both justify them:

1. Field-guide page shell.
2. Header and control-bar frame.
3. Category-grid scaffold.
4. Accordion category-panel scaffold.
5. Compact item-grid scaffold.
6. Detail-panel frame.
7. Shared loading, empty, and error states for guide pages.

## Normalized Staging Strategy

The monorepo should standardize staged frontend-facing contracts by content family, not by raw source system.

Initial content families:

1. Item and field-guide entry datasets.
2. Lore and knowledge entry datasets.
3. Category and taxonomy metadata.
4. Icon and image references.
5. Recipes, obtain methods, map availability, and source references.

### Item-Like Dataset Shape

The first normalized contract should target item-style field-guide data because Icarus and Conan both need it.

Recommended shared staged envelope:

- `id`: stable canonical identifier.
- `slug`: stable route- and UI-safe identifier.
- `name`: primary display name.
- `subtitle`: optional display variant or secondary label.
- `summary`: short display summary.
- `description`: longer descriptive text.
- `categoryKey`: internal normalized category key.
- `categoryLabel`: display label for category navigation.
- `iconPath`: optional project-consumable icon reference.
- `imagePath`: optional larger art reference.
- `tags`: normalized search and filter tags.
- `searchTokens`: optional expanded search terms.
- `availability`: envelope for map, region, world, or mode availability.
- `obtainMethods`: envelope for acquisition methods.
- `recipe`: envelope for ingredients, stations, and craftability metadata.
- `source`: provenance envelope for extraction or source-reference data.
- `extensions`: optional bag for game-specific metadata that does not belong in shared primitives.

This is not a demand that every game stages identical semantics. It is a target envelope that allows the monorepo to rely on predictable core fields while leaving room for per-game details.

### Contract Design Rules

1. Prefer explicit fields over opaque nested blobs for commonly rendered data.
2. Use optional extension fields rather than inflating the shared contract with one-game concepts.
3. Keep identity fields stable across restaging when the source identity is stable.
4. Validate staged datasets before handoff into the monorepo.
5. Treat assets such as icons as part of the staged frontend contract when the UI depends on them.

## Phased Implementation Plan

## Phase 0: Lock the Boundary

Objective:

- Write down and enforce the division between game-data workspaces and the website monorepo.

Tasks:

1. Document the three-layer model in the monorepo documentation.
2. Keep shell launchers in the monorepo thin and orchestration-only.
3. Keep extraction and staging logic in the game-data workspace.
4. Confirm that every website-facing import flows through a staged artifact.

Exit criteria:

- There is no ambiguity about where extraction ends and monorepo consumption begins.

## Phase 1: Define Target Staged Contracts

Objective:

- Establish the normalized staging strategy for data entering the monorepo.

Tasks:

1. Define the first field-guide item contract envelope.
2. Define how icon and image references should be staged for frontend consumption.
3. Define availability, obtain-method, recipe, and source envelopes at a level that multiple projects can use.
4. Keep a project-specific extension bag for non-shared metadata.
5. Align validation expectations between staged data and monorepo consumers.
6. Add a normalized representation for multi-recipe cases so one entry can express variant recipes without inventing project-specific hacks later.

Exit criteria:

- The target staged contract is explicit enough that a game-data workspace can stage toward it without guessing.

## Phase 2: Finish Conan as the Second Consumer

Objective:

- Make Conan a mature second consumer before extracting major shared UI code.

Tasks:

1. Stage and render real item icons.
2. Stage and render recipe data in the item detail surface.
3. Keep the category-first browse flow stable.
4. Stabilize detail-panel sections around Conan item data.
5. Render map availability, obtain methods, and source metadata intentionally.
6. Record every place where Conan diverges from Icarus in useful ways.

Exit criteria:

- Conan field-guide v1 feels complete enough to compare honestly against Icarus rather than acting as a placeholder.

## Phase 3: Build the Overlap Matrix

Objective:

- Extract shared code only from proven overlap.

Tasks:

1. Compare Icarus and Conan UI structure.
2. Compare staged contract shape.
3. Compare project-local view-model logic.
4. Mark what is shared now versus what remains local.
5. Treat any one-consumer abstraction as local until a second consumer justifies it.

Output:

- A written overlap matrix covering:
  - field-guide shell
  - control bar
  - category grid
  - accordion panel
  - item grid
  - detail-panel frame
  - shared states
  - local-only semantics and adapters

Exit criteria:

- The first shared extraction scope is evidence-based, not speculative.

## Phase 4: Extract Shared Structural Primitives

Objective:

- Move proven layout primitives into the monorepo shared surface.

Tasks:

1. Create low-opinion shared components under `shared/`.
2. Keep APIs slot-based and theme-friendly.
3. Expose composition points rather than locking consumers into one detail schema.
4. Keep data normalization and gameplay semantics out of shared React components.

Initial target set:

1. `FieldGuideLayout`
2. top control-bar frame
3. `CategoryGrid`
4. `CategoryPanel`
5. `ItemGrid`
6. `ItemDetailFrame`
7. shared empty/loading/error shells

Exit criteria:

- Shared components are reusable by both Icarus and Conan without encoding one game's semantics into the API.

## Phase 5: Migrate Consumers Carefully

Objective:

- Prove the shared API through incremental migration.

Tasks:

1. Migrate Icarus first as the current strongest layout reference.
2. Validate Icarus with a narrow project build and visual review.
3. Migrate Conan second.
4. Only broaden shared APIs where both consumers need the same capability.
5. Leave Conan-only or Icarus-only concepts local unless they clearly generalize.

Exit criteria:

- Both projects run cleanly on the shared structural foundation with local adapters handling project semantics.

## Phase 6: Add Future-Project Adoption Guidance

Objective:

- Make the shared foundation usable for future projects without premature automation.

Tasks:

1. Write adoption guidance for a new project.
2. Define expected staged input shape by content family.
3. Define local adapter responsibilities.
4. Define theme tokens and styling hooks.
5. Define the minimum page and route structure for a field-guide project.
6. Create a validation checklist for future adopters.

Exit criteria:

- A future project can adopt the field-guide foundation from documentation alone.

## Validation Strategy

1. Validate staged datasets before monorepo handoff.
2. Validate project-local consumers with narrow project builds instead of broad monorepo builds whenever possible.
3. Validate Icarus first after shared extraction.
4. Validate Conan second after shared extraction.
5. Confirm that a third project could adopt the shared shell using a local adapter and a staged dataset without inheriting Icarus- or Conan-specific assumptions.

## Risks and Controls

### Risk: Premature Abstraction

If shared extraction starts too early, the API will reflect Icarus more than the actual monorepo need.

Control:

- Finish Conan first.
- Write the overlap matrix before extraction.

### Risk: Over-Normalized Data Contracts

If the staged contract becomes too generic, consumers will need too many local workarounds.

Control:

- Normalize only the core display and navigation envelope.
- Keep an extension bag for project-specific metadata.

### Risk: Shared Components Absorb Domain Logic

If domain semantics move into shared components, future restyling and reuse will become harder.

Control:

- Keep shared components structural and slot-driven.
- Keep semantics in project-local adapters and detail content components.

### Risk: Monorepo Drift Between Projects

If Conan evolves without guardrails, it may drift too far from the shared target.

Control:

- Adopt naming and boundary rules now.
- Keep the common navigation model visible during Conan v1 work.

## Immediate Next Steps

1. Use this plan as the reference for Conan field-guide completion.
2. Tighten the Conan v1 checklist into concrete implementation tasks.
3. Treat icon staging and recipe staging as the highest-value remaining Conan data tasks.
4. Avoid extracting shared React components until Conan reaches the documented exit criteria.
5. After Conan v1, write the overlap matrix and begin shared primitive extraction.
6. During field-guide normalization, add explicit follow-up work for search refinement and multi-recipe handling before treating the shared contract as stable.

## Success Criteria

This plan succeeds when all of the following are true:

1. Game-data workspaces still own extraction and staging.
2. The monorepo consumes normalized staged artifacts rather than raw extraction outputs.
3. Icarus and Conan share the same structural field-guide foundation without sharing the wrong semantics.
4. Future projects can adopt the same foundation with local adapters and theme variation.
5. The shared system reduces rebuild effort without becoming a rigid framework.
