# Landing Page — Copilot Instructions

## Overview

The landing page is a Next.js 15 App Router project served at the **root URL** (`thelysdexicone.github.io/`). It functions as the monorepo's hub, displaying a grid of all game companion projects and linking out to each sub-site. It has **no `basePath`** — it owns the root.

## Project Location

```
landing-page/
  next.config.js         output: 'export', no basePath
  src/app/
    layout.tsx           Root layout — sets font, global CSS, metadata
    page.tsx             Home page — project grid (single page site)
    globals.css          Imports shared/styles/globals.css
    tailwind.css
  public/
    images/              Project card images (SVGs + PNGs)
  package.json
  tailwind.config.js     Extends shared/styles/tailwind-theme.css
```

## Architecture

The landing page is intentionally minimal — a **single page** with no additional routes. It imports from `shared/` for styles and theme, and all navigation goes outward to sub-sites via plain `<a href>` links (not Next.js `<Link>`, because cross-site navigation crosses deployment boundaries).

## Projects Displayed

The `projects` array in `src/app/page.tsx` defines all cards:

| id | name | href | isPinned |
|----|------|------|----------|
| `ball-x-pit` | Ball X Pit | `/ball-x-pit/` | ✅ |
| `icarus` | Icarus | `/icarus/` | ✅ |
| `blue-prince` | Blue Prince | `/blue-prince/` | ❌ |
| `factorio` | Factorio | `/factorio/` | ❌ |
| `kingdom-come-deliverance-ii` | Kingdom Come: Deliverance II | `/kingdom-come-deliverance-ii/` | ❌ |
| `satisfactory` | Satisfactory | `/satisfactory/` | ❌ |
| `widget-inc` | Widget Inc. | `/widget-inc/` | ❌ |

All projects currently show `comingSoon: true`. To mark a project as live, set `comingSoon: false` — the card's "Coming Soon" badge is conditionally rendered based on this flag.

**To add a new project:** add an entry to the `projects` array and drop its image in `public/images/`.

## Card Layout

Each project card is an `<a>` tag (not `<Link>`) with:

- Fixed minimum height (`min-h-80`)
- Pin badge (top-right) when `isPinned: true`
- Project image (centered, `<Image unoptimized>`)
- Project name + description
- "Coming Soon" badge or CTA when applicable
- Hover state: `border-secondary bg-hover`

Pinned projects sort to the top by convention — maintain that order in the `projects` array directly.

## Styling

- **Tailwind CSS** via the shared theme — CSS variables: `bg-main`, `bg-card`, `text-primary`, `text-secondary`, `border-primary`, `bg-hover`, `bg-highlight`
- **`font-pixel`** for the site title (`TheLysdexicOne` header)
- Grid class: `project-grid` (defined in `shared/styles/globals.css`)
- Container: `app-shell` + `app-container max-w-5xl`
- Do **not** add a `<nav>` tag — `shared/styles/globals.css` applies `position: fixed` to all `nav` elements globally

## GitHub Pages Constraints

- `output: 'export'` — static HTML/CSS/JS only, no server runtime
- No `basePath` — this is the root site
- `images: { unoptimized: true }` — GitHub Pages does not support Next.js Image Optimization
- Cross-project links must be plain `href` strings (e.g. `href="/icarus/"`) — they resolve relative to the GitHub Pages domain root
- `.nojekyll` file is required at the repo root (already present) for Next.js static export to work correctly

## Dev

```bash
cd landing-page
npm run dev     # port 3000
npm run build   # static export to out/
```

Or from the monorepo root:

```bash
npm run dev:landing
```
