/**
 * home.ghawi.app: every ghawi service in one place. A plain page (no sign-in), not linked from ghawi.app and
 * never indexed; a service shows on the public site only when it's ready to.
 * Add a service here and it appears on the page.
 */

export type HomeLink = { label: string; href: string };

/**
 * GH-Cash, the ShamCash payment-confirmation API (its own app, Docker on the
 * home server, behind the ghawi Cloudflare tunnel). Its admin has its own
 * sign-in.
 */
export const GH_CASH_URL = "https://sham.ghawi.app";
export const GH_CASH_ADMIN_URL = `${GH_CASH_URL}/admin`;

export type HomeService = {
  name: string;
  /** What it is, in a line. */
  about: string;
  /** ServiceIcon name (components/icons.tsx). */
  icon: string;
  href: string;
  /** Other pages of the same service. */
  more?: HomeLink[];
};

export const HOME_SERVICES: HomeService[] = [
  {
    name: "ghawi.app",
    about: "The public site: work, services, contact.",
    icon: "globe",
    href: "https://ghawi.app",
    more: [{ label: "Arabic", href: "https://ghawi.app/ar" }],
  },
  {
    name: "Admin",
    about: "Contact inbox, site content, theme and stats. The wedding invitation is under Other.",
    icon: "chip",
    href: "https://ghawi.app/admin",
  },
  {
    name: "boti",
    about: "The Plus Store X client bots: quick setup, clients, ship, API library.",
    icon: "bot",
    href: "https://boti.ghawi.app",
    more: [{ label: "Repo", href: "https://github.com/GH-ZX/boti" }],
  },
  {
    name: "Stori",
    about: "Supermarket web stores: the showcase and the owner panel.",
    icon: "store",
    href: "https://stori.ghawi.app/panel",
    more: [
      { label: "Showcase", href: "https://stori.ghawi.app" },
      { label: "Repo", href: "https://github.com/GH-ZX/stori" },
    ],
  },
  {
    name: "GH-Cash",
    about: "ShamCash payment confirmation by API: merchants, wallets, invoices.",
    icon: "card",
    href: GH_CASH_ADMIN_URL,
    more: [
      { label: "Site", href: GH_CASH_URL },
      { label: "Docs", href: `${GH_CASH_URL}/docs` },
    ],
  },
  {
    name: "GH net",
    about: "MikroTik manager: lessons, visuals, script wizards and a live router console.",
    icon: "router",
    href: "https://net.ghawi.app",
    more: [
      { label: "Bridge", href: "https://net.ghawi.app/connect" },
      { label: "Repo", href: "https://github.com/GH-ZX/ghawi-net" },
    ],
  },
  {
    name: "CV",
    about: "The CV in English and Arabic, and its builder.",
    icon: "doc",
    href: "https://cv.ghawi.app",
    more: [
      { label: "Arabic", href: "https://cv.ghawi.app/ar" },
      { label: "Builder", href: "https://cv.ghawi.app/edit" },
    ],
  },
  {
    name: "Invitation",
    about: "The wedding invitation (ended). Guests and RSVPs are in Admin → Other.",
    icon: "spark",
    href: "https://invite.ghawi.app",
    more: [{ label: "Settings", href: "https://ghawi.app/admin/other" }],
  },
];
