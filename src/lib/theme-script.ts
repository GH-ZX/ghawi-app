/** Address-bar colours, kept in step with the theme the script applies. */
const CHROME: Record<string, string> = {
  nocturne: "#07080a",
  paper: "#faf8f4",
  ember: "#0c0907",
};

const VALID = ["nocturne", "paper", "ember"] as const;

/**
 * Runs before first paint so a visitor never sees the wrong theme.
 *
 * Order of authority:
 *   1. an explicit choice the visitor made here (localStorage)
 *   2. whatever the admin last selected (site config, edge-cached)
 *   3. the build-time default
 *
 * Step 2 uses a synchronous request on purpose: an async fetch would resolve
 * after the first paint and flash the default theme at every visitor on every
 * load. This blocks for a few milliseconds against a warm edge cache.
 *
 * Deliberately tiny, dependency-free, and wrapped so any failure is a no-op.
 */
const BUILD_DEFAULT = "nocturne";

export const themeScript = `(function(){var d=document.documentElement;function ok(t){return` +
  `${JSON.stringify(VALID)}.indexOf(t)>-1;}` +
  `function apply(t){d.setAttribute("data-theme",t);` +
  `var m=document.querySelector('meta[name="theme-color"]');` +
  `if(m)m.setAttribute("content",${JSON.stringify(CHROME)}[t]||${JSON.stringify(CHROME.nocturne)});}` +
  `try{var s=localStorage.getItem("ghawi-theme");if(ok(s)){apply(s);return;}}catch(e){}` +
  `try{var x=new XMLHttpRequest();x.open("GET","/api/site-config",false);x.send();` +
  `if(x.status>=200&&x.status<300){var c=JSON.parse(x.responseText);if(c&&ok(c.theme)){apply(c.theme);return;}}}` +
  `catch(e){}apply(${JSON.stringify(BUILD_DEFAULT)});})();`;