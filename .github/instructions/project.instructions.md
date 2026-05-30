---
description: "Repository-wide instructions for the website monorepo, workspace boundaries, pipelines, and deployment safety."
---

# Project-Wide Copilot Instructions

## Repository Roles

- `thelysdexicone.github.io/` is the website monorepo. Keep all website code, UI, routing, static assets, shared frontend utilities, and deployment-related changes inside this repository.
- Any other workspace folder attached alongside this repo should be treated as the current game's data or pipeline workspace unless the user says otherwise.
- Do not mix responsibilities across workspace folders. Website work belongs in this repo; game extraction, data staging, and heavy processing belong in the current game's workspace.

## Website Boundaries

- Keep all website-related implementation inside `landing-page/`, `projects/`, `shared/`, `scripts/`, and other folders already established in this repo.
- Do not place website pages, components, styles, or build logic in a sibling game-data workspace.
- Keep project pages and project-specific frontend code inside `projects/<game>/`.
- Put reusable frontend code in `shared/` only when it is genuinely shared or clearly trending that way. Avoid premature abstraction.

## Game Workspace Boundaries

- Treat the non-website workspace folder as the source of truth for raw game data, extracted assets, data-processing scripts, and game-specific pipeline logic.
- Do not add new data-processing Python scripts under the website repo's app folders.
- Do not put new Python ETL, scraping, extraction, staging, or transformation code in `landing-page/`, `projects/`, or `shared/`.
- If the website needs processed data, generate it in the current game's workspace and copy or export only the final website-ready artifacts into this repo.

## Pipeline Protocol

- The root `pipeline/` folder in this repo is for shell launchers and orchestration scripts that kick off pipelines implemented in the current game's workspace.
- Keep those scripts thin. They should invoke external pipeline entry points, coordinate handoff, and stage results for the website when needed.
- Do not build full data-processing systems inside the root `pipeline/` folder.
- If a pipeline requires Python, keep the Python source in the game workspace and let the shell launcher call it from there.

## Deployment Protocol

- Never deploy to production unless the user explicitly asks for deployment.
- Treat `npm run deploy` as a production action. In this repo it rebuilds the site and force-pushes the `gh-pages` branch.
- Do not run deployment commands as part of routine edits, cleanup, validation, or "finishing touches."
- Prefer validation steps such as targeted project builds, tests, or linting before suggesting deployment.
- If the site is in a strong state for release, it is appropriate to recommend deployment to the user, but recommendation is not authorization.
- When discussing deployment, be explicit about what command would be used and that it affects production.

## Engineering Principles

- Keep changes simple. Prefer the smallest correct change over broad rewrites.
- Follow DRY, but do not extract abstractions too early. Reuse existing helpers and shared styles when they fit cleanly.
- Follow KISS. Favor straightforward structure, clear naming, and low-risk edits.
- Preserve established project conventions unless the task requires a change.
- Keep diffs focused. Do not bundle unrelated cleanup into feature work.

## Monorepo Practices

- Respect the npm workspace layout defined in the root `package.json`.
- Run commands from the narrowest scope that proves the change when possible, such as a single project build before a full monorepo build.
- Keep GitHub Pages constraints in mind: static export, correct `basePath`, correct `assetPrefix`, and deployable output under `dist/`.
- Treat the landing page and each project site as independently shippable frontend surfaces inside one repository.

## Data Handoff Expectations

- Website-facing data should arrive in a frontend-consumable format such as static JSON, images, or other prebuilt assets.
- Keep processing at the edge of the website repo. The website should consume prepared data rather than perform raw-data transformation work.
- When a data contract changes, update the consuming site code and any relevant documentation together.

## Instruction Layering

- Use this file for repository-wide rules.
- Use shared project-template instructions for all `projects/<game>/` sites.
- Use game-specific instruction files only when a project genuinely needs exceptions or extra context beyond the shared template.
- When a new game workspace is added to the broader workspace, bootstrap local instruction files there early: `.github/instructions/python.instructions.md` plus a game-specific instruction file for that workspace.
