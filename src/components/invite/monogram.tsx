import { ALEF_LEFT, ALEF_RIGHT, HAMZA_ABOVE, HAMZA_BELOW } from "@/lib/invite-monogram";

type Props = {
  /** An uploaded logo replaces the drawn monogram everywhere. */
  logoUrl?: string | null;
  /** Leave out the ring, e.g. on the wax seal. */
  bare?: boolean;
  className?: string;
  label?: string;
};

/**
 * أ إ — the two letters mirror each other: the hamza sits above Ahmed's
 * alef and below his bride's. A fine double ring holds them, with a small
 * four-pointed star where they meet. It appears whole, never piece by piece.
 */
export function Monogram({ logoUrl, bare = false, className = "", label = "أ إ" }: Props) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- an uploaded file of any size, served from D1
    return <img className={`mono mono--img ${className}`} src={logoUrl} alt={label} />;
  }

  return (
    <svg className={`mono ${className}`} viewBox="0 0 240 240" role="img" aria-label={label}>
      {bare ? null : (
        <g className="mono__frame">
          <circle cx="120" cy="120" r="110" />
          <circle cx="120" cy="120" r="103" className="mono__thin" />
          <path className="mono__gem" d="M120 2.5l4.5 7.5-4.5 7.5-4.5-7.5zM120 222.5l4.5 7.5-4.5 7.5-4.5-7.5zM2.5 120l7.5-4.5 7.5 4.5-7.5 4.5zM222.5 120l7.5-4.5 7.5 4.5-7.5 4.5z" />
        </g>
      )}
      <g className="mono__letters">
        <path d={ALEF_RIGHT} />
        <path d={HAMZA_ABOVE} />
        <path d={ALEF_LEFT} />
        <path d={HAMZA_BELOW} />
      </g>
      <path className="mono__star" d="M120 109.5l2.4 8.1 8.1 2.4-8.1 2.4-2.4 8.1-2.4-8.1-8.1-2.4 8.1-2.4z" />
    </svg>
  );
}
