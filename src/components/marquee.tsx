import { marqueeItems } from "@/lib/content";

export function Marquee({ reverse = false }: { reverse?: boolean }) {
  const row = [...marqueeItems, ...marqueeItems];

  return (
    <div
      className="marquee relative flex overflow-hidden border-y border-line bg-bg-1 py-3.5"
      aria-hidden="true"
    >
      {/* Fade the ends so items enter and leave softly */}
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-bg-1 to-transparent rtl:bg-gradient-to-l" />
      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-bg-1 to-transparent rtl:bg-gradient-to-r" />

      <div className="marquee-track" data-reverse={reverse ? "true" : "false"}>
        {row.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center">
            <span className="mono px-5 text-[11px] tracking-[0.16em] whitespace-nowrap text-fg-3 uppercase">
              {item}
            </span>
            <span className="size-1 rotate-45 bg-acc/60" />
          </span>
        ))}
      </div>
    </div>
  );
}