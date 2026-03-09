import type { NextConfig } from "next";

const isExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  ...(isExport ? { output: "export" } : {}),
  allowedDevOrigins: [
    "*.replit.dev",
    "*.repl.co",
    "*.replit.app",
    "*.kirk.replit.dev",
    "127.0.0.1",
    "localhost",
  ],
  devIndicators: false,
  ...(!isExport
    ? {
        async redirects() {
          return [
            {
              source: "/",
              destination: "/login",
              permanent: false,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
