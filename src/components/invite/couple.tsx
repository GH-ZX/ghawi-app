/**
 * «أحمد ♥ كريمته» — the heart of the invitation: the groom, a heart, and
 * his bride (named only as the admin chooses; her own name never shows).
 */
export function Couple({ groom, bride, className = "", as: Tag = "p" }: { groom: string; bride: string; className?: string; as?: "p" | "h1" }) {
  return (
    <Tag className={`couple ${className}`}>
      <span className="couple__name">{groom}</span>
      <Heart />
      <span className="couple__name">{bride}</span>
    </Tag>
  );
}

export function Heart({ className = "" }: { className?: string }) {
  return (
    <svg className={`heart ${className}`} viewBox="0 0 32 30" role="img" aria-label="و">
      <path d="M16 28.5S2 19.6 2 10.2A7.7 7.7 0 0 1 16 5.6a7.7 7.7 0 0 1 14 4.6c0 9.4-14 18.3-14 18.3z" />
    </svg>
  );
}
