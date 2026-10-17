/*
 * The two classic ghawi.app themes, rebuilt in GH Store's token format so they
 * sit beside its four presets. Dependency-free on purpose: the edge Worker
 * (worker.ts) imports this to switch the live theme without a redeploy.
 *
 * Both were dark-only originally; each now has a light half so the visitor's
 * mode toggle works, and both open dark by default.
 */

export type ClassicTheme = "nocturne" | "ember";

export interface ClassicColors {
  bg: string;
  surface: string;
  surface2: string;
  line: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  accentText: string;
  tile: string;
  dot: string;
}

export const CLASSIC_THEMES: Record<
  ClassicTheme,
  { label: { en: string; ar: string }; note: string; defaultMode: "dark"; light: ClassicColors; dark: ClassicColors }
> = {
  nocturne: {
    label: { en: "Nocturne", ar: "ليلي" },
    note: "The original look: near-black, hairline grid, lime signal.",
    defaultMode: "dark",
    dark: { bg: "#07080A", surface: "#0E1114", surface2: "#151A1F", line: "#222A31", ink: "#EDF0F2", muted: "#9BA5AD", accent: "#D4FF3F", accentInk: "#0A0C05", accentText: "#D4FF3F", tile: "#1A2111", dot: "#D4FF3F" },
    light: { bg: "#F6F7F2", surface: "#FFFFFF", surface2: "#EEF0E8", line: "#DDE1D4", ink: "#0D0F0A", muted: "#565D50", accent: "#C8F23A", accentInk: "#0D0F0A", accentText: "#476600", tile: "#EDF6CF", dot: "#5A8200" },
  },
  ember: {
    label: { en: "Ember", ar: "جمر" },
    note: "Forge-warm black, molten copper, drifting heat and film grain.",
    defaultMode: "dark",
    dark: { bg: "#0C0907", surface: "#15100C", surface2: "#1E1611", line: "#2E231B", ink: "#FBF3EC", muted: "#C2ADA0", accent: "#FF8A3D", accentInk: "#1A0C03", accentText: "#FFA868", tile: "#2B1A10", dot: "#FF8A3D" },
    light: { bg: "#FBF6F1", surface: "#FFFFFF", surface2: "#F5ECE3", line: "#EBDACB", ink: "#22150D", muted: "#76604F", accent: "#BF5317", accentInk: "#FFFFFF", accentText: "#A9470F", tile: "#FBE6D6", dot: "#D9601F" },
  },
};

export const CLASSIC_IDS = Object.keys(CLASSIC_THEMES) as ClassicTheme[];

/** GH Store's preset ids (see ghstore-ui.ts), repeated so this file stays import-free. */
export const GHSTORE_IDS = ["calm", "energetic", "minimal", "warm"] as const;

/** Every value the admin may store under `site_theme`. "ghstore" follows the store. */
export const SITE_THEME_CHOICES = ["ghstore", ...GHSTORE_IDS, ...CLASSIC_IDS] as const;
export type SiteThemeChoice = (typeof SITE_THEME_CHOICES)[number];

export const isSiteThemeChoice = (value: unknown): value is SiteThemeChoice =>
  typeof value === "string" && (SITE_THEME_CHOICES as readonly string[]).includes(value);
