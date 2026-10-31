/*
 * Hand-drawn icons in the GH. identity: 24px grid, round caps, 1.6–2px
 * strokes, no icon library. The store's own tab icons are drawn as in GH
 * Store (apps/web/client/src/ui/icons.tsx) so the Mini App mock matches it.
 */
import type { ReactNode } from "react";

type P = { size?: number; className?: string };

function Svg({ size = 20, className, children }: P & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      {children}
    </svg>
  );
}

const line = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Points along the reading direction (mirrors in Arabic). */
export const ArrowIcon = ({ size = 18 }: P) => (
  <Svg size={size} className="flip-rtl">
    <path d="M5 12h14M13 6l6 6-6 6" {...line} strokeWidth="2" />
  </Svg>
);

export const ArrowDownIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <path d="M12 5v14M6 13l6 6 6-6" {...line} strokeWidth="2" />
  </Svg>
);

/** Leaves the site. */
export const ExternalIcon = ({ size = 16 }: P) => (
  <Svg size={size} className="flip-rtl">
    <path d="M8 16 16 8M9 8h7v7" {...line} strokeWidth="2" />
  </Svg>
);

export const ChevronIcon = ({ size = 18, className }: P) => (
  <Svg size={size} className={className}>
    <path d="m9 6 6 6-6 6" {...line} strokeWidth="2" className="flip-rtl" />
  </Svg>
);

export const CheckIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <path d="m5 12 5 5 9-10" {...line} strokeWidth="2.4" />
  </Svg>
);

export const CopyIcon = ({ size = 16 }: P) => (
  <Svg size={size}>
    <rect x="8" y="8" width="12" height="12" rx="3" {...line} strokeWidth="1.8" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" {...line} strokeWidth="1.8" />
  </Svg>
);

export const SunIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="4" {...line} strokeWidth="1.8" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" {...line} strokeWidth="1.8" />
  </Svg>
);

export const MoonIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" {...line} strokeWidth="1.8" />
  </Svg>
);

export const GlobeIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="8.5" {...line} strokeWidth="1.8" />
    <path d="M3.8 9.2h16.4M3.8 14.8h16.4M12 3.5c-2.6 2.4-3.7 5.2-3.7 8.5s1.1 6.1 3.7 8.5M12 3.5c2.6 2.4 3.7 5.2 3.7 8.5s-1.1 6.1-3.7 8.5" {...line} strokeWidth="1.6" />
  </Svg>
);

export const MailIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <rect x="3" y="5" width="18" height="14" rx="3" {...line} strokeWidth="1.9" />
    <path d="m4 7 8 6 8-6" {...line} strokeWidth="1.9" />
  </Svg>
);

export const RepoIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <path d="M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14H7.5A2.5 2.5 0 0 0 5 21.5V5a1.5 1.5 0 0 1 1-1.5Z" {...line} strokeWidth="1.7" />
    <path d="M5 19a2 2 0 0 1 2-2h11.5M9 8h6" {...line} strokeWidth="1.7" />
  </Svg>
);

/* ── navigation (header pills and the phone tab bar) */

export const WorkIcon = ({ size = 22 }: P) => (
  <Svg size={size}>
    <rect x="3.5" y="7" width="17" height="12.5" rx="3" {...line} strokeWidth="1.6" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17" {...line} strokeWidth="1.6" />
  </Svg>
);

export const PersonIcon = ({ size = 22 }: P) => (
  <Svg size={size}>
    <circle cx="12" cy="8" r="4" {...line} strokeWidth="1.6" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...line} strokeWidth="1.6" />
  </Svg>
);

export const SparkIcon = ({ size = 22 }: P) => (
  <Svg size={size}>
    <path d="M12 3.5c.7 3.9 2.6 5.8 6.5 6.5-3.9.7-5.8 2.6-6.5 6.5-.7-3.9-2.6-5.8-6.5-6.5 3.9-.7 5.8-2.6 6.5-6.5Z" {...line} strokeWidth="1.6" />
    <path d="M18.5 16.5c.3 1.6 1 2.3 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5Z" {...line} strokeWidth="1.4" />
  </Svg>
);

export const ChatIcon = ({ size = 22 }: P) => (
  <Svg size={size}>
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17h-1A.5.5 0 0 1 4 16.5Z" {...line} strokeWidth="1.6" />
    <path d="M8.5 9.5h7M8.5 12.5h4.5" {...line} strokeWidth="1.6" />
  </Svg>
);

/* ── services */

export const StoreIcon = ({ size = 24 }: P) => (
  <Svg size={size}>
    <path d="M5 8h14l-1.2 12H6.2z" {...line} strokeWidth="1.6" />
    <path d="M9 8a3 3 0 0 1 6 0" {...line} strokeWidth="1.6" />
  </Svg>
);

