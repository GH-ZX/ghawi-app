import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cloudflare / OpenNext build artefacts — generated, never hand-edited.
    ".open-next/**",
    ".wrangler/**",
    "worker-configuration.d.ts",
    // Synced verbatim from GH Store (scripts/sync-design.mjs); linted there.
    "src/lib/ghstore-ui.ts",
  ]),
]);

export default eslintConfig;
