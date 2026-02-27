/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/blue-prince',
  assetPrefix: '/blue-prince/',
};

module.exports = nextConfig;
