import type { ReactNode } from "react";
import { inviteFontVariables } from "@/lib/invite-fonts";
import "@/styles/invite.css";

/*
 * The invitation's own root: Arabic, right-to-left, its own faces and
 * styles — nothing from the landing page's design system. Served at
 * invite.ghawi.app (next.config.ts rewrites the subdomain onto /invite).
 *
 * Light is the default; a guest who switches to dark keeps it. The script
 * runs before paint so a dark choice never flashes light first.
 */
const prePaint = `try{var m=localStorage.getItem("iv-mode");if(m==="dark"||m==="light")document.documentElement.dataset.mode=m}catch(e){}`;

export default function InviteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-mode="light" className={inviteFontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaint }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
