/**
 * Runs before paint so a returning visitor never sees the wrong theme flash.
 * Kept deliberately tiny and dependency-free.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify("ghawi-theme")});if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;