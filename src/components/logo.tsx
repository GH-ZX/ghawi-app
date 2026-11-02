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

/*
 * "GHAWI." — the GH. mark spelled out, drawn on the same 120-unit grid with
 * the same 24-unit strokes and cut corners. G and dot take the accent, the
 * rest the ink, as in the mark. The hero shows it in place of a portrait.
 */
// From the fixed grid (not the synced paths), so the spelled-out letters always line up.
const WORD = [
  { d: FALLBACK[0], accent: true },
  { d: FALLBACK[1] },
  { d: "M224 110V40L242 22H266L284 40V110M224 66H284" },
  { d: "M326 10V80L344 98H396L414 80V10M370 98V40" },
  { d: "M456 10V110" },
];
const WORD_DOT = "M486 86H498L504 92V104L498 110H486L480 104V92Z";

export function Wordmark({ draw = false, label = "Ghawi", className = "" }: { draw?: boolean; label?: string; className?: string }) {
  return (
    <svg className={`logo ${draw ? "logo--draw" : ""} ${className}`} viewBox="0 0 514 120" role="img" aria-label={label}>
      {WORD.map((letter, i) => (
        <path
          key={i}
          className="logo__stroke"
          style={draw ? { animationDelay: `${0.1 + i * 0.12}s` } : undefined}
          pathLength={1}
          d={letter.d}
          fill="none"
          stroke={letter.accent ? "var(--accent-text)" : "var(--ink)"}
          strokeWidth={24}
        />
      ))}
      <path className="logo__dot" style={draw ? { animationDelay: "0.82s" } : undefined} d={WORD_DOT} fill="var(--dot)" />
    </svg>
  );
}
