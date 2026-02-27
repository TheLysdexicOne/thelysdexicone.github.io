/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/factorio',
  assetPrefix: '/factorio/',
};

module.exports = nextConfig;