export const BotIcon = ({ size = 24 }: P) => (
  <Svg size={size}>
    <rect x="4" y="8" width="16" height="11.5" rx="4" {...line} strokeWidth="1.6" />
    <path d="M12 4.5V8M9 13v1.5M15 13v1.5" {...line} strokeWidth="1.8" />
    <circle cx="12" cy="4" r="1.2" fill="currentColor" />
  </Svg>
);

export const CodeIcon = ({ size = 24 }: P) => (
  <Svg size={size}>
    <path d="m8.5 7.5-5 4.5 5 4.5M15.5 7.5l5 4.5-5 4.5M13.5 5l-3 14" {...line} strokeWidth="1.7" />
  </Svg>
);

export const CloudIcon = ({ size = 24 }: P) => (
  <Svg size={size}>
    <path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4.5 4.5 0 0 1-.5 9Z" {...line} strokeWidth="1.6" />
  </Svg>
);

export const ChipIcon = ({ size = 24 }: P) => (
  <Svg size={size}>
    <rect x="6" y="6" width="12" height="12" rx="2.5" {...line} strokeWidth="1.6" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" {...line} strokeWidth="1.5" />
    <path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3" {...line} strokeWidth="1.6" />
  </Svg>
);

export const PlugIcon = ({ size = 24 }: P) => (
  <Svg size={size}>
    <path d="M9 3.5v4M15 3.5v4M6.5 7.5h11v3.5a5.5 5.5 0 0 1-11 0z" {...line} strokeWidth="1.6" />
    <path d="M12 16.5v4" {...line} strokeWidth="1.6" />
  </Svg>
);

/** A service card's icon by name; anything unknown draws the code brackets. */
export function ServiceIcon({ name, size = 24 }: { name: string; size?: number }) {
  switch (name) {
    case "store":
      return <StoreIcon size={size} />;
    case "bot":
      return <BotIcon size={size} />;
    case "globe":
      return <GlobeIcon size={size} />;
    case "cloud":
      return <CloudIcon size={size} />;
    case "chip":
      return <ChipIcon size={size} />;
    case "plug":
      return <PlugIcon size={size} />;
    case "doc":
      return <DocIcon size={size} />;
    case "spark":
      return <SparkIcon size={size} />;
    default:
      return <CodeIcon size={size} />;
  }
}

/* ── small marks: reply time, testimonials, the CV */

export const ClockIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="8.5" {...line} strokeWidth="1.8" />
    <path d="M12 7.5V12l3 2" {...line} strokeWidth="1.8" />
  </Svg>
);

export const QuoteIcon = ({ size = 28 }: P) => (
  <Svg size={size}>
    <path d="M10 7.5c-3 .8-5 3.2-5 6.6V17h4.5v-4.5H7.3c.2-1.7 1.2-2.9 3-3.5zM19 7.5c-3 .8-5 3.2-5 6.6V17h4.5v-4.5h-2.2c.2-1.7 1.2-2.9 3-3.5z" fill="currentColor" />
  </Svg>
);

export const DownloadIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" {...line} strokeWidth="2" />
  </Svg>
);

export const PrintIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <path d="M7 9V4h10v5M7 17H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9h14a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 19 17h-2" {...line} strokeWidth="1.8" />
    <path d="M7 14h10v6H7z" {...line} strokeWidth="1.8" />
  </Svg>
);

export const DocIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" {...line} strokeWidth="1.7" />
    <path d="M14 3.5V8h4M8.5 12.5h7M8.5 16h5" {...line} strokeWidth="1.7" />
  </Svg>
);

/* ── principles */

export const LedgerIcon = ({ size = 22 }: P) => (
  <Svg size={size}>
    <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" {...line} strokeWidth="1.6" />
    <path d="M8 8h8M8 12h8M8 16h5" {...line} strokeWidth="1.6" />
  </Svg>
);

export const BellIcon = ({ size = 22 }: P) => (
  <Svg size={size}>
    <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z" {...line} strokeWidth="1.6" />
    <path d="M10 20.5a2.2 2.2 0 0 0 4 0" {...line} strokeWidth="1.6" />
  </Svg>
);

export const RepeatIcon = ({ size = 22 }: P) => (
  <Svg size={size}>
    <path d="M17 3.5 20 6.5l-3 3M20 6.5H8.5A4.5 4.5 0 0 0 4 11M7 20.5l-3-3 3-3M4 17.5h11.5A4.5 4.5 0 0 0 20 13" {...line} strokeWidth="1.6" />
  </Svg>
);

export const ShieldIcon = ({ size = 22 }: P) => (
  <Svg size={size}>
    <path d="M12 3 5 6v5.5c0 4.3 2.9 8 7 9.5 4.1-1.5 7-5.2 7-9.5V6z" {...line} strokeWidth="1.6" />
    <path d="m9 12 2.2 2.2L15.5 10" {...line} strokeWidth="1.7" />
  </Svg>
);

/* ── the store's doors and its Mini App tab bar (as in GH Store) */

