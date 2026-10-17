import Image from "next/image";
import type { Dictionary, Locale } from "@/lib/content";

/*
 * Real screenshots of gh-store.me (public/media/store), captured at retina
 * size in both languages and both modes. The page shows the store in its own
 * language, and swaps light/dark with the page; the hidden half is a lazy
 * image that never loads.
 */

const MODES = ["light", "dark"] as const;

export function StoreShots({ shots, locale }: { shots: Dictionary["store"]["shots"]; locale: Locale }) {
  return (
    <div className="shots" dir="ltr">
      <span className="shots__glow" aria-hidden="true" />

      <figure className="browser-shot">
        <div className="browser-shot__bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span className="browser-shot__url">
            <span className="live-dot" />
            gh-store.me
          </span>
        </div>
        {MODES.map((mode) => (
          <span key={mode} className={`shot-swap when-${mode}`}>
            <Image
              src={`/media/store/desktop-${locale}-${mode}.webp`}
              alt={shots.desktop}
              width={2000}
              height={1250}
              sizes="(max-width: 1100px) 92vw, 1000px"
            />
          </span>
        ))}
      </figure>

      <figure className="phone-shot">
        {MODES.map((mode) => (
          <span key={mode} className={`shot-swap when-${mode}`}>
            <Image
              src={`/media/store/mobile-${locale}-${mode}.webp`}
              alt={shots.mobile}
              width={780}
              height={1688}
              sizes="(max-width: 640px) 34vw, 240px"
            />
          </span>
        ))}
      </figure>
    </div>
  );
}
