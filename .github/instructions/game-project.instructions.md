---
description: "Shared instructions for all game sites under projects/."
applyTo: "projects/**"
---

# Game Project Template Instructions

## Scope

- Each `projects/<game>/` folder is a website project inside the monorepo, not the source workspace for raw game-data processing.
- Keep game-specific UI, routes, presentational logic, and static site assets inside the relevant project folder.
- If a rule here conflicts with a more specific `projects/<game>` instruction file, follow the more specific file.

## Static Site Expectations

- Assume each project must remain compatible with GitHub Pages static export.
- Respect the project's `basePath` and `assetPrefix` configuration when adding links, images, fetch paths, or asset references.
- Prefer frontend patterns that work with static output. Avoid introducing server-only runtime dependencies unless the user explicitly requests a structural change.

## Data Boundaries

- Treat data in the website project as published output, not the full processing pipeline.
- Store website-ready assets and data in places the frontend can consume directly, such as `public/`.
- Do not add new Python data-processing scripts, scrapers, or ETL jobs inside `projects/<game>/`.
- Build or extend those pipelines in the current game's workspace folder instead.

## Shared Code

- Keep code local to the project unless it is clearly useful across multiple projects.
- Move utilities or styles into `shared/` only when reuse is real and the abstraction stays simple.
- Reuse existing shared code when it already matches the need instead of duplicating it.

## Pipeline Handoff

- If a game site needs pipeline automation from this repo, use a thin shell launcher in the root `pipeline/` folder.
- That launcher should call into the external game workspace pipeline and produce website-ready outputs for this project.
- Do not turn a project folder into a mixed frontend and data-processing workspace.

## Change Style

- Keep edits small, direct, and easy to review.
- Follow KISS and DRY without forcing abstractions.
- Preserve the existing visual and structural patterns of the specific project unless the user asks for a redesign or broader refactor.
