import {
  SEMANTIC,
  THEMES,
  isPreset,
  type ThemeColors,
  type ThemeMode,
  type ThemePreset,
} from "@/lib/ghstore-ui";

export type { ThemePreset, ThemeMode };
export type DefaultMode = "system" | ThemeMode;

export const PRESETS = Object.keys(THEMES) as ThemePreset[];

const MODES: DefaultMode[] = ["system", "light", "dark"];

/**
 * The look GH Store wears right now, read from gh-store.me/api/config when the
 * site is built (next.config.ts). The preset and its default mode both follow
 * the store, so the two sites always present as one family.
 */
export const storeTheme: { preset: ThemePreset; mode: DefaultMode } = {
  preset: isPreset(process.env.GHSTORE_PRESET) ? process.env.GHSTORE_PRESET : "energetic",
  mode: MODES.includes(process.env.GHSTORE_MODE as DefaultMode)
    ? (process.env.GHSTORE_MODE as DefaultMode)
    : "system",
};

/**
 * GH Store names its fonts ("'Rubik', system-ui"); here the same families are
 * self-hosted by next/font under generated names, exposed as variables.
 */
const FONTS: Record<ThemePreset, { body: string; heading: string }> = {
  calm: { body: "var(--ff-readex)", heading: "var(--ff-readex)" },
  energetic: { body: "var(--ff-rubik)", heading: "var(--ff-rubik)" },
  minimal: { body: "var(--ff-alexandria)", heading: "var(--ff-alexandria)" },
  warm: { body: "var(--ff-tajawal)", heading: "var(--ff-messiri)" },
};

/** The same variable set GH Store's `themeCss` writes, with local font stacks. */
function vars(c: ThemeColors, mode: ThemeMode, preset: ThemePreset): string {
  const s = SEMANTIC[mode];
  const f = FONTS[preset];
  return [
    `--bg:${c.bg}`, `--surface:${c.surface}`, `--surface-2:${c.surface2}`, `--line:${c.line}`,
    `--ink:${c.ink}`, `--muted:${c.muted}`, `--accent:${c.accent}`, `--accent-ink:${c.accentInk}`,
    `--accent-text:${c.accentText}`, `--tile:${c.tile}`, `--dot:${c.dot}`,
    `--good:${s.good}`, `--bad:${s.bad}`, `--warn:${s.warn}`,
    `--font:${f.body},system-ui,sans-serif`,
    `--font-heading:${f.heading},system-ui,sans-serif`,
    `--font-mono:var(--ff-mono),ui-monospace,monospace`,
    // Lets CSS show the right half of a light/dark pair without script.
    `--light-only:${mode === "light" ? "inline-flex" : "none"}`,
    `--dark-only:${mode === "dark" ? "inline-flex" : "none"}`,
    `color-scheme:${mode}`,
  ].join(";");
}

/**
 * Every preset, keyed by `data-preset` on <html>, so the page can switch looks
 * without a reload. Mode works exactly as in GH Store: `data-default` carries
 * the store's default ("system" follows the device) and a visitor's own choice
 * in `data-mode` always wins.
 */
export function presetCss(): string {
  return PRESETS.map((preset) => {
    const t = THEMES[preset];
    const light = vars(t.light, "light", preset);
    const dark = vars(t.dark, "dark", preset);
    const root = `:root[data-preset="${preset}"]`;
    return (
      `${root}{${light}}` +
      `${root}[data-default="dark"]:not([data-mode="light"]),${root}[data-mode="dark"]{${dark}}` +
      `@media (prefers-color-scheme:dark){${root}[data-default="system"]:not([data-mode="light"]){${dark}}}`
    );
  }).join("");
}

/** Browser chrome colour per mode, for the preset the site was built with. */
export function chromeColors(preset: ThemePreset = storeTheme.preset) {
  return { light: THEMES[preset].light.bg, dark: THEMES[preset].dark.bg };
}

/**
 * Runs before first paint: applies a preset picked on the page this session
 * (or `?preset=` for a quick preview) and the visitor's own light/dark choice.
 * Same storage key as GH Store's own mode setting.
 */
export const prePaintScript = `(function(d){try{var P=${JSON.stringify(PRESETS)},q=new URLSearchParams(location.search),p=q.get("preset"),m=q.get("mode");try{if(P.indexOf(p)>-1)sessionStorage.setItem("gh.preset",p);else p=sessionStorage.getItem("gh.preset")}catch(e){}if(P.indexOf(p)>-1)d.setAttribute("data-preset",p);if(m!=="light"&&m!=="dark"){try{m=localStorage.getItem("gh.mode")}catch(e){}}if(m==="light"||m==="dark")d.setAttribute("data-mode",m)}catch(e){}})(document.documentElement)`;
