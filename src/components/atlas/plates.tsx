/**
 * Inline plates for the Atlas statement.
 *
 * Drawn, not photographed — three small compositions that read at roughly
 * 7rem wide. Each is a miniature of the thing it names, so the statement has
 * a visual beat every few words without breaking the line.
 */

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      className="block size-[3.5rem] overflow-hidden rounded-[0.55rem] bg-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] sm:size-[4.25rem]"
      role="img"
      aria-label={label}
    >
      {children}
    </span>
  );
}

/** GH Store — a shelf of tiles with one picked out. */
export function StorePlate({ label }: { label: string }) {
  return (
    <Frame label={label}>
      <span className="grid h-full grid-cols-3 grid-rows-3 gap-[2px] p-[3px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className={`rounded-[1px] ${i === 4 ? "bg-rust" : "bg-paper-3"}`}
          />
        ))}
      </span>
    </Frame>
  );
}

/** Bot Factory — three tenants into one core. */
export function FactoryPlate({ label }: { label: string }) {
  return (
    <Frame label={label}>
      <span className="flex h-full flex-col items-center justify-center gap-[3px] p-[5px]">
        <span className="flex w-full gap-[2px]">
          <span className="h-[6px] flex-1 rounded-[1px] bg-paper-3" />
          <span className="h-[6px] flex-1 rounded-[1px] bg-paper-3" />
          <span className="h-[6px] flex-1 rounded-[1px] bg-paper-3" />
        </span>
        <span className="h-[5px] w-px bg-ink-3" />
        <span className="h-[10px] w-[60%] rounded-[1px] bg-rust" />
        <span className="h-[5px] w-px bg-ink-3" />
        <span className="flex w-full gap-[2px]">
          <span className="h-[6px] flex-1 rounded-[1px] bg-paper-3" />
          <span className="h-[6px] flex-1 rounded-[1px] bg-paper-3" />
        </span>
      </span>
    </Frame>
  );
}

/** Telegram bot — a chat with a reply keyboard. */
export function BotPlate({ label }: { label: string }) {
  return (
    <Frame label={label}>
      <span className="flex h-full flex-col justify-between p-[5px]">
        <span className="ml-auto h-[7px] w-[54%] rounded-[1px] bg-rust" />
        <span className="h-[7px] w-[64%] rounded-[1px] bg-paper-3" />
        <span className="flex gap-[2px]">
          <span className="h-[8px] flex-1 rounded-[1px] bg-paper-2" />
          <span className="h-[8px] flex-1 rounded-[1px] bg-paper-2" />
          <span className="h-[8px] flex-1 rounded-[1px] bg-paper-2" />
        </span>
      </span>
    </Frame>
  );
}

export const PLATES = {
  store: StorePlate,
  factory: FactoryPlate,
  bot: BotPlate,
} as const;