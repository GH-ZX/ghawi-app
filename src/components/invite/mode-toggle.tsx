"use client";

/** Light by default; the guest's choice is remembered (see the pre-paint script in the layout). */
export function ModeToggle() {
  function toggle() {
    const root = document.documentElement;
    const nextMode = root.dataset.mode === "dark" ? "light" : "dark";
    root.dataset.mode = nextMode;
    try {
      localStorage.setItem("iv-mode", nextMode);
    } catch {
      /* not remembered, still switched */
    }
  }
  return (
    <button type="button" className="iv-mode" onClick={toggle} aria-label="تبديل الوضع الفاتح والداكن">
      <svg className="iv-mode__moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <svg className="iv-mode__sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}
