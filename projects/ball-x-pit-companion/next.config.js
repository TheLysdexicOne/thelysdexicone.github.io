/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // GitHub Pages doesn't support Next.js Image Optimization
  },
  // Only use basePath and assetPrefix in production (GitHub Pages)
  ...(isProd && {
    basePath: '/ball-x-pit-companion',
    assetPrefix: '/ball-x-pit-companion/',
  }),
};

module.exports = nextConfig;
