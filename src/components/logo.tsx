import { logoSvg } from "@/lib/ghstore-ui";

/*
 * The "GH." mark — GH Store's logo, and Ahmed Ghawi's monogram. The paths are
 * read from the synced token module rather than copied, so a redraw in GH
 * Store reaches this site with the next `pnpm sync:design`.
 */
const FALLBACK = [
  "M92 22H40L22 40V80L40 98H80V62H54",
  "M122 10V110M182 10V110M122 60H182",
  "M212 86H224L230 92V104L224 110H212L206 104V92Z",
];
const parsed = [...logoSvg().matchAll(/ d="([^"]+)"/g)].map((match) => match[1]);
const [G, H, DOT] = parsed.length === 3 ? parsed : FALLBACK;

/** G and dot take the accent, H the ink — exactly as GH Store draws it. */
export function Logo({
  height = 22,
  draw = false,
  label = "GH.",
}: {
  height?: number;
  /** Draw the strokes in on load, like GH Store's opening splash. */
  draw?: boolean;
  label?: string;
}) {
  const width = Math.round((height * 240) / 120);
  return (
    <svg
      className={draw ? "logo logo--draw" : "logo"}
      width={width}
      height={height}
      viewBox="0 0 240 120"
      role="img"
      aria-label={label}
    >
      <path className="logo__stroke logo__stroke--1" pathLength={1} d={G} fill="none" stroke="var(--accent-text)" strokeWidth={24} />
      <path className="logo__stroke logo__stroke--2" pathLength={1} d={H} fill="none" stroke="var(--ink)" strokeWidth={24} />
      <path className="logo__dot" d={DOT} fill="var(--dot)" />
    </svg>
  );
}
