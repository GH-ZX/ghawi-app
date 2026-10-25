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

/** How many products GH Store has on sale, for the hero. 0 when unknown. */
async function countStoreProducts(): Promise<number> {
  try {
    const response = await fetch("https://gh-store.me/api/catalog", { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return 0;
    const body = (await response.json()) as { products?: unknown[] };
    return Array.isArray(body.products) ? body.products.length : 0;
  } catch {
    return 0;
  }
}

export default async function config(): Promise<NextConfig> {
  const [theme, products] = await Promise.all([resolveStoreTheme(), countStoreProducts()]);

  return {
    // A static marketing site: no request-time page data, no ISR, so Cache
    // Components would only add constraints.
    env: {
      GHSTORE_PRESET: theme.preset,
      GHSTORE_MODE: theme.mode,
      GHSTORE_PRODUCTS: String(products),
    },
    images: {
      formats: ["image/avif", "image/webp"],
    },
    async rewrites() {
      // invite.ghawi.app is the wedding invitation, served from /invite:
      // "/" is the general link, "/haifa" a guest's own. invite.localhost
      // works the same way under `next dev`.
      const invite = [{ type: "host" as const, value: String.raw`invite\.(?:ghawi\.app|localhost)` }];
      // cv.ghawi.app is the CV, served from /resume: "/" in English, "/ar" in
      // Arabic, "/edit" the CV builder. cv.localhost works the same under `next dev`.
      const cv = [{ type: "host" as const, value: String.raw`cv\.(?:ghawi\.app|localhost)` }];
      // boti.ghawi.app is the Plus Store X client panel, served from /boti
      // (its API, /api/boti/*, is reached as is).
      const boti = [{ type: "host" as const, value: String.raw`boti\.(?:ghawi\.app|localhost)` }];
      return {
        beforeFiles: [
          { source: "/", has: boti, destination: "/boti" },
          { source: "/", has: invite, destination: "/invite/general" },
          { source: "/:slug((?!api$|invite$)[a-z0-9][a-z0-9-]*)", has: invite, destination: "/invite/:slug" },
          { source: "/", has: cv, destination: "/resume/en" },
          { source: "/:lang(en|ar)", has: cv, destination: "/resume/:lang" },
          { source: "/edit", has: cv, destination: "/resume/edit" },
          { source: String.raw`/:file(ahmed-ghawi-cv(?:-ar)?\.pdf)`, has: cv, destination: "/cv/:file" },
        ],
        afterFiles: [],
        fallback: [],
      };
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
          // The client panel, on its host or the /boti fallback path.
          source: "/boti",
          headers: [
            { key: "X-Robots-Tag", value: "noindex, nofollow" },
            { key: "Cache-Control", value: "no-store" },
          ],
        },
        {
          source: "/",
          has: [{ type: "host", value: String.raw`boti\.(?:ghawi\.app|localhost)` }],
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
