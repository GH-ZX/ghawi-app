import type { Copy } from "@/lib/content";

/**
 * A "deployed properties" board — the kind of panel a sysadmin keeps open.
 * Rows are static facts about the properties, not a live uptime feed.
 */
export function PropertiesBoard({ t }: { t: Copy["board"] }) {
  return (
    <aside className="relative border border-line bg-bg-1/70 backdrop-blur-sm">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="eyebrow">{t.title}</span>
        <span className="mono flex items-center gap-1.5 text-[10px] tracking-[0.14em] text-acc uppercase">
          <span className="pulse-dot" aria-hidden="true" />
          {t.live}
        </span>
      </div>

      {/* Rows */}
      <ul className="divide-y divide-line">
        {t.rows.map((row) => (
          <li key={row.label} className="flex items-baseline justify-between gap-4 px-4 py-3.5">
            <span className="mono truncate text-[12.5px] text-fg">{row.label}</span>
            <span className="shrink-0 text-[11.5px] text-fg-3">{row.value}</span>
          </li>
        ))}
      </ul>

      {/* Footer facts */}
      <dl className="grid grid-cols-2 gap-px border-t border-line bg-line">
        {t.foot.map((item) => (
          <div key={item.label} className="bg-bg-1 px-4 pt-3 pb-3.5">
            <dt className="eyebrow">{item.label}</dt>
            <dd className="mono mt-1.5 text-[12px] text-fg-2">{item.value}</dd>
          </div>
        ))}
      </dl>

      {/* Corner ticks */}
      <span className="corner-ticks pointer-events-none absolute -inset-px" aria-hidden="true" />
    </aside>
  );
}