import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    // The /api proxy must outlast a sleeping API waking up (default is 30s). Keep in step with lib/http.ts.
    proxyTimeout: 90_000,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }] },
  // The browser talks to the API through this proxy, so auth cookies stay on the same site.
  rewrites: async () => [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
