import { arabicDigits } from "@/lib/invite";
import { Heart } from "./couple";

const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("ar-SY", { timeZone: "UTC", ...options });
const MONTH = fmt({ month: "long", year: "numeric" });
const WEEKDAY = fmt({ weekday: "long" });

/**
 * A slip of a calendar: the month, then five days in a line — two before,
 * the wedding day larger in the middle on a heart, two after — read left
 * to right like the countdown.
 */
export function WeddingCalendar({ startsAt }: { startsAt: string }) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(startsAt);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const wedding = new Date(Date.UTC(year, month - 1, day));
  const days = [-2, -1, 0, 1, 2].map((offset) => new Date(Date.UTC(year, month - 1, day + offset)));

  return (
    <div className="cal" role="img" aria-label={`${WEEKDAY.format(wedding)} ${arabicDigits(day)} ${MONTH.format(wedding)}`}>
      <p className="cal__month">{MONTH.format(wedding)}</p>
      <div className="cal__row" dir="ltr" aria-hidden="true">
        {days.map((date, i) =>
          i === 2 ? (
            <span key={i} className="cal__day cal__day--wedding">
              <Heart className="cal__heart" />
              <span>{arabicDigits(date.getUTCDate())}</span>
            </span>
          ) : (
            <span key={i} className="cal__day" data-far={i === 0 || i === 4 || undefined}>
              {arabicDigits(date.getUTCDate())}
            </span>
          ),
        )}
      </div>
      <p className="cal__weekday">{WEEKDAY.format(wedding)}</p>
    </div>
  );
}
