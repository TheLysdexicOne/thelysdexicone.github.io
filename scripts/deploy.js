#!/usr/bin/env node

/**
 * Monorepo deployment script for GitHub Pages
 * Builds all projects and outputs to dist/ for GitHub Pages
 *
 * Usage: node scripts/deploy.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.join(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const landingPageOutDir = path.join(rootDir, "landing-page", "out");
const companionOutDir = path.join(
  rootDir,
  "projects",
  "ball-x-pit-companion",
  "out",
);

console.log("🚀 Starting monorepo deployment...\n");

// Step 1: Clean dist directory
console.log("📦 Cleaning dist directory...");
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Step 2: Build landing page
console.log("🔨 Building landing page...");
try {
  process.chdir(path.join(rootDir, "landing-page"));
  execSync("npm run build", { stdio: "inherit" });

  // Copy landing page output to dist
  console.log("📋 Copying landing page to dist...");
  copyDir(landingPageOutDir, distDir);
} catch (error) {
  console.error("❌ Landing page build failed:", error.message);
  process.exit(1);
}

// Step 3: Build ball-x-pit-companion
console.log("\n🔨 Building BALL X PIT Companion...");
try {
  process.chdir(path.join(rootDir, "projects", "ball-x-pit-companion"));
  execSync("npm run build", { stdio: "inherit" });

  // Copy companion output to dist/ball-x-pit-companion
  console.log("📋 Copying companion to dist/ball-x-pit-companion...");
  const companionDistDir = path.join(distDir, "ball-x-pit-companion");
  fs.mkdirSync(companionDistDir, { recursive: true });
  copyDir(companionOutDir, companionDistDir);
} catch (error) {
  console.error("❌ Companion build failed:", error.message);
  process.exit(1);
}

// Step 4: Create .nojekyll file (required for Next.js static export)
console.log("\n📝 Creating .nojekyll file...");
fs.writeFileSync(path.join(distDir, ".nojekyll"), "");

// Step 5: Publish dist/ to gh-pages branch
console.log("\n🚢 Publishing dist/ to gh-pages branch...");
try {
  process.chdir(rootDir);
  execSync("npx gh-pages -d dist --dotfiles", { stdio: "inherit" });
} catch (error) {
  console.error("❌ gh-pages publish failed:", error.message);
  process.exit(1);
}

// Step 6: Success message
console.log("\n✅ Deployment complete!");
console.log("\nGitHub Pages will serve from:");
console.log("  https://thelysdexicone.github.io/ (landing page)");
console.log(
  "  https://thelysdexicone.github.io/ball-x-pit-companion/ (companion)",
);

/**
 * Helper function to recursively copy directory
 */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source directory not found: ${src}`);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
