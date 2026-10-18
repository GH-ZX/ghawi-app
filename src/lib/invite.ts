/*
 * The wedding invitation at invite.ghawi.app — shared types, defaults,
 * validation and formatting. Safe to import from client and server.
 *
 * Everything the page says lives in D1 (`invite_settings.config`), edited
 * from Admin → Invitation. DEFAULT_CONFIG mirrors the seed in
 * migrations/0004_invite.sql and only fills gaps in a stored config.
 */

export const INVITE_HOST = "invite.ghawi.app";
export const INVITE_URL = `https://${INVITE_HOST}`;

export type PartyKey = "men" | "women";
export type Parties = PartyKey | "both";
export const PARTY_KEYS: PartyKey[] = ["men", "women"];

export const INVITE_THEMES = ["navy", "blush", "ivory", "terracotta"] as const;
export type InviteTheme = (typeof INVITE_THEMES)[number];

export const THEME_LABELS: Record<InviteTheme, string> = {
  navy: "كحلي احتفالي",
  blush: "بودرة ووردي",
  ivory: "عاجي وذهبي كلاسيكي",
  terracotta: "ترابي دافئ",
};

/** Swatches for the admin: background, main colour, gold. */
export const THEME_SWATCHES: Record<InviteTheme, [string, string, string]> = {
  navy: ["#F7F4EE", "#1C2B4B", "#B8924A"],
  blush: ["#FBF3F1", "#B5677A", "#B88A5A"],
  ivory: ["#FAF6EC", "#7A1F2B", "#B08D45"],
  terracotta: ["#F7EFE6", "#B2532C", "#B98B4E"],
};

/** Font pairings for the whole invitation: a display face for names and a text face. */
export const INVITE_FONTS = ["classic", "naskh", "messiri", "kufi", "marhey", "cairo"] as const;
export type InviteFont = (typeof INVITE_FONTS)[number];

export const FONT_LABELS: Record<InviteFont, string> = {
  classic: "رقعة مع نسخ (كلاسيكي)",
  naskh: "نسخ أميري",
  messiri: "المسيري (أنيق)",
  kufi: "ريم كوفي (عصري)",
  marhey: "مرحي (مرح واحتفالي)",
  cairo: "القاهرة (بسيط)",
};

export const RULE_ICONS = ["child", "smoke", "heart", "clock", "camera", "gift"] as const;
export type RuleIcon = (typeof RULE_ICONS)[number];

/** One party's place. Both parties start together, at InviteConfig.startsAt. */
export type InviteEvent = {
  title: string;
  venue: string;
  address: string;
  mapUrl: string;
  note: string;
};

export type InviteRule = { icon: RuleIcon; title: string; text: string };

/** auto: live until the wedding day ends, then the thank-you page. */
export const INVITE_STATUSES = ["auto", "live", "ended"] as const;
export type InviteStatus = (typeof INVITE_STATUSES)[number];

export type InviteConfig = {
  groomName: string;
  groomShort: string;
  /** How the bride appears beside the groom — her name is never shown. */
  brideDisplay: string;
  /** Shown before the father's name, e.g. "الأستاذ"; may be empty. */
  groomFatherTitle: string;
  groomFather: string;
  groomFatherDeceased: boolean;
  brideFatherTitle: string;
  brideFather: string;
  brideFatherDeceased: boolean;
  /** Shown after a deceased father's name, e.g. "رحمه الله". */
  deceasedLabel: string;
  opening: string;
  /** One sentence; may contain {groomFather}, {groom} and {brideFather}. */
  invitationLine: string;
  personalLine: string;
  /** The heading over the gentle requests. */
  notesTitle: string;
  closing: string;
  families: string;
  /** The WhatsApp message the admin sends with a link; {name} and {link}. */
  shareMessage: string;
  rules: InviteRule[];
  events: Record<PartyKey, InviteEvent>;
  /** When both parties start, venue wall-clock "YYYY-MM-DDTHH:mm"; empty until set. */
  startsAt: string;
  /** The venues' offset from UTC, e.g. "+03:00" (Syria). */
  utcOffset: string;
  rsvpOpen: boolean;
  theme: InviteTheme;
  font: InviteFont;
  status: InviteStatus;
  /** The thank-you page once the wedding is over. */
  endedTitle: string;
  endedText: string;
  /** Wedding photos on the thank-you page. */
  galleryEnabled: boolean;
  galleryTitle: string;
};

/** Who may see a wedding photo: everyone, or one party's guests only. */
export type PhotoAudience = "all" | PartyKey;
export const PHOTO_AUDIENCES: PhotoAudience[] = ["all", "men", "women"];

