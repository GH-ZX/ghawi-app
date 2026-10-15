import {
  Instrument_Sans,
  Noto_Kufi_Arabic,
  Noto_Naskh_Arabic,
  Archivo,
} from "next/font/google";

/**
 * Fonts for the Atlas design.
 *
 * Disjoint from both existing designs: Grid uses Space Grotesk / Inter /
 * JetBrains Mono, Film uses Instrument Serif / Plus Jakarta. Atlas is a light
 * editorial pairing — Archivo's tight, slightly condensed grotesk against
 * Instrument Sans, which is closer to a text face than Plus Jakarta is.
 */

/** Display. Wide weight axis lets headings go heavy without a second family. */
export const atlasDisplay = Archivo({
  subsets: ["latin"],
  variable: "--atlas-display",
  display: "swap",
});

/** Body and UI. */
export const atlasBody = Instrument_Sans({
  subsets: ["latin"],
  variable: "--atlas-body",
  display: "swap",
});

/** Arabic display. */
export const atlasDisplayAr = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--atlas-display-ar",
  display: "swap",
});

/** Arabic body. Naskh reads better than the sans at paragraph length. */
export const atlasBodyAr = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--atlas-body-ar",
  display: "swap",
});

export const atlasFontVariables = [
  atlasDisplay.variable,
  atlasBody.variable,
  atlasDisplayAr.variable,
  atlasBodyAr.variable,
].join(" ");