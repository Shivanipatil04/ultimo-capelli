import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile devices on local network to download JS chunks during dev
  allowedDevOrigins: ['192.168.1.13'],
  devIndicators: {
    position: 'bottom-right',
  },
  experimental: {
    turbopack: false,
    optimizePackageImports: ["@react-three/drei", "@react-three/fiber"],
  }
};

export default nextConfig;