export function isPhotoAudience(value: unknown): value is PhotoAudience {
  return value === "all" || value === "men" || value === "women";
}

/** What a link may see: the general link only "all"; a guest also their own parties'. */
export function audiencesFor(parties: PartyKey[] | null): PhotoAudience[] {
  return parties ? ["all", ...parties] : ["all"];
}

export type InvitePhoto = {
  id: string;
  width: number;
  height: number;
  caption: string;
  audience: PhotoAudience;
};

export type InviteGuest = {
  id: number;
  slug: string;
  name: string;
  honorific: string;
  parties: Parties;
  seats: number;
  theme: InviteTheme | null;
  note: string;
};

export type InviteRsvp = {
  attending: boolean;
  men: number;
  women: number;
  message: string;
  name: string;
};

export const DEFAULT_CONFIG: InviteConfig = {
  groomName: "أحمد خليل غاوي",
  groomShort: "أحمد",
  brideDisplay: "كريمته",
  groomFatherTitle: "الأستاذ",
  groomFather: "خليل غاوي",
  groomFatherDeceased: false,
  brideFatherTitle: "",
  brideFather: "أحمد كنجو",
  brideFatherDeceased: true,
  deceasedLabel: "رحمه الله",
  opening: "بقلوبٍ يملؤها الفرح، وبمشاعر لا تسعها الكلمات",
  invitationLine: "يتشرّف {groomFather} بدعوتكم لحضور حفل زفاف نجله {groom} على كريمته، ابنة {brideFather}",
  personalLine: "حضوركم يُتمّ فرحتنا، ويزيد ليلتنا بهجةً وجمالاً",
  notesTitle: "ملاحظة",
  closing: "دمتم ودامت أفراحكم عامرة بالمحبة",
  families: "آل غاوي · آل كنجو",
  shareMessage: "{name}، يسعدنا ويشرّفنا حضوركم حفل زفاف أحمد 🤍\nدعوتكم الخاصة هنا:\n{link}",
  rules: [
    { icon: "child", title: "دعوة للكبار فقط", text: "حرصاً على راحتكم وهدوء الحفل، نعتذر عن اصطحاب الأطفال، ونقبّل وجناتهم عن بُعد." },
    { icon: "smoke", title: "سهرة بلا أراكيل", text: "نرجو التكرّم بعدم إحضار الأراكيل، ليبقى الجوّ صافياً كالفرح." },
  ],
  events: {
    men: {
      title: "حفل الرجال",
      venue: "مزرعة محمد عمر غاوي",
      address: "الأتارب، طريق الابزمو",
      mapUrl: "",
      note: "",
    },
    women: {
      title: "حفل النساء",
      venue: "صالة البركات",
      address: "الأتارب",
      mapUrl: "",
      note: "",
    },
  },
  startsAt: "2026-10-25T20:00",
  utcOffset: "+03:00",
  rsvpOpen: true,
  theme: "navy",
  font: "classic",
  status: "auto",
  endedTitle: "تمّ الزواج",
  endedText: "شكراً لكل من شاركنا الفرح بحضوره ودعائه ومحبته",
  galleryEnabled: true,
  galleryTitle: "من ليلة الفرح",
};

/* ------------------------------------------------------------------ *
 *  Validation — the server's last word on anything the admin saves
 * ------------------------------------------------------------------ */

const text = (value: unknown, fallback: string, max = 300): string =>
  typeof value === "string" ? value.trim().slice(0, max) : fallback;
const flag = (value: unknown, fallback: boolean): boolean => (typeof value === "boolean" ? value : fallback);

const LOCAL_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const OFFSET = /^[+-](?:0\d|1[0-4]):[0-5]\d$/;

export function isInviteTheme(value: unknown): value is InviteTheme {
  return typeof value === "string" && (INVITE_THEMES as readonly string[]).includes(value);
}

export function isInviteFont(value: unknown): value is InviteFont {
  return typeof value === "string" && (INVITE_FONTS as readonly string[]).includes(value);
}

export function isParties(value: unknown): value is Parties {
  return value === "men" || value === "women" || value === "both";
}

/** Only http(s) links reach the page, so a stored value can never be javascript:. */
export function safeUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString().slice(0, 600) : "";
  } catch {
    return "";
  }
}

