/**
 * Pulls GH Store's design tokens into this site.
 *
 *   pnpm sync:design                     # from GitHub (GH-ZX/ghstore, main)
 *   pnpm sync:design ../GHSTORE-RE/ghstore   # from a local checkout
 *
 * GH Store keeps its four theme presets, the logo geometry and the theme CSS
 * builder in `packages/ui/src/index.ts`. This copies that file verbatim to
 * `src/lib/ghstore-ui.ts`, so both sites read the same source rather than two
 * hand-maintained palettes. Review the diff, then commit it.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const UPSTREAM = "https://raw.githubusercontent.com/GH-ZX/ghstore/main/packages/ui/src/index.ts";
const TARGET = new URL("../src/lib/ghstore-ui.ts", import.meta.url);

const local = process.argv[2];
let source;
let origin;

if (local) {
  origin = join(local, "packages/ui/src/index.ts");
  source = await readFile(origin, "utf8");
} else {
  origin = UPSTREAM;
  const response = await fetch(UPSTREAM, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) {
    console.error(`could not fetch ${UPSTREAM}: ${response.status}`);
    process.exit(1);
  }
  source = await response.text();
}

// A cheap guard against syncing something that is not the token module.
for (const name of ["THEMES", "SEMANTIC", "logoSvg", "themeCss"]) {
  if (!source.includes(name)) {
    console.error(`${origin} does not export ${name}; refusing to overwrite`);
    process.exit(1);
  }
}

const header = `// ---------------------------------------------------------------------------
// Synced from GH Store (github.com/GH-ZX/ghstore, packages/ui/src/index.ts).
// Do not edit here: change it in GH Store, then run \`pnpm sync:design\`.
// ---------------------------------------------------------------------------

`;

await writeFile(TARGET, header + source.trimEnd() + "\n");
console.log(`synced ${origin} -> src/lib/ghstore-ui.ts`);
