import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
      dangerouslyAllowSVG: true,
    remotePatterns: [
        {
        protocol: "https",
        hostname: "*",// to allow all domains
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      }
    ],
  },
};

export default nextConfig;


