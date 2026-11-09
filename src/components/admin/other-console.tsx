"use client";

import { ExternalIcon } from "@/components/icons";
import { INVITE_URL } from "@/lib/invite";
import { AdminBar, AdminTabs } from "./admin-bar";
import { InvitePanel } from "./invite-panel";

/** Admin → Other: the wedding invitation, after the wedding. */
export function OtherConsole() {
  return (
    <div className="admin">
      <AdminBar where="other" />
      <main className="admin__main">
        <AdminTabs current="other" />

        <section className="other__intro card" aria-labelledby="other-invite">
          <div>
            <span className="badge badge--soft">Ended</span>
            <h2 id="other-invite">Wedding invitation</h2>
            <p className="muted">
              The wedding is over, so its settings live here rather than in the main admin. Guests, RSVPs, photos and the
              song are all kept, and every invitation link still opens.
            </p>
          </div>
          <a className="btn btn--xs btn--ghost press" href={INVITE_URL} target="_blank" rel="noopener noreferrer">
            Open the invitation <ExternalIcon size={14} />
          </a>
        </section>

        <InvitePanel />
      </main>
    </div>
  );
}
