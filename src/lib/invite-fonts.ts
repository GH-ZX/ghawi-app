import { Amiri, Aref_Ruqaa, Cairo, El_Messiri, IBM_Plex_Sans_Arabic, Marhey, Reem_Kufi, Tajawal } from "next/font/google";

/*
 * Every face the invitation can wear. Admin → Invitation → Font picks a
 * pairing (INVITE_FONTS in lib/invite.ts); invite.css maps each pairing to
 * these variables. Only the default pairing is preloaded — a browser
 * downloads a face only when rendered text asks for it.
 */

export const amiri = Amiri({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--f-amiri", display: "swap" });
export const ruqaa = Aref_Ruqaa({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--f-ruqaa", display: "swap" });
export const plex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--f-plex",
  display: "swap",
});

export const messiri = El_Messiri({ subsets: ["arabic", "latin"], variable: "--f-messiri", display: "swap", preload: false });
export const reemKufi = Reem_Kufi({ subsets: ["arabic", "latin"], variable: "--f-kufi", display: "swap", preload: false });
export const marhey = Marhey({ subsets: ["arabic", "latin"], variable: "--f-marhey", display: "swap", preload: false });
export const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--f-cairo", display: "swap", preload: false });
export const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--f-tajawal",
  display: "swap",
  preload: false,
});

export const inviteFontVariables = [amiri, ruqaa, plex, messiri, reemKufi, marhey, cairo, tajawal].map((font) => font.variable).join(" ");
