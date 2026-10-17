import { CLASSIC_IDS, CLASSIC_THEMES, type ClassicColors, type ClassicTheme } from "@/lib/classic-themes";
import { SEMANTIC, THEMES, isPreset, type ThemeMode, type ThemePreset } from "@/lib/ghstore-ui";

export type { ThemePreset, ThemeMode, ClassicTheme };
export type DefaultMode = "system" | ThemeMode;

/** Every look the page can wear: GH Store's four presets, then the two classics. */
export type SiteTheme = ThemePreset | ClassicTheme;

export const PRESETS = Object.keys(THEMES) as ThemePreset[];
export const SITE_THEMES: SiteTheme[] = [...PRESETS, ...CLASSIC_IDS];

const MODES: DefaultMode[] = ["system", "light", "dark"];

export const isSiteTheme = (value: unknown): value is SiteTheme =>
  typeof value === "string" && (SITE_THEMES as string[]).includes(value);

/**
 * The look GH Store wears right now, read from gh-store.me/api/config when the
 * site is built (next.config.ts). Unless the admin pins another theme (applied
 * at the edge by worker.ts), the page wears this.
 */
export const storeTheme: { preset: ThemePreset; mode: DefaultMode } = {
  preset: isPreset(process.env.GHSTORE_PRESET) ? process.env.GHSTORE_PRESET : "energetic",
  mode: MODES.includes(process.env.GHSTORE_MODE as DefaultMode)
    ? (process.env.GHSTORE_MODE as DefaultMode)
    : "system",
};

/** Products on sale in GH Store when the site was built (0 when unknown). */
export const storeProducts = Number(process.env.GHSTORE_PRODUCTS) || 0;

/** A theme's colours, whichever family it comes from. */
export function colorsOf(theme: SiteTheme): { light: ClassicColors; dark: ClassicColors } {
  return isPreset(theme) ? THEMES[theme] : CLASSIC_THEMES[theme];
}

export function labelOf(theme: SiteTheme, locale: "en" | "ar"): string {
  return isPreset(theme) ? THEMES[theme].label[locale] : CLASSIC_THEMES[theme].label[locale];
}

/** GH Store presets open in the store's default mode; the classics open dark. */
export function defaultModeOf(theme: SiteTheme): DefaultMode {
  return isPreset(theme) ? storeTheme.mode : CLASSIC_THEMES[theme].defaultMode;
}

/**
 * GH Store names its fonts ("'Rubik', system-ui"); here the same families are
 * self-hosted by next/font under generated names, exposed as variables. The
 * classics put IBM Plex Sans Arabic second so Arabic glyphs have a home.
 */
const FONTS: Record<SiteTheme, { body: string; heading: string }> = {
  calm: { body: "var(--ff-readex)", heading: "var(--ff-readex)" },
  energetic: { body: "var(--ff-rubik)", heading: "var(--ff-rubik)" },
  minimal: { body: "var(--ff-alexandria)", heading: "var(--ff-alexandria)" },
  warm: { body: "var(--ff-tajawal)", heading: "var(--ff-messiri)" },
  nocturne: { body: "var(--ff-inter),var(--ff-plex-ar)", heading: "var(--ff-space),var(--ff-plex-ar)" },
  ember: { body: "var(--ff-inter),var(--ff-plex-ar)", heading: "var(--ff-space),var(--ff-plex-ar)" },
};

/** The same variable set GH Store's `themeCss` writes, with local font stacks. */
function vars(c: ClassicColors, mode: ThemeMode, theme: SiteTheme): string {
  const s = SEMANTIC[mode];
  const f = FONTS[theme];
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
 * Every theme, keyed by `data-preset` on <html>, so the page can switch looks
 * without a reload. Mode works exactly as in GH Store: `data-default` carries
 * the theme's default ("system" follows the device) and a visitor's own choice
 * in `data-mode` always wins.
 */
export function presetCss(): string {
  return SITE_THEMES.map((theme) => {
    const c = colorsOf(theme);
    const light = vars(c.light, "light", theme);
    const dark = vars(c.dark, "dark", theme);
    const root = `:root[data-preset="${theme}"]`;
    return (
      `${root}{${light}}` +
      `${root}[data-default="dark"]:not([data-mode="light"]),${root}[data-mode="dark"]{${dark}}` +
      `@media (prefers-color-scheme:dark){${root}[data-default="system"]:not([data-mode="light"]){${dark}}}`
    );
  }).join("");
}

/** Browser chrome colour per mode, for the preset the site was built with. */
export function chromeColors(theme: SiteTheme = storeTheme.preset) {
  const c = colorsOf(theme);
  return { light: c.light.bg, dark: c.dark.bg };
}

/**
 * Runs before first paint. `data-site` holds the site's own theme (the build's
 * GH Store preset, or the admin's pick, set at the edge). A preview picked on
 * the page this session — or `?preset=` — overrides it, with that theme's
 * default mode; the visitor's own light/dark choice wins over both. Same
 * storage keys as GH Store.
 */
export const prePaintScript = `(function(d){try{var D=${JSON.stringify(
  Object.fromEntries(SITE_THEMES.map((t) => [t, defaultModeOf(t)])),
)},q=new URLSearchParams(location.search),p=q.get("preset"),m=q.get("mode");try{if(D[p])sessionStorage.setItem("gh.preset",p);else p=sessionStorage.getItem("gh.preset")}catch(e){}if(D[p]&&p!==d.getAttribute("data-site")){d.setAttribute("data-preset",p);d.setAttribute("data-default",D[p])}if(m!=="light"&&m!=="dark"){try{m=localStorage.getItem("gh.mode")}catch(e){}}if(m==="light"||m==="dark")d.setAttribute("data-mode",m)}catch(e){}})(document.documentElement)`;

/** Same map, for the client helpers. */
export const DEFAULT_MODES = Object.fromEntries(SITE_THEMES.map((t) => [t, defaultModeOf(t)])) as Record<
  SiteTheme,
  DefaultMode
>;
