/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/conan-exiles-enhanced",
  assetPrefix: "/conan-exiles-enhanced/",
};

module.exports = nextConfig;
