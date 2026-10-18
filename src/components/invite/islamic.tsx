/*
 * Two marks of an Islamic wedding, drawn for the invitation:
 *
 *   VerseCartouche — the verse of affection and mercy (الروم ٢١) in a
 *   cartouche with pointed ogee ends, as on the title of a manuscript.
 *
 *   BlessingRosette — an eight-pointed star (two squares interlaced, the
 *   khatam), holding two interlocked rings, over the Prophet's blessing for
 *   a newly married couple.
 *
 * Strokes and fills follow the theme's gold, ink and paper.
 */

export function VerseCartouche({ text, cite }: { text: string; cite: string }) {
  return (
    <figure className="verse" data-reveal>
      <div className="verse__frame">
        <OgeeCap className="verse__cap verse__cap--start" />
        <blockquote className="verse__text">
          <span aria-hidden="true">﴿</span>
          {text}
          <span aria-hidden="true">﴾</span>
        </blockquote>
        <OgeeCap className="verse__cap verse__cap--end" />
      </div>
      {cite ? <figcaption className="verse__cite">{cite}</figcaption> : null}
    </figure>
  );
}

/** One pointed end of the cartouche; stretches to the frame's height. */
function OgeeCap({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 34 120" preserveAspectRatio="none" aria-hidden="true">
      <path className="verse__cap-fill" d="M34 1H24C15 1 11 31 2 60c9 29 13 59 22 59h10z" />
      <path className="verse__cap-line" d="M34 1H24C15 1 11 31 2 60c9 29 13 59 22 59h10" />
      <path className="verse__cap-line verse__cap-line--thin" d="M34 7H26C19 7 16 34 9 60c7 26 10 53 17 53h8" />
    </svg>
  );
}

/** 16 vertices of an eight-pointed star of two squares, outer radius r. */
function star(r: number, cx = 100, cy = 100): string {
  const inner = r * (Math.SQRT1_2 / Math.cos(Math.PI / 8));
  return Array.from({ length: 16 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 8;
    const radius = i % 2 === 0 ? r : inner;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}

const TIPS = Array.from({ length: 8 }, (_, i) => {
  const angle = -Math.PI / 2 + (i * Math.PI) / 4;
  return [100 + 97 * Math.cos(angle), 100 + 97 * Math.sin(angle)];
});

export function BlessingRosette({ text }: { text: string }) {
  return (
    <figure className="rosette" data-reveal>
      <svg className="rosette__mark" viewBox="0 0 200 200" role="img" aria-label="خاتمٌ ثماني يحمل خاتمَي الزواج">
        <polygon className="rosette__star" points={star(92)} />
        <polygon className="rosette__star rosette__star--inner" points={star(82)} />
        <circle className="rosette__circle" cx="100" cy="100" r="48" />
        <circle className="rosette__circle rosette__circle--dots" cx="100" cy="100" r="55" />
        {TIPS.map(([x, y], i) => (
          <circle key={i} className="rosette__tip" cx={x.toFixed(2)} cy={y.toFixed(2)} r="2.6" />
        ))}

        {/* Two rings, interlocked: drawn left then right, so the right ring lies
            over the left at the bottom; a short arc of the left ring, with a
            paper-coloured gap under it, lies over the right at the top. */}
        <g className="rosette__rings">
          <circle cx="89" cy="105" r="17" />
          <circle cx="111" cy="105" r="17" />
          <path className="rosette__over-gap" d="M96.18 89.59A17 17 0 0 1 102.93 95.25" />
          <path d="M96.18 89.59A17 17 0 0 1 102.93 95.25" />
        </g>
        <path className="rosette__gem" d="M89 80.5l5.2 5.5-5.2 5.5-5.2-5.5z" />
      </svg>
      <figcaption className="rosette__text">{text}</figcaption>
    </figure>
  );
}
