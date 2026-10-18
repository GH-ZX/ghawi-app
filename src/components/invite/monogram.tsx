import { LOGO_PATH, LOGO_VIEWBOX } from "@/lib/invite-logo";

type Props = {
  /** An uploaded logo replaces the couple's mark everywhere. */
  logoUrl?: string | null;
  /** Leave out the ring, e.g. on the wax seal. */
  bare?: boolean;
  className?: string;
  label?: string;
};

/** The logo, centred in the 240×240 box at `height` units tall. */
export function logoTransform(height: number): string {
  const scale = height / LOGO_VIEWBOX.height;
  const x = 120 - (LOGO_VIEWBOX.width * scale) / 2;
  const y = 120 - height / 2;
  return `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)})`;
}

/**
 * The couple's mark: their engagement logo — أ and إ as two interlaced
 * alefs — inside a fine double ring with four small gems. Bare, it is the
 * logo alone (on the wax seal). It always appears whole.
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
      <path className="mono__logo" d={LOGO_PATH} transform={logoTransform(bare ? 224 : 176)} />
    </svg>
  );
}
