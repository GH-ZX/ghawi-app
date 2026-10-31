/**
 * home.ghawi.app: every ghawi service in one place, for the owner only. Not linked from ghawi.app and
 * never indexed; a service shows on the public site only when it's ready to.
 * Add a service here and it appears on the page.
 */

export type HomeLink = { label: string; href: string };

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
    about: "Contact inbox, site content, theme, stats and the invitation's settings.",
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
    about: "The wedding invitation. Guests and RSVPs are in Admin.",
    icon: "spark",
    href: "https://invite.ghawi.app",
  },
];
