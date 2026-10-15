import {
  Instrument_Serif,
  Noto_Kufi_Arabic,
  Noto_Sans_Arabic,
  Plus_Jakarta_Sans,
} from "next/font/google";

/**
 * Fonts for the Film design.
 *
 * Deliberately disjoint from the grid site (Space Grotesk / Inter / JetBrains
 * Mono / IBM Plex Sans Arabic). Nothing is shared — a serif title-card face
 * replaces the grotesk, Plus Jakarta replaces Inter, and the Arabic pairing is
 * Kufi + Naskh rather than Plex, so the two designs do not read as one system
 * recoloured.
 */

/** Title-card display. Regular weight only upstream; sized for impact. */
export const filmDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--film-display",
  display: "swap",
});

/** Body copy and interface. Variable, so long-form text stays optically even. */
export const filmBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--film-body",
  display: "swap",
});

/** Arabic display — geometric Kufi, a different skeleton to the Latin serif. */
export const filmDisplayAr = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--film-display-ar",
  display: "swap",
});

/** Arabic body. */
export const filmBodyAr = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--film-body-ar",
  display: "swap",
});

export const filmFontVariables = [
  filmDisplay.variable,
  filmBody.variable,
  filmDisplayAr.variable,
  filmBodyAr.variable,
].join(" ");