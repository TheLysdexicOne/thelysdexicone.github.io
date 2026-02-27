/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true, // GitHub Pages doesn't support Next.js Image Optimization
  },
  basePath: "/ball-x-pit",
  assetPrefix: "/ball-x-pit/",
};

module.exports = nextConfig;