export const WindowIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <rect x="3" y="4.5" width="18" height="15" rx="3" {...line} strokeWidth="1.7" />
    <path d="M3 9h18" {...line} strokeWidth="1.7" />
    <circle cx="6.2" cy="6.8" r=".9" fill="currentColor" />
    <circle cx="9" cy="6.8" r=".9" fill="currentColor" />
  </Svg>
);

export const PhoneIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <rect x="6" y="2.5" width="12" height="19" rx="3" {...line} strokeWidth="1.7" />
    <path d="M10.5 18.5h3" {...line} strokeWidth="1.7" />
  </Svg>
);

export const SendIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <path d="M20.5 3.5 3.5 10.6l6.4 2.5 2.5 6.4z" {...line} strokeWidth="1.7" />
    <path d="m20.5 3.5-10.6 9.6" {...line} strokeWidth="1.7" />
  </Svg>
);

const fillFor = (active?: boolean) => (active ? "currentColor" : "none");

export const TabStoreIcon = ({ size = 18, active }: P & { active?: boolean }) => (
  <Svg size={size}>
    <path d="M5 8h14l-1.2 12H6.2z" fill={fillFor(active)} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 8a3 3 0 0 1 6 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const TabOrdersIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" {...line} strokeWidth="1.6" />
    <path d="M9 8h6M9 12h6" {...line} strokeWidth="1.6" />
  </Svg>
);

export const TabWalletIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <path d="M3 8a2 2 0 0 1 2-2h14v13H5a2 2 0 0 1-2-2z" {...line} strokeWidth="1.6" />
    <path d="M14 11h7v5h-7a2.5 2.5 0 0 1 0-5z" {...line} strokeWidth="1.6" />
  </Svg>
);

export const TabProfileIcon = ({ size = 18 }: P) => (
  <Svg size={size}>
    <circle cx="12" cy="8" r="4" {...line} strokeWidth="1.6" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6z" {...line} strokeWidth="1.6" />
  </Svg>
);

export const GamepadIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <path d="M7.5 7h9A4.5 4.5 0 0 1 21 11.5v1.2a3.3 3.3 0 0 1-6 1.9l-.4-.6h-5.2l-.4.6a3.3 3.3 0 0 1-6-1.9v-1.2A4.5 4.5 0 0 1 7.5 7Z" {...line} strokeWidth="1.6" />
    <path d="M7.5 10v3M6 11.5h3" {...line} strokeWidth="1.6" />
    <circle cx="16" cy="10.5" r="1" fill="currentColor" />
    <circle cx="17.5" cy="12.8" r="1" fill="currentColor" />
  </Svg>
);

export const CardIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <rect x="3" y="6" width="18" height="13" rx="3" {...line} strokeWidth="1.6" />
    <path d="M3 10.5h18M7 15h4" {...line} strokeWidth="1.6" />
  </Svg>
);

export const PlayIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <rect x="3" y="5" width="18" height="14" rx="3.5" {...line} strokeWidth="1.6" />
    <path d="m10.2 9.2 4.6 2.8-4.6 2.8z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </Svg>
);

/* ── channels: round marks in each network's colour, as GH Store's ContactMark */

const TELEGRAM_PATH =
  "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z";
const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";
const GITHUB_PATH =
  "M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3";
const INSTAGRAM_PATH =
  "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z";
const LINKEDIN_PATH =
  "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z";

const CHANNEL = {
  telegram: { bg: "#229ED9", path: TELEGRAM_PATH, scale: 0.6 },
  whatsapp: { bg: "#25D366", path: WHATSAPP_PATH, scale: 0.5 },
  github: { bg: "#1F2328", path: GITHUB_PATH, scale: 0.52 },
  linkedin: { bg: "#0A66C2", path: LINKEDIN_PATH, scale: 0.46 },
  instagram: { bg: "linear-gradient(45deg, #F58529, #DD2A7B 55%, #8134AF)", path: INSTAGRAM_PATH, scale: 0.48 },
} as const;

export type ChannelMarkId = keyof typeof CHANNEL;
export const isChannelMarkId = (id: string): id is ChannelMarkId => id in CHANNEL;

/** The Telegram plane alone, for buttons. */
export const TelegramGlyph = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="currentColor" d={TELEGRAM_PATH} />
  </svg>
);

export const WhatsAppGlyph = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="currentColor" d={WHATSAPP_PATH} />
  </svg>
);

export function ChannelMark({ id, size = 40 }: { id: ChannelMarkId; size?: number }) {
  const mark = CHANNEL[id];
  const inner = Math.round(size * mark.scale);
  return (
    <span className="contact-mark" style={{ width: size, height: size, background: mark.bg }} aria-hidden="true">
      <svg width={inner} height={inner} viewBox="0 0 24 24">
        <path fill="currentColor" d={mark.path} />
      </svg>
    </span>
  );
}
