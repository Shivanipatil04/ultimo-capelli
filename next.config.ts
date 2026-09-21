import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile devices on local network to download JS chunks during dev
  allowedDevOrigins: ['192.168.1.13'],
};

export default nextConfig;
