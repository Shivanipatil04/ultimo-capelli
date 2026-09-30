import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
  experimental: {
    optimizePackageImports: ["@react-three/drei", "@react-three/fiber"],
  }
};

export default nextConfig;
