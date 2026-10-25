"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalIcon, MoonIcon, SunIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { getEffectiveMode, setMode } from "@/lib/theme-client";
import { ClientsPanel, type Client } from "./clients-panel";
import { LibraryPanel } from "./library-panel";
import { ShipPanel } from "./ship-panel";
import { ago, api } from "./shared";
import { WizardPanel } from "./wizard-panel";
import { QuickSetup } from "./setup/quick-setup";

type Section = "setup" | "clients" | "ship" | "new" | "library";
type BotiEvent = { id: number; at: string; kind: string; client: string | null; data: string | null };

const SECTIONS: { id: Section; label: string }[] = [
  { id: "setup", label: "Quick setup" },
  { id: "clients", label: "Clients" },
  { id: "ship", label: "Ship" },
  { id: "library", label: "API library" },
  { id: "new", label: "Wizard (advanced)" },
];

const EVENT_LABEL: Record<string, string> = {
  ship: "Shipped main",
  "client.update": "Details saved",
  "wizard.deploy_key": "Deploy key created",
  "wizard.register": "Registered in clients.json",
  "wizard.branch": "Client branch set up",
  "wizard.keys": "Keys generated",
  "wizard.sync": "First sync started",
  "setup.finished": "Quick setup finished",
  "library.save": "Spec saved",
  "library.toggle": "Spec turned on/off",
  "library.delete": "Spec deleted",
};

/** boti.ghawi.app: the coder's control panel for the client store bots. */
export function BotiConsole() {
  const router = useRouter();
  const [section, setSection] = useState<Section | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<BotiEvent[]>([]);
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bumped by Refresh / after a change; the effect below refetches when it moves.
  const [version, setVersion] = useState(0);
  const load = useCallback(() => {
    setLoading(true);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const body = await api<{ repo: string; clients: Client[]; events: BotiEvent[] }>("/api/boti/clients", { signal: controller.signal });
        setClients(body.clients);
        setEvents(body.events ?? []);
        // First visit: no clients yet → start on Quick setup.
        setSection((s) => s ?? (body.clients.length ? "clients" : "setup"));
        setRepo(body.repo);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError((err as Error).message);
        setSection((s) => s ?? "setup");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [version]);

  const go = (next: Section) => setSection(next);

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="admin boti">
      <header className="admin__bar boti__no-print">
        <div className="admin__bar-inner">
          <span className="admin__brand">
            <Logo height={20} />
            boti <span>/ store clients</span>
          </span>
          <div className="admin__actions">
            <button
              type="button"
              className="icon-btn press"
              onClick={() => setMode(getEffectiveMode() === "dark" ? "light" : "dark")}
              aria-label="Toggle light and dark"
            >
              <span className="when-light">
                <MoonIcon />
              </span>
              <span className="when-dark">
                <SunIcon />
              </span>
            </button>
            {repo ? (
              <a className="btn btn--xs btn--ghost press" href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">
                Repo <ExternalIcon size={14} />
              </a>
            ) : null}
            <button type="button" className="btn btn--xs btn--soft press" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="admin__main">
        <div className="seg admin__tabs boti__no-print" role="group" aria-label="Section">
          {SECTIONS.map((item) => (
            <button key={item.id} type="button" className="press" aria-pressed={section === item.id} onClick={() => go(item.id)}>
              {item.label}
              {item.id === "ship" && clients.some((c) => (c.behind ?? 0) > 0) ? ` · ${clients.filter((c) => (c.behind ?? 0) > 0).length}` : ""}
            </button>
          ))}
        </div>

        {section === "setup" ? <QuickSetup onChanged={load} /> : null}
        {section === "clients" ? <ClientsPanel clients={clients} repo={repo} loading={loading} error={error} reload={load} /> : null}
        {section === "ship" ? <ShipPanel clients={clients} onShipped={load} /> : null}
        {section === "new" ? <WizardPanel onCreated={load} /> : null}
        {section === "library" ? <LibraryPanel /> : null}

        {section === "clients" && events.length ? (
          <details className="facts boti__no-print">
            <summary>Activity</summary>
            <dl>
              {events.map((event) => (
                <div key={event.id}>
                  <dt>
                    {EVENT_LABEL[event.kind] ?? event.kind}
                    {event.client ? ` · ${event.client}` : ""}
                  </dt>
                  <dd>{ago(event.at)}</dd>
                </div>
              ))}
            </dl>
          </details>
        ) : null}
      </main>
    </div>
  );
}
