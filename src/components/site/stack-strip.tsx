import { stackStrip } from "@/lib/content";

/** The tools in daily use, drifting past under the hero. Decorative: the
 *  same names appear in About's stack. Pauses on hover; still under reduced motion. */
export function StackStrip() {
  const items = [...stackStrip, ...stackStrip];
  return (
    <div className="strip" aria-hidden="true" dir="ltr">
      <div className="strip__track">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="strip__item">
            <span className="strip__dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