function sanitizeEvent(value: unknown, fallback: InviteEvent): InviteEvent {
  const v = (value && typeof value === "object" ? value : {}) as Partial<Record<keyof InviteEvent, unknown>>;
  return {
    title: text(v.title, fallback.title, 60),
    venue: text(v.venue, fallback.venue, 120),
    address: text(v.address, fallback.address, 200),
    mapUrl: v.mapUrl === undefined ? fallback.mapUrl : safeUrl(v.mapUrl),
    note: text(v.note, fallback.note, 300),
  };
}

export function sanitizeConfig(input: unknown): InviteConfig {
  const v = (input && typeof input === "object" ? input : {}) as Partial<Record<keyof InviteConfig, unknown>>;
  const d = DEFAULT_CONFIG;
  const events = (v.events && typeof v.events === "object" ? v.events : {}) as Partial<Record<PartyKey, unknown>>;
  const rules = Array.isArray(v.rules)
    ? v.rules
        .slice(0, 6)
        .map((rule) => {
          const r = (rule && typeof rule === "object" ? rule : {}) as Partial<Record<keyof InviteRule, unknown>>;
          return {
            icon: (RULE_ICONS as readonly string[]).includes(String(r.icon)) ? (r.icon as RuleIcon) : "heart",
            title: text(r.title, "", 80),
            text: text(r.text, "", 240),
          };
        })
        .filter((rule) => rule.title || rule.text)
    : d.rules;

  return {
    groomName: text(v.groomName, d.groomName, 80),
    groomShort: text(v.groomShort, d.groomShort, 40),
    brideDisplay: text(v.brideDisplay, d.brideDisplay, 40),
    groomFatherTitle: text(v.groomFatherTitle, d.groomFatherTitle, 30),
    groomFather: text(v.groomFather, d.groomFather, 80),
    groomFatherDeceased: flag(v.groomFatherDeceased, d.groomFatherDeceased),
    brideFatherTitle: text(v.brideFatherTitle, d.brideFatherTitle, 30),
    brideFather: text(v.brideFather, d.brideFather, 80),
    brideFatherDeceased: flag(v.brideFatherDeceased, d.brideFatherDeceased),
    deceasedLabel: text(v.deceasedLabel, d.deceasedLabel, 30),
    opening: text(v.opening, d.opening),
    invitationLine: text(v.invitationLine, d.invitationLine),
    personalLine: text(v.personalLine, d.personalLine),
    notesTitle: text(v.notesTitle, d.notesTitle, 40),
    closing: text(v.closing, d.closing),
    families: text(v.families, d.families, 120),
    shareMessage: text(v.shareMessage, d.shareMessage, 500),
    rules,
    events: { men: sanitizeEvent(events.men, d.events.men), women: sanitizeEvent(events.women, d.events.women) },
    startsAt: typeof v.startsAt === "string" && (LOCAL_TIME.test(v.startsAt) || v.startsAt === "") ? v.startsAt : d.startsAt,
    utcOffset: typeof v.utcOffset === "string" && OFFSET.test(v.utcOffset) ? v.utcOffset : d.utcOffset,
    rsvpOpen: flag(v.rsvpOpen, d.rsvpOpen),
    theme: isInviteTheme(v.theme) ? v.theme : d.theme,
    font: isInviteFont(v.font) ? v.font : d.font,
    status: (INVITE_STATUSES as readonly string[]).includes(String(v.status)) ? (v.status as InviteStatus) : d.status,
    endedTitle: text(v.endedTitle, d.endedTitle, 80),
    endedText: text(v.endedText, d.endedText),
    galleryEnabled: flag(v.galleryEnabled, d.galleryEnabled),
    galleryTitle: text(v.galleryTitle, d.galleryTitle, 60),
  };
}

/** Personal links: lowercase Latin, digits and dashes, e.g. "haifa" or "abu-omar". */
export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
export const GENERAL_SLUG = "general";
const RESERVED = new Set([GENERAL_SLUG, "api", "admin", "invite", "og", "favicon", "robots", "sitemap"]);

export function isGuestSlug(value: unknown): value is string {
  return typeof value === "string" && SLUG_PATTERN.test(value) && !RESERVED.has(value);
}

export function partiesOf(parties: Parties): PartyKey[] {
  return parties === "both" ? PARTY_KEYS : [parties];
}

/* ------------------------------------------------------------------ *
 *  Time — venue wall-clock in, absolute instants out
 * ------------------------------------------------------------------ */

