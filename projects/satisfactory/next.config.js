/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/satisfactory',
  assetPrefix: '/satisfactory/',
};

module.exports = nextConfig;
