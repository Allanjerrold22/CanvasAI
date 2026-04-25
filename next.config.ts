import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // pdfjs-dist requires the canvas package on the server but we only
    // render PDFs on the client, so alias it to false.
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },
};

export default nextConfig;
