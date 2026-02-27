# thelysdexicone.github.io

A monorepo for gaming companion sites hosted on GitHub Pages. This repository contains a landing page and multiple game-specific companion projects.

## 🎮 Projects

### Featured Projects

- **[Ball X Pit](https://thelysdexicone.github.io/ball-x-pit/)** - Progression tracker and encyclopedia *(Coming Soon)*
- **[Icarus](https://thelysdexicone.github.io/icarus/)** - Survival companion and resource guide *(Coming Soon)*

### Other Projects

- **[Blue Prince](https://thelysdexicone.github.io/blue-prince/)** - Strategy guide and companion *(Coming Soon)*
- **[Factorio](https://thelysdexicone.github.io/factorio/)** - Factory optimization and blueprint library *(Coming Soon)*
- **[Kingdom Come: Deliverance II](https://thelysdexicone.github.io/kingdom-come-deliverance-ii/)** - Quest guide and progression tracker *(Coming Soon)*
- **[Satisfactory](https://thelysdexicone.github.io/satisfactory/)** - Factory planning and resource calculator *(Coming Soon)*
- **[Widget Inc.](https://thelysdexicone.github.io/widget-inc/)** - Production optimization guide *(Coming Soon)*

## 📁 Repository Structure

```
thelysdexicone.github.io/
├── landing-page/          # Next.js landing page (root site)
│   ├── src/app/          # App Router pages
│   ├── public/           # Static assets (images, fonts)
│   └── package.json
├── projects/             # Individual game companion sites
│   ├── ball-x-pit/       # Ball X Pit companion
│   ├── icarus/           # Icarus companion
│   ├── kingdom-come-deliverance-ii/
│   ├── blue-prince/
│   ├── factorio/
│   ├── satisfactory/
│   └── widget-inc/
├── shared/               # Shared styles and utilities
│   ├── styles/          # Global CSS, Tailwind theme
│   └── utils/           # Shared TypeScript utilities
├── scripts/             # Build and deployment scripts
│   └── deploy.js        # GitHub Pages deployment script
└── package.json         # Root workspace configuration
```

Each project is a complete Next.js 15 application with:

- App Router architecture
- Static export for GitHub Pages (`output: 'export'`)
- Unique `basePath` for subdirectory hosting
- Shared theme and styling from `shared/`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

Install all dependencies for all projects:

```bash
npm run install-all
```

This installs dependencies for the root, landing page, and all project workspaces.

## 💻 Development

### Run All Projects with Local Proxy

```bash
npm run dev:all
```

This starts every project dev server and a local reverse proxy.

- Single entry URL: <http://localhost:3000>
- Landing page is served through the proxy
- Project routes are proxied by path (for example `/ball-x-pit`, `/icarus`)

If required ports are already in use, stop existing dev servers and run the command again.

### Run Landing Page

```bash
npm run dev:landing
```

Starts the landing page at <http://localhost:3000>

### Run Individual Projects

```bash
npm run dev:ball-x-pit         # Port 3001
npm run dev:icarus             # Port 3002
npm run dev:kingdom-come       # Port 3003
npm run dev:blue-prince        # Port 3004
npm run dev:factorio           # Port 3005
npm run dev:satisfactory       # Port 3006
npm run dev:widget-inc         # Port 3007
```

Each project runs on a different port to allow simultaneous development.

## 🔨 Building

### Build Individual Projects

```bash
npm run build:landing
npm run build:ball-x-pit
npm run build:icarus
# ... etc
```

### Build All Projects

```bash
npm run build
```

Builds all projects sequentially. Output goes to each project's `out/` directory.

## 🚢 Deployment

### Automated Deployment

```bash
npm run deploy
```

This script:

1. Builds all projects
2. Copies landing page to `dist/`
3. Copies each project to `dist/<project-name>/`
4. Creates `.nojekyll` file
5. Publishes `dist/` to the `gh-pages` branch

GitHub Pages automatically serves the latest `gh-pages` branch.

### Manual Deployment

```bash
npm run build
node scripts/deploy.js
```

## 🎨 Theming

All projects share a common dark, earthy gaming theme defined in:

- `shared/styles/globals.css` - Global CSS variables and base styles
- `shared/styles/tailwind-theme.js` - Shared Tailwind config

Projects can extend or override the shared theme in their individual `tailwind.config.js`.

## 📦 Workspaces

This monorepo uses npm workspaces. Each project is defined in the root `package.json`:

```json
{
  "workspaces": [
    "landing-page",
    "projects/ball-x-pit",
    "projects/icarus",
    "projects/kingdom-come-deliverance-ii",
    "projects/blue-prince",
    "projects/factorio",
    "projects/satisfactory",
    "projects/widget-inc"
  ]
}
```

## 🔧 Adding a New Project

1. Create project directory: `projects/<project-name>/`
2. Set up Next.js with App Router
3. Configure `next.config.js`:

   ```js
   module.exports = {
     output: 'export',
     basePath: '/<project-name>',
     assetPrefix: '/<project-name>/',
   };
   ```

4. Add to root `package.json` workspaces
5. Add dev/build scripts to root `package.json`
6. Add project card to `landing-page/src/app/page.tsx`
7. Create placeholder SVG in `landing-page/public/images/`

## 📝 Notes

- **ball-x-pit-companion** is maintained in a separate repository and is **not** part of this monorepo
- All projects use Next.js 15 with App Router
- GitHub Pages deployment uses static export (no SSR)
- Each project is independent and can be developed/deployed separately

## 📄 License

These are fan-made companion sites for games. Not affiliated with the original game developers.
