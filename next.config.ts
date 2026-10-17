import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const STORE_CONFIG_URL = "https://gh-store.me/api/config";
const PRESETS = ["calm", "energetic", "minimal", "warm"];
const MODES = ["system", "light", "dark"];

/** GH Store's own defaults (store.config.ts), used when the store can't be reached. */
const FALLBACK = { preset: "energetic", mode: "system" };

/**
 * ghawi.app wears GH Store's design system. Which of its four presets — and
 * whether it defaults to light, dark or the device — is whatever the store's
 * owner last picked in GH Store's admin, read once per build from the store's
 * public config. `GHSTORE_PRESET` / `GHSTORE_MODE` override it, which is handy
 * for previewing a look locally.
 */
async function resolveStoreTheme(): Promise<{ preset: string; mode: string }> {
  const forcedPreset = process.env.GHSTORE_PRESET;
  const forcedMode = process.env.GHSTORE_MODE;
  if (forcedPreset || forcedMode) {
    return {
      preset: PRESETS.includes(forcedPreset ?? "") ? forcedPreset! : FALLBACK.preset,
      mode: MODES.includes(forcedMode ?? "") ? forcedMode! : FALLBACK.mode,
    };
  }

  try {
    const response = await fetch(STORE_CONFIG_URL, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = (await response.json()) as { theme?: { preset?: string; defaultMode?: string } };
    return {
      preset: PRESETS.includes(body.theme?.preset ?? "") ? body.theme!.preset! : FALLBACK.preset,
      mode: MODES.includes(body.theme?.defaultMode ?? "") ? body.theme!.defaultMode! : FALLBACK.mode,
    };
  } catch (error) {
    // Never fail a build over the look; the store's defaults are a safe fallback.
    console.warn(`[ghawi] could not read ${STORE_CONFIG_URL} (${String(error)}); using ${FALLBACK.preset}`);
    return FALLBACK;
  }
}

export default async function config(): Promise<NextConfig> {
  const theme = await resolveStoreTheme();

  return {
    // A static marketing site: no request-time page data, no ISR, so Cache
    // Components would only add constraints.
    env: {
      GHSTORE_PRESET: theme.preset,
      GHSTORE_MODE: theme.mode,
    },
    images: {
      formats: ["image/avif", "image/webp"],
    },
    async redirects() {
      return [
        // Earlier experiments, folded into the one design. Kept so old links land.
        { source: "/film/:lang(en|ar)", destination: "/:lang", permanent: true },
        { source: "/atlas/:lang(en|ar)", destination: "/:lang", permanent: true },
        { source: "/admin/login", destination: "/admin", permanent: false },
      ];
    },
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ],
        },
        {
          // Admin and API surfaces must never be indexed or cached.
          source: "/admin/:path*",
          headers: [
            { key: "X-Robots-Tag", value: "noindex, nofollow" },
            { key: "Cache-Control", value: "no-store" },
          ],
        },
        {
          source: "/api/:path*",
          headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
        },
      ];
    },
  };
}

// Lets `next dev` resolve the D1 / EMAIL bindings defined in wrangler.jsonc.
// No-op when not running against the Cloudflare adapter.
initOpenNextCloudflareForDev();
