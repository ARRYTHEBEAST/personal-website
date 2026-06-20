/* Mounts the ASCII decode intro over the page on load, then fades to reveal it.
   Requires (load in this order, before this file):
     assets/buddha-grid.js
     assets/intro-ascii.js
   Runs once per session — remove the sessionStorage guard to run on every load. */
(function () {
  function start() {
    if (!window.mountIntro || !window.BUDDHA_GRID) { setTimeout(start, 50); return; }
    try {
      if (sessionStorage.getItem('introSeen')) {
        document.body.classList.add('revealed');
        return;
      }
    } catch (e) {}
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    window.mountIntro(document.body, {
      glyph: 'ascii',       // 'binary' | 'ascii' | 'pixel'
      motion: 'decode',     // 'decode' | 'scanline' | 'dissolve'
      palette: 'phosphor',  // 'mono' | 'phosphor'
      speed: 1,
      onReveal: () => document.body.classList.add('revealed')
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else { start(); }
})();
