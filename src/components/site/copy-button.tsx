"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

export function CopyButton({ value, copy, copied }: { value: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setDone(false), 2000);
    return () => window.clearTimeout(timer);
  }, [done]);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
    } catch {
      // Clipboard blocked (insecure context, old browser): the address is
      // still right there to select by hand.
    }
  }

  return (
    <button type="button" className="btn btn--xs btn--soft press" onClick={onClick} aria-live="polite">
      {done ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
      {done ? copied : copy}
    </button>
  );
}
