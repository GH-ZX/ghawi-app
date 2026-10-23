"use client";

import { PrintIcon } from "@/components/icons";

/** The browser's own print dialog: "Save as PDF" there gives the same A4 pages. */
export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn btn--xs btn--ghost press" onClick={() => window.print()} data-track="cv-print">
      <PrintIcon size={15} />
      {label}
    </button>
  );
}
