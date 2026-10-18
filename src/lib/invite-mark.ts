import { ALEF_LEFT, ALEF_RIGHT, HAMZA_ABOVE, HAMZA_BELOW } from "@/lib/invite-monogram";

/** The أ إ monogram as a standalone SVG string, for images rendered off the page. */
export function monogramSvg({ ink, gold, size = 240, ring = true }: { ink: string; gold: string; size?: number; ring?: boolean }): string {
  const frame = ring
    ? `<circle cx="120" cy="120" r="110" fill="none" stroke="${gold}" stroke-width="1.6"/>` +
      `<circle cx="120" cy="120" r="103" fill="none" stroke="${gold}" stroke-width=".8"/>` +
      `<path fill="${gold}" d="M120 2.5l4.5 7.5-4.5 7.5-4.5-7.5zM120 222.5l4.5 7.5-4.5 7.5-4.5-7.5zM2.5 120l7.5-4.5 7.5 4.5-7.5 4.5zM222.5 120l7.5-4.5 7.5 4.5-7.5 4.5z"/>`
    : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="${size}" height="${size}">` +
    frame +
    `<path fill="${ink}" d="${ALEF_RIGHT}"/><path fill="${ink}" d="${HAMZA_ABOVE}"/>` +
    `<path fill="${ink}" d="${ALEF_LEFT}"/><path fill="${ink}" d="${HAMZA_BELOW}"/>` +
    `<path fill="${gold}" d="M120 109.5l2.4 8.1 8.1 2.4-8.1 2.4-2.4 8.1-2.4-8.1-8.1-2.4 8.1-2.4z"/>` +
    `</svg>`
  );
}