/** The absolute moment the parties start, or null while the time is unset. */
export function startInstant(startsAt: string, utcOffset: string): Date | null {
  if (!LOCAL_TIME.test(startsAt)) return null;
  const date = new Date(`${startsAt}:00${utcOffset}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** The venue's wall-clock time as a Date in UTC, so formatting with timeZone UTC shows it unchanged. */
function wallClock(startsAt: string): Date | null {
  if (!LOCAL_TIME.test(startsAt)) return null;
  const [day, time] = startsAt.split("T");
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm));
}

const fmt = (options: Intl.DateTimeFormatOptions, calendar = "") =>
  new Intl.DateTimeFormat(`ar-SY${calendar}`, { timeZone: "UTC", ...options });

export type EventDate = {
  weekday: string;
  day: string;
  month: string;
  year: string;
  hijri: string;
  time: string;
  dayKey: string;
};

/** Everything the page shows about when an event happens, in Syrian Arabic. */
export function describeDate(startsAt: string): EventDate | null {
  const date = wallClock(startsAt);
  if (!date) return null;
  const hour = date.getUTCHours();
  const period = hour < 12 ? "صباحاً" : hour < 15 ? "ظهراً" : hour < 18 ? "عصراً" : "مساءً";
  const clock = fmt({ hour: "numeric", minute: "2-digit", hour12: true })
    .formatToParts(date)
    .filter((part) => part.type === "hour" || part.type === "minute" || part.type === "literal")
    .map((part) => part.value)
    .join("")
    .trim();
  let hijri = "";
  try {
    hijri = fmt({ day: "numeric", month: "long", year: "numeric" }, "-u-ca-islamic-umalqura").format(date);
  } catch {
    hijri = "";
  }
  return {
    weekday: fmt({ weekday: "long" }).format(date),
    day: fmt({ day: "numeric" }).format(date),
    month: fmt({ month: "long" }).format(date),
    year: fmt({ year: "numeric" }).format(date),
    hijri,
    time: `${clock} ${period}`,
    dayKey: startsAt.slice(0, 10),
  };
}

/** Arabic-Indic digits, as the rest of the page shows numbers. */
export function arabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}

/** "شخص واحد", "شخصان", "٣ أشخاص", "١٢ شخصاً" — Arabic counting agreement. */
export function people(n: number): string {
  if (n === 1) return "شخص واحد";
  if (n === 2) return "شخصان";
  return `${arabicDigits(n)} ${n >= 3 && n <= 10 ? "أشخاص" : "شخصاً"}`;
}

/** "{groomFather}"-style placeholders split out, so names can be styled. */
export function splitTemplate(line: string): (string | { key: string })[] {
  return line.split(/(\{[a-zA-Z]+\})/).filter(Boolean).map((part) => (/^\{[a-zA-Z]+\}$/.test(part) ? { key: part.slice(1, -1) } : part));
}

/** A father as the invitation names him: title, name, and "رحمه الله" after it if deceased. */
export function fatherParts(config: InviteConfig, who: "groom" | "bride"): { title: string; name: string; after: string } {
  const groom = who === "groom";
  const deceased = groom ? config.groomFatherDeceased : config.brideFatherDeceased;
  return {
    title: groom ? config.groomFatherTitle : config.brideFatherTitle,
    name: groom ? config.groomFather : config.brideFather,
    after: deceased ? config.deceasedLabel : "",
  };
}

/** A plain-text version of a line, for link previews and calendars. */
export function fillTemplate(line: string, config: InviteConfig): string {
  const father = (who: "groom" | "bride") => {
    const f = fatherParts(config, who);
    return [f.title, f.name, f.after].filter(Boolean).join(" ");
  };
  return line
    .replace(/\{groomFather\}/g, father("groom"))
    .replace(/\{brideFather\}/g, father("bride"))
    .replace(/\{groom\}/g, config.groomShort);
}

/** Who the page greets: "الآنسة هيفاء", or nothing on the general link. */
export function addressee(guest: Pick<InviteGuest, "honorific" | "name"> | null): string {
  if (!guest) return "";
  return [guest.honorific, guest.name].filter(Boolean).join(" ");
}

/**
 * Whether the invitation has given way to the thank-you page: forced from the
 * admin, or — on "auto" — once the wedding day is over (midnight, venue time).
 */
export function isEnded(config: InviteConfig, now = new Date()): boolean {
  if (config.status !== "auto") return config.status === "ended";
  if (!LOCAL_TIME.test(config.startsAt)) return false;
  const end = new Date(`${config.startsAt.slice(0, 10)}T23:59:59${config.utcOffset}`);
  return !Number.isNaN(end.getTime()) && now > end;
}

/** Replies stay open until the admin closes them or the wedding is over. */
export function rsvpClosed(config: InviteConfig, now = new Date()): boolean {
  return !config.rsvpOpen || isEnded(config, now);
}
