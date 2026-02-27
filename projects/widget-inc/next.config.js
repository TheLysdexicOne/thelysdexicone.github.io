/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/widget-inc',
  assetPrefix: '/widget-inc/',
};

module.exports = nextConfig;
