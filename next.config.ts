import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // ghawi.app is a fully static marketing site: no request-time data, no ISR.
  // Cache Components is therefore unnecessary and only adds constraints.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;

// Lets `next dev` resolve the D1 / R2 / EMAIL bindings defined in wrangler.jsonc.
// No-op when not running against the Cloudflare adapter.
initOpenNextCloudflareForDev();