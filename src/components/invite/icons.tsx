import type { RuleIcon } from "@/lib/invite";

/* Thin line icons for the gentle requests. Strokes follow currentColor. */

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const PATHS: Record<RuleIcon, string> = {
  // A small child, gently crossed out.
  child: "M16 9.5a2.5 2.5 0 1 0 0-.01M12 22l1.5-6.5h5L20 22M13.5 15.5l-3-2M18.5 15.5l3-2M14 22v4M18 22v4M6 6l20 20",
  // A hookah, crossed out.
  smoke: "M16 4v3M14 7h4l-1 5h-2zM13 12h6M16 12v5M12 21a4 4 0 0 0 8 0c0-2-1.5-3.5-4-4-2.5.5-4 2-4 4zM20 20c2 0 3 1 4 3M6 6l20 20",
  heart: "M16 25s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.4-9 12-9 12z",
  clock: "M16 6a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM16 10v6l4 2",
  camera: "M6 11h4l2-3h8l2 3h4v13H6zM16 13.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  gift: "M7 13h18v4H7zM8 17h16v8H8zM16 13v12M16 13c-2-4-6-4-6-1.5S14 13 16 13c2 0 6 0 6-1.5S18 9 16 13z",
};

export function RuleIconSvg({ icon }: { icon: RuleIcon }) {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30">
      <path d={PATHS[icon]} {...common} />
    </svg>
  );
}
