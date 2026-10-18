import { LOGO_PATH, LOGO_VIEWBOX } from "@/lib/invite-logo";

/** The logo, centred in the 240×240 box at `height` units tall. */
function placed(height: number): string {
  const scale = height / LOGO_VIEWBOX.height;
  const x = 120 - (LOGO_VIEWBOX.width * scale) / 2;
  return `translate(${x.toFixed(2)} ${(120 - height / 2).toFixed(2)}) scale(${scale.toFixed(4)})`;
}

/**
 * The couple's mark as a standalone SVG string, for images rendered off the
 * page (link preview, tab icon, QR cards): the engagement logo, in a fine
 * double ring with four gems unless `ring` is false.
 */
export function monogramSvg({ ink, gold, size = 240, ring = true }: { ink: string; gold: string; size?: number; ring?: boolean }): string {
  const frame = ring
    ? `<circle cx="120" cy="120" r="110" fill="none" stroke="${gold}" stroke-width="1.6"/>` +
      `<circle cx="120" cy="120" r="103" fill="none" stroke="${gold}" stroke-width=".8"/>` +
      `<path fill="${gold}" d="M120 2.5l4.5 7.5-4.5 7.5-4.5-7.5zM120 222.5l4.5 7.5-4.5 7.5-4.5-7.5zM2.5 120l7.5-4.5 7.5 4.5-7.5 4.5zM222.5 120l7.5-4.5 7.5 4.5-7.5 4.5z"/>`
    : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="${size}" height="${size}">` +
    frame +
    `<path fill="${ink}" transform="${placed(ring ? 176 : 228)}" d="${LOGO_PATH}"/>` +
    `</svg>`
  );
}
