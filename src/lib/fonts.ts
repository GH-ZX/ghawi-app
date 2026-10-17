import {
  Alexandria,
  El_Messiri,
  IBM_Plex_Sans_Arabic,
  Inter,
  JetBrains_Mono,
  Readex_Pro,
  Rubik,
  Space_Grotesk,
  Tajawal,
} from "next/font/google";

/*
 * One family per GH Store preset (see THEMES in ghstore-ui.ts), self-hosted
 * through next/font instead of GH Store's Google Fonts link. Every family here
 * carries Arabic and Latin, so mixed-script lines need no fallback rules.
 *
 * Only Rubik is preloaded: it belongs to "energetic", GH Store's default look.
 * The others are declared but cost nothing until a preset actually uses them —
 * browsers only download a face that rendered text asks for.
 */

export const rubik = Rubik({
  subsets: ["latin", "arabic"],
  variable: "--ff-rubik",
  display: "swap",
});

export const readex = Readex_Pro({
  subsets: ["latin", "arabic"],
  variable: "--ff-readex",
  display: "swap",
  preload: false,
});

export const alexandria = Alexandria({
  subsets: ["latin", "arabic"],
  variable: "--ff-alexandria",
  display: "swap",
  preload: false,
});

/** Not variable upstream; these are the weights GH Store loads. */
export const tajawal = Tajawal({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--ff-tajawal",
  display: "swap",
  preload: false,
});

/** Headings in the "warm" preset. */
export const messiri = El_Messiri({
  subsets: ["latin", "arabic"],
  variable: "--ff-messiri",
  display: "swap",
  preload: false,
});

/** Numbers, prices, codes — GH Store's MONO_FONT. */
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--ff-mono",
  display: "swap",
  preload: false,
});

/* The classic themes (Nocturne, Ember) keep the original ghawi.app faces:
   Space Grotesk headings, Inter text, IBM Plex Sans Arabic for Arabic glyphs. */
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--ff-space",
  display: "swap",
  preload: false,
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--ff-inter",
  display: "swap",
  preload: false,
});

/** Not variable upstream. */
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-plex-ar",
  display: "swap",
  preload: false,
});

export const fontVariables = [rubik, readex, alexandria, tajawal, messiri, mono, spaceGrotesk, inter, plexArabic]
  .map((font) => font.variable)
  .join(" ");
