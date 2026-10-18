/*
 * Two small drawings for the invitation, in the theme's colours:
 *
 *   ContractMark — the marriage contract (عقد القران): a scroll with
 *   rolled ends, lines of writing, a wax seal and a quill.
 *
 *   CoupleSilhouette — the newlyweds as a plain black silhouette, no faces:
 *   the groom in a suit, the bride in a hijab and a long dress, hand in
 *   hand, a small heart above their joined hands.
 */

export function ContractMark({ caption }: { caption: string }) {
  return (
    <figure className="contract" data-reveal>
      <svg className="contract__mark" viewBox="0 0 170 150" role="img" aria-label="عقد القران">
        {/* the sheet */}
        <rect className="contract__sheet" x="34" y="26" width="102" height="94" />
        {/* lines of writing: a short title line, then the text */}
        <path className="contract__title" d="M68 42h34" />
        <path
          className="contract__lines"
          d="M48 56h74M52 66h66M48 76h74M56 86h58M48 96h40"
        />
        {/* rolled ends */}
        <rect className="contract__roll" x="24" y="14" width="122" height="15" rx="7.5" />
        <rect className="contract__roll" x="24" y="117" width="122" height="15" rx="7.5" />
        <circle className="contract__knob" cx="24" cy="21.5" r="4" />
        <circle className="contract__knob" cx="146" cy="21.5" r="4" />
        <circle className="contract__knob" cx="24" cy="124.5" r="4" />
        <circle className="contract__knob" cx="146" cy="124.5" r="4" />
        {/* wax seal with ribbon tails */}
        <path className="contract__ribbon" d="M104 104l-7 26 7-5 5 7 3-26zM114 104l5 27 3-8 7 3-6-24z" />
        <circle className="contract__seal" cx="110" cy="100" r="12.5" />
        <circle className="contract__seal-ring" cx="110" cy="100" r="8.5" />
        <path className="contract__seal-heart" d="M110 104.5s-5-3.2-5-6.6a2.7 2.7 0 0 1 5-1.6 2.7 2.7 0 0 1 5 1.6c0 3.4-5 6.6-5 6.6z" />
        {/* quill, laid across the corner */}
        <path className="contract__quill" d="M158 4c-14 6-36 26-50 52l3 1.6C126 32 146 14 158 4z" />
        <path className="contract__quill-spine" d="M158 4c-16 12-34 32-48.5 53" />
        <path className="contract__nib" d="M108 56l-3.5 7 5.5-5.4z" />
      </svg>
      {caption ? <figcaption className="contract__caption">{caption}</figcaption> : null}
    </figure>
  );
}

export function CoupleSilhouette() {
  return (
    <figure className="pair" data-reveal>
      <svg className="pair__mark" viewBox="0 0 200 230" role="img" aria-label="العروسان">
        <ellipse className="pair__ground" cx="100" cy="214" rx="78" ry="5" />
        <g className="pair__ink">
          {/* the bride, centred on x = 72: hijab over head and shoulders, a fitted
              bodice, a long dress flaring to the hem with a short train behind */}
          <path d="M72 30C62 30 55 38 55 48c0 6 2 11 5 15-6 4-9 10-9 17h42c0-7-3-13-9-17 3-4 5-9 5-15 0-10-7-18-17-18z" />
          <path d="M58 78h28c4 0 7 3 7 7l-3 29c-4 2-10 3-18 3s-14-1-18-3l-3-29c0-4 3-7 7-7z" />
          <path d="M56 110c-6 30-18 65-34 98 22 6 64 6 92 0-10-33-20-68-26-98z" />
          {/* her bouquet, held at the waist */}
          <circle cx="54" cy="116" r="6" />
          <circle cx="47" cy="121" r="5" />
          <circle cx="58" cy="123" r="5" />
          {/* her hand reaching for his */}
          <path d="M88 84c6 8 10 20 12 32l-5 2c-2-12-6-22-11-30z" />

          {/* the groom: head, suit jacket, trousers */}
          <circle cx="128" cy="38" r="13" />
          <path d="M122 52h12v8h-12z" />
          <path d="M110 64c2-4 6-6 10-6h16c4 0 8 2 10 6l4 62c-12 4-30 4-42 0z" />
          <path d="M112 124h15l-2 86h-10zM129 124h15l-1 86h-10z" />
          <path d="M112 206h14l2 6h-17zM133 206h11l3 6h-16z" />
          {/* his arm, down to her hand */}
          <path d="M112 66c-6 14-10 30-12 48l5 2c3-17 7-31 12-44z" />
        </g>
        {/* shirt and bow tie, the only light on the suit */}
        <path className="pair__shirt" d="M124 58h8l-4 18z" />
        <path className="pair__tie" d="M128 61.5l-4-2.5v5zM128 61.5l4-2.5v5z" />
        {/* a small heart above their joined hands */}
        <path className="pair__heart" d="M98 102s-7-4.4-7-9.2a3.8 3.8 0 0 1 7-2.2 3.8 3.8 0 0 1 7 2.2c0 4.8-7 9.2-7 9.2z" />
      </svg>
    </figure>
  );
}
