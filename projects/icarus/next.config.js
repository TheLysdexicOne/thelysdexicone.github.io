/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/icarus",
  assetPrefix: "/icarus/",
};

module.exports = nextConfig;
