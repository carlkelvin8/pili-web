import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "bxwsxgcuvpmaczdemhot.supabase.co",
      },
    ],
  },
};

export default nextConfig;
