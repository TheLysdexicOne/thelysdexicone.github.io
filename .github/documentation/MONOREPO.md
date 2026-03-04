# TheLysdexicOne GitHub Pages Monorepo

A monorepo structure for hosting multiple gaming companion sites on GitHub Pages.

## 📁 Structure

```
thelysdexicone.github.io/
├── landing-page/              # Next.js landing page (root URL)
│   ├── src/
│   │   └── app/              # App Router pages
│   ├── public/               # Static assets (fonts, images)
│   ├── package.json
│   ├── next.config.js
│   └── tailwind.config.js
├── projects/                 # Individual project apps
│   └── ball-x-pit-companion/  # BALL X PIT Companion app
│       ├── src/
│       ├── public/           # Project-specific assets
│       ├── data/             # Game data
│       ├── package.json
│       ├── next.config.js
│       └── tailwind.config.js
├── shared/                   # Shared code across projects
│   ├── components/          # Reusable React components
│   ├── styles/              # Theme configurations
│   └── utils/               # Shared utilities
├── scripts/                 # Build and deployment scripts
│   └── deploy.js
├── dist/                    # Build output (GitHub Pages serves this)
├── package.json             # Root package with workspace config
├── README.md               # This file
└── .github/                # GitHub-specific files
```

## 🚀 Getting Started

### Installation

Install dependencies for all projects:

```bash
npm run install-all
```

Or install individually:

```bash
npm install                           # Root dependencies
npm install -w landing-page          # Landing page
npm install -w projects/ball-x-pit-companion  # Companion app
```

### Development

Run landing page in development mode:

```bash
npm run dev:landing
```

Run BALL X PIT Companion in development mode:

```bash
npm run dev:companion
```

### Building

Build all projects:

```bash
npm run build
```

Build individually:

```bash
npm run build:landing
npm run build:companion
```

### Deployment

Deploy to GitHub Pages:

```bash
npm run deploy
```

This will:

1. Build the landing page to `landing-page/out`
2. Build ball-x-pit-companion to `projects/ball-x-pit-companion/out`
3. Combine outputs into `dist/` directory
4. Create `.nojekyll` file (required for Next.js)

Then commit and push:

```bash
git add -A
git commit -m "Deploy: build all projects"
git push origin main
```

GitHub Pages will serve the content from the `dist/` folder.

## 🎨 Shared Styling

### Theme Configuration

All projects use a shared theme configuration in `shared/styles/theme.ts`:

- **Text colors**: Primary (#f6eade), Secondary (#dabda1)
- **Background**: Main (#0f0a09), Body (#292627), Nav (#1c1512)
- **Buttons**: Primary stone[900], Hover amber[800]
- **Borders**: Primary stone[600], Secondary stone[500]

To customize colors per project, update the theme function:

```typescript
// shared/styles/theme.ts
export function getThemeForProject(projectId: string): ThemeConfig {
  switch (projectId) {
    case 'ball-x-pit-companion':
      return ballXPitTheme;  // Custom colors
    case 'new-project':
      return newProjectTheme;
    default:
      return defaultTheme;
  }
}
```

### Tailwind Configuration

All projects share the same Tailwind config structure:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../shared/**/*.{js,ts,jsx,tsx,mdx}',  // Include shared
  ],
  theme: {
    extend: {
      // Theme colors
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};
```

## ➕ Adding a New Project

1. Create project directory:

```bash
mkdir -p projects/new-project/src/app
```

1. Copy config files from `projects/ball-x-pit-companion/`:
   - `package.json` (update name and dependencies)
   - `next.config.js` (update basePath: '/new-project')
   - `tailwind.config.js`
   - `tsconfig.json`
   - `.eslintrc.json`
   - `.prettierrc`

2. Create `src/app/layout.tsx` and `src/app/page.tsx`

3. Update root `package.json` workspaces:

```json
{
  "workspaces": [
    "landing-page",
    "projects/ball-x-pit-companion",
    "projects/new-project"
  ]
}
```

1. Update `landing-page/src/app/page.tsx` to include the new project in the projects list

2. Update `scripts/deploy.js` to build the new project:

```javascript
// Add to deploy script
console.log('\n🔨 Building new-project...');
try {
  process.chdir(path.join(rootDir, 'projects', 'new-project'));
  execSync('npm run build', { stdio: 'inherit' });
  
  const newProjectDistDir = path.join(distDir, 'new-project');
  fs.mkdirSync(newProjectDistDir, { recursive: true });
  copyDir(outDir, newProjectDistDir);
} catch (error) {
  console.error('❌ new-project build failed:', error.message);
  process.exit(1);
}
```

## 📦 Project URLs

After deployment, projects are available at:

- **Landing page**: `https://thelysdexicone.github.io/`
- **BALL X PIT Companion**: `https://thelysdexicone.github.io/ball-x-pit-companion/`
- **New projects**: `https://thelysdexicone.github.io/{project-id}/`

## 🔧 Technologies

- **Framework**: Next.js 15.4.6
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Hosting**: GitHub Pages (static export)
- **Package Management**: npm workspaces

## 📝 Key Files

- `package.json` - Root workspace configuration
- `scripts/deploy.js` - Build and deployment automation
- `shared/styles/theme.ts` - Shared theme configuration
- `shared/utils/shared-utils.ts` - Reusable utilities
- `.github/workflows/deploy.yml` - (Optional) CI/CD for auto-deployment

## ⚠️ Important Notes

### Static Export Only

All projects use `output: 'export'` for GitHub Pages compatibility:

- No server-side rendering
- No API routes
- Client-side only (use localStorage for state)

### Base Path Configuration

Each project's `next.config.js` includes:

```javascript
...(isProd && {
  basePath: '/project-id',
  assetPrefix: '/project-id/',
})
```

This ensures assets load correctly in production.

### .nojekyll File

The `.nojekyll` file in `dist/` disables Jekyll processing. Don't remove it!

## 🚦 GitHub Pages Configuration

In your GitHub repository settings:

1. Go to **Settings > Pages**
2. Set **Source** to `Deploy from a branch`
3. Set **Branch** to `main` and **Folder** to `/(root)`
4. Save

The site will deploy automatically when changes are pushed.

## 📚 Additional Resources

- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 License

All projects in this monorepo are under the same license. Check individual project README files for details.
