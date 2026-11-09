/** The admin's in-place sections, shared by the server page and the client tabs. */
export const ADMIN_SECTIONS = [
  { id: "inbox", label: "Inbox" },
  { id: "site", label: "Site" },
  { id: "stats", label: "Stats" },
  { id: "theme", label: "Theme" },
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number]["id"];

export const isAdminSection = (value: unknown): value is AdminSection =>
  ADMIN_SECTIONS.some((section) => section.id === value);
