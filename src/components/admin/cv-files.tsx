"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { ExternalIcon } from "@/components/icons";

/*
 * Admin → Site → CV: the PDF behind "Download PDF", per language. The site
 * ships with one; an upload here replaces it until removed. To make a fresh
 * one from the page: open the CV, Print, "Save as PDF", upload it here.
 */

type SiteFile = { key: "cv-en" | "cv-ar"; name: string; size: number; updatedAt: string };

const SLOTS = [
  { key: "cv-en", label: "English PDF", lang: "en", pdf: "/cv/ahmed-ghawi-cv.pdf" },
  { key: "cv-ar", label: "Arabic PDF", lang: "ar", pdf: "/cv/ahmed-ghawi-cv-ar.pdf" },
] as const;

const ERRORS: Record<string, string> = {
  bad_type: "That isn't a PDF.",
  too_large: "Too large — keep it under 1.8 MB.",
  empty: "The file is empty.",
};

/** `contentUpdatedAt`: the CV's last save, to flag a PDF made before it. */
export function CvFiles({ contentUpdatedAt = null }: { contentUpdatedAt?: string | null }) {
  const [files, setFiles] = useState<SiteFile[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/site/files", { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<{ files?: SiteFile[] }>) : { files: [] }))
      .then((body) => setFiles(body.files ?? []))
      .catch(() => setFiles([]));
  }, []);

  async function upload(key: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(key);
    setError(null);
    try {
      const response = await fetch(`/api/admin/site/files?key=${key}&name=${encodeURIComponent(file.name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });
      const body = (await response.json()) as { files?: SiteFile[]; error?: string };
      if (!response.ok) throw new Error(body.error ?? "failed");
      setFiles(body.files ?? []);
    } catch (reason) {
      setError(ERRORS[(reason as Error).message] ?? "Couldn't upload. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(key: string) {
    if (!window.confirm("Remove the uploaded PDF? The one built into the site takes its place.")) return;
    setBusy(key);
    try {
      const response = await fetch(`/api/admin/site/files?key=${key}`, { method: "DELETE" });
      const body = (await response.json()) as { files?: SiteFile[] };
      setFiles(body.files ?? []);
    } finally {
      setBusy(null);
    }
  }

  return (
    <fieldset className="sp__set">
      <legend>PDF</legend>
      <p className="hint sp__note">
        “Download PDF” on cv.ghawi.app serves your upload if there is one, else the PDF built into the site. After editing:
        Save, press Print / PDF, choose “Save as PDF” (A4, no headers and footers), and upload it here.
      </p>
      <div className="sp__files">
        {SLOTS.map((slot) => {
          const file = files?.find((f) => f.key === slot.key);
          const stale = file && contentUpdatedAt && file.updatedAt < contentUpdatedAt;
          const page = typeof window !== "undefined" && window.location.host.startsWith("cv.") ? (slot.lang === "ar" ? "/ar" : "/") : `/resume/${slot.lang}`;
          return (
            <div key={slot.key} className="sp__file">
              <strong>{slot.label}</strong>
              <span className="muted small">
                {files === null
                  ? "…"
                  : file
                    ? `Uploaded: ${file.name || "cv.pdf"} · ${Math.round(file.size / 1024)} KB · ${new Date(file.updatedAt).toLocaleDateString("en-GB")}`
                    : "Using the built-in PDF"}
              </span>
              {stale ? <span className="badge badge--warn">Older than your last save — export a new one</span> : null}
              <span className="sp__file-actions">
                <label className="btn btn--xs btn--soft press">
                  {busy === slot.key ? "Uploading…" : file ? "Replace" : "Upload"}
                  <input type="file" accept="application/pdf" hidden disabled={busy !== null} onChange={(event) => upload(slot.key, event)} />
                </label>
                {file ? (
                  <button type="button" className="btn btn--xs btn--ghost press" disabled={busy !== null} onClick={() => remove(slot.key)}>
                    Remove
                  </button>
                ) : null}
                <a className="btn btn--xs btn--ghost press" href={slot.pdf} target="_blank" rel="noopener noreferrer">
                  PDF <ExternalIcon size={13} />
                </a>
                <a className="btn btn--xs btn--ghost press" href={page} target="_blank" rel="noopener noreferrer">
                  Page <ExternalIcon size={13} />
                </a>
              </span>
            </div>
          );
        })}
      </div>
      {error ? (
        <p className="login__alert" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
