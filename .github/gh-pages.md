# GitHub Pages Deployment

This project is deployed to GitHub Pages using the `gh-pages` npm package.

## Setup Guide for LLMs

When setting up a Next.js project for GitHub Pages deployment:

### 1. Install gh-pages package

```bash
npm install --save-dev gh-pages
```

### 2. Configure next.config.js for static export

```javascript
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  output: 'export',  // Static HTML export
  basePath: isProd ? '/your-repo-name' : '',  // GitHub Pages subfolder
  assetPrefix: isProd ? '/your-repo-name' : '',
  images: {
    unoptimized: true,  // Required for static export
  },
};
```

### 3. Add deploy script to package.json

```json
{
  "scripts": {
    "build": "next build",
    "deploy": "next build && gh-pages -d out --dotfiles"
  }
}
```

### 4. Create utility for asset paths (src/utils/basePath.ts)

```typescript
const basePath = process.env.NODE_ENV === 'production' 
  ? '/your-repo-name' 
  : '';

export const getImagePath = (path: string) => `${basePath}${path}`;
```

### 5. Use getImagePath() for all assets

```typescript
<Image src={getImagePath('/images/logo.png')} />
```

### 6. Enable GitHub Pages in repo settings

- Settings → Pages → Source: Deploy from branch → Branch: `gh-pages`

### 7. Deploy

```bash
npm run deploy
```

This builds the static site to `out/`, then `gh-pages` pushes it to the `gh-pages` branch, which GitHub Pages serves at `https://username.github.io/repo-name/`.

## Current Project Configuration

### Deployment Process

1. Build the project: `npm run build`
2. Deploy to GitHub Pages: `npm run deploy`

The `deploy` script in `package.json` handles:

- Building the static site with `next build`
- Pushing the `out/` directory to the `gh-pages` branch
- Including dotfiles with the `--dotfiles` flag

### Key Configuration

Configuration for GitHub Pages in `next.config.js`:

- `output: 'export'` - Enables static HTML export
- `basePath` - Set to `/ball-x-pit-companion` in production
- `assetPrefix` - Ensures assets load correctly from subfolder
- `images.unoptimized: true` - Required for static export

### Asset Path Helper

The `getImagePath()` utility in `src/utils/basePath.ts` prepends the base path to all asset URLs, ensuring they work correctly on GitHub Pages.
