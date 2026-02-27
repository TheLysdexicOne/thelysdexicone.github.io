/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/kingdom-come-deliverance-ii",
  assetPrefix: "/kingdom-come-deliverance-ii/",
};

module.exports = nextConfig;
