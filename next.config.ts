import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry org/project — set these in CI/CD for source-map uploads
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Silences the Sentry CLI output during builds
  silent: !process.env.CI,

  // Upload source maps only in production builds
  widenClientFileUpload: true,

  // Tree-shake Sentry logger statements from client bundle
  disableLogger: true,

  // Automatically instrument Vercel Cron Monitors
  automaticVercelMonitors: true,
});
