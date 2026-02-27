# Monorepo Quick Start Guide

Welcome to the new monorepo structure! This guide will help you get started.

## 🎯 First Steps

### 1. Install Dependencies

```powershell
# From the root directory
npm run install-all
```

This will install dependencies for:
- Root (commitizen, jest)
- landing-page
- projects/ball-x-pit-companion

**Time estimate**: 3-5 minutes (first time only)

### 2. Verify the Build

```powershell
npm run build
```

This will:
- Build the landing page
- Build ball-x-pit-companion
- Output to `dist/` folder

**Expected output**:
```
dist/
├── index.html (landing page)
├── _next/
├── ball-x-pit-companion/
│   ├── index.html
│   └── _next/
└── .nojekyll
```

### 3. Test Locally (Optional)

Run each project in development mode in separate terminals:

**Terminal 1 - Landing Page**:
```powershell
npm run dev:landing
# Opens http://localhost:3000
```

**Terminal 2 - Ball X PIT Companion**:
```powershell
npm run dev:companion
# Opens http://localhost:3001
```

## 📋 Common Tasks

### Edit the Landing Page

Files to update:
- `landing-page/src/app/page.tsx` - Main page content
- `landing-page/src/app/layout.tsx` - Layout/header
- `landing-page/src/app/globals.css` - Global styles

Test changes:
```powershell
npm run dev:landing
```

### Edit Ball X PIT Companion

The entire existing project is now in `projects/ball-x-pit-companion/`.

Workflow:
1. Make changes in `projects/ball-x-pit-companion/src/`
2. Test with `npm run dev:companion`
3. Deploy with `npm run deploy`

### Add a New Project

1. Copy `projects/ball-x-pit-companion/` to `projects/new-project/`
2. Update `projects/new-project/package.json` with new name
3. Update `projects/new-project/next.config.js` basePath to `/new-project`
4. Update root `package.json` workspaces to include new project
5. Update `landing-page/src/app/page.tsx` to link to new project
6. Update `scripts/deploy.js` to build new project

See `MONOREPO.md` for detailed instructions.

## 🚀 Deployment

### Build and Deploy

```powershell
npm run deploy
```

Then commit and push:

```powershell
git add -A
git commit -m "Deploy: update projects"
git push origin main
```

GitHub Pages will automatically serve the `dist/` folder.

### View Live Sites

After deployment (2-3 minutes):

- **Landing**: https://thelysdexicone.github.io/
- **Companion**: https://thelysdexicone.github.io/ball-x-pit-companion/

## 📁 Project Layout

```
Root workspace (thelysdexicone.github.io)
├── landing-page/         # Homepage at root URL
├── projects/
│   └── ball-x-pit-companion/  # Sub-project at /ball-x-pit-companion/
└── shared/              # Reusable code (components, styles, utils)
```

## 🐛 Troubleshooting

### Build fails with "cannot find module"

Run full install:
```powershell
npm run install-all
```

### localhost:3001 shows wrong page

Make sure you're running the correct dev script:
```powershell
# Check which projects are running
Get-Process node

# Kill all node processes if needed
Get-Process node | Stop-Process -Force
```

### dist/ folder is empty

Ensure you ran `npm run build` before `npm run deploy`:
```powershell
npm run build          # Builds to dist/
npm run deploy         # Uses dist/ for deployment
```

### Changes don't appear after push

GitHub Pages caches content. Try:
1. Hard refresh browser: `Ctrl+Shift+R`
2. Wait 2-3 minutes for GitHub to rebuild
3. Check GitHub Actions (if available) for build errors

## 📚 Next Steps

1. ✅ Install dependencies: `npm run install-all`
2. ✅ Test build: `npm run build`
3. ✅ Test landing page: `npm run dev:landing`
4. ✅ Test companion: `npm run dev:companion`
5. ✅ Deploy: `npm run deploy` + `git push`

For more details, see `MONOREPO.md`.
