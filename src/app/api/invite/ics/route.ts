import { INVITE_URL, startInstant, type PartyKey } from "@/lib/invite";
import { inviteDb, loadConfig } from "@/lib/invite-server";

export const dynamic = "force-dynamic";

/** 20261025T130000Z */
const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** RFC 5545 text: escape \ ; , and newlines, fold at 74 octets-ish. */
const escape = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
function fold(line: string): string {
  const chars = Array.from(line);
  const out: string[] = [];
  let current = "";
  for (const ch of chars) {
    if (new TextEncoder().encode(current + ch).length > 73) {
      out.push(current);
      current = " " + ch;
    } else current += ch;
  }
  out.push(current);
  return out.join("\r\n");
}

/** One party as a calendar file, with a reminder the evening before. */
export async function GET(request: Request) {
  const party = new URL(request.url).searchParams.get("party");
  if (party !== "men" && party !== "women") return new Response("Unknown party", { status: 404 });

  const config = await loadConfig(await inviteDb());
  const event = config.events[party as PartyKey];
  const start = startInstant(config.startsAt, config.utcOffset);
  if (!start) return new Response("No date yet", { status: 404 });
  const end = new Date(start.getTime() + 4 * 3_600_000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ghawi.app//invite//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${party}-${stamp(start)}@invite.ghawi.app`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(`${event.title} · زفاف ${config.groomShort}`)}`,
    `LOCATION:${escape([event.venue, event.address].filter(Boolean).join("، "))}`,
    `DESCRIPTION:${escape([event.note, event.mapUrl, INVITE_URL].filter(Boolean).join("\n"))}`,
    ...(event.mapUrl ? [`URL:${event.mapUrl}`] : []),
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-PT12H",
    `DESCRIPTION:${escape(event.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].map(fold);

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="wedding-${party}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
