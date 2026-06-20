/* Intro animation v2 — the seated Gandharan Buddha decodes itself out of a
   monospace character field, holds, then dissolves to reveal the page.

   One engine, many looks. Options (mountIntro / replayIntro / URL params):
     glyph   : 'binary' | 'ascii' | 'pixel'        (default 'binary')
     motion  : 'decode' | 'scanline' | 'dissolve'  (default 'decode')
     palette : 'mono'   | 'phosphor'               (default 'mono')
     speed   : number (default 1)
     stroke / bg : optional color overrides
     onReveal: callback when the page is revealed

   Depends on window.BUDDHA_GRID (assets/buddha-grid.js) — {cols,rows,data}.
*/
(function () {
  // ---- glyph sets --------------------------------------------------------
  const RAMP   = " .:-=+*#%@";          // ascii tone ramp (index 0..9)
  const BLOCKS = " \u2591\u2592\u2593\u2588"; // pixel: ░▒▓█  (5 levels)
  const SCRAMBLE = {
    binary: '01',
    ascii:  '01<>/\\|=+*#%$&{}[]?!',
    pixel:  '\u2591\u2592\u2593\u2588'
  };

  const PAL = {
    mono:     { bg: '#ffffff', fg: '#161514', glow: 0 },
    phosphor: { bg: '#070b09', fg: '#37f08e', glow: 1 }
  };

  // deterministic per-cell pseudo-random in [0,1)
  function rnd(i) {
    let x = (i * 2654435761) ^ 0x9e3779b9;
    x = (x ^ (x >>> 15)) * 0x85ebca6b;
    x = (x ^ (x >>> 13)) >>> 0;
    return x / 4294967296;
  }

  // ---- styles ------------------------------------------------------------
  const css = `
  .intro-overlay{ position:fixed; inset:0; z-index:9999;
    display:grid; place-items:center; overflow:hidden;
    background:var(--io-bg,#fff); cursor:pointer; transition:opacity .85s ease; }
  .intro-overlay.done{ opacity:0; pointer-events:none; }
  .intro-pre{ margin:0; white-space:pre; color:var(--io-fg,#161514);
    font-family:'IBM Plex Mono', ui-monospace, monospace; line-height:1;
    letter-spacing:0; user-select:none; will-change:contents, opacity, transform; }
  .intro-overlay.glow .intro-pre{ text-shadow:0 0 4px currentColor; }
  .intro-skip{ position:fixed; right:24px; bottom:22px; z-index:10000;
    font:500 12px/1 'IBM Plex Mono', monospace; letter-spacing:.14em;
    text-transform:uppercase; color:var(--io-fg,#161514); opacity:.42;
    background:none; border:0; cursor:pointer; padding:8px; transition:opacity .2s; }
  .intro-skip:hover{ opacity:.9; }
  @media (prefers-reduced-motion: reduce){ .intro-skip{ display:none; } }
  `;
  function injectStyle() {
    if (document.getElementById('intro-style')) return;
    const s = document.createElement('style');
    s.id = 'intro-style'; s.textContent = css; document.head.appendChild(s);
  }

  function urlConfig() {
    try {
      const q = new URLSearchParams(location.search), o = {};
      ['glyph','motion','palette','stroke','bg'].forEach(k => { if (q.has(k)) o[k] = q.get(k); });
      if (q.has('speed')) o.speed = parseFloat(q.get('speed'));
      return o;
    } catch (e) { return {}; }
  }

  let current = null, lastOpts = {};

  function mountIntro(target, opts) {
    opts = Object.assign({ glyph:'binary', motion:'decode', palette:'mono', speed:1 },
                         urlConfig(), opts || {});
    lastOpts = opts;
    const host = target || document.body;
    const G = window.BUDDHA_GRID;
    const speed = opts.speed > 0 ? opts.speed : 1;
    const reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    injectStyle();

    const pal = Object.assign({}, PAL[opts.palette] || PAL.mono);
    if (opts.bg) pal.bg = opts.bg;
    if (opts.stroke) pal.fg = opts.stroke;

    const overlay = document.createElement('div');
    overlay.className = 'intro-overlay' + (pal.glow ? ' glow' : '');
    overlay.style.setProperty('--io-bg', pal.bg);
    overlay.style.setProperty('--io-fg', pal.fg);

    const pre = document.createElement('pre');
    pre.className = 'intro-pre';
    overlay.appendChild(pre);

    const skip = document.createElement('button');
    skip.className = 'intro-skip'; skip.textContent = 'skip';
    skip.setAttribute('aria-label', 'Skip intro');

    host.appendChild(overlay);
    host.appendChild(skip);

    // ---- precompute per-cell final char + resolve time -------------------
    const cols = G.cols, rows = G.rows, N = cols * rows, data = G.data;
    const lit = new Uint8Array(N);
    const finalCh = new Array(N);
    const maxFigRow = 82;            // figure ends here; rest is empty
    for (let i = 0; i < N; i++) {
      const ch = data[i];
      if (ch === ' ') { lit[i] = 0; finalCh[i] = ' '; continue; }
      lit[i] = 1;
      const level = ch.charCodeAt(0) - 48; // '0'..'9'
      if (opts.glyph === 'binary') {
        finalCh[i] = rnd(i) < 0.5 ? '0' : '1';
      } else if (opts.glyph === 'pixel') {
        finalCh[i] = BLOCKS[1 + Math.round(level / 9 * (BLOCKS.length - 2))];
      } else { // ascii
        finalCh[i] = RAMP[1 + Math.round(level / 9 * (RAMP.length - 2))];
      }
    }

    const DRAW = 2600, HOLD = 180, DISSOLVE = 950;
    const exit = opts.exit || 'ember';
    const cx = cols / 2, cy = 40;
    const maxD = Math.hypot(cx, cy);
    const resolveAt = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      if (!lit[i]) continue;
      const x = i % cols, y = (i / cols) | 0;
      let f;
      if (opts.motion === 'scanline') {
        f = (y / maxFigRow) + rnd(i) * 0.05;
      } else if (opts.motion === 'dissolve') {
        f = rnd(i);
      } else { // decode — wave from centre outward
        f = (Math.hypot(x - cx, y - cy) / maxD) * 0.8 + rnd(i) * 0.18;
      }
      resolveAt[i] = Math.max(0, Math.min(1, f)) * DRAW;
    }
    const scr = SCRAMBLE[opts.glyph] || SCRAMBLE.binary;

    // centroid of the head band — the point we zoom into on exit
    let fxs = 0, fys = 0, fn = 0;
    for (let i = 0; i < N; i++) {
      if (!lit[i]) continue;
      const y = (i / cols) | 0;
      if (y >= 20 && y <= 36) { fxs += i % cols; fys += y; fn++; }
    }
    const faceX = fn ? fxs / fn : cx, faceY = fn ? fys / fn : 28;

    // ---- reveal / teardown ----------------------------------------------
    let finished = false; const timers = [];
    function reveal() {
      if (finished) return; finished = true;
      timers.forEach(clearTimeout);
      overlay.classList.add('done'); skip.remove();
      setTimeout(() => overlay.remove(), 900);
      if (current === ref) current = null;
      if (typeof opts.onReveal === 'function') opts.onReveal();
    }
    const ref = { overlay, skip, reveal };
    current = ref;
    overlay.addEventListener('click', reveal);
    skip.addEventListener('click', (e) => { e.stopPropagation(); reveal(); });

    // ---- fit the grid to the viewport -----------------------------------
    function fit() {
      const vw = window.innerWidth, vh = window.innerHeight;
      const fsH = (vh * 0.92) / rows;          // line-height = 1
      const fsW = (vw * 0.94) / (cols * 0.6);  // char advance ~0.6em
      const fs = Math.max(4, Math.min(fsH, fsW));
      pre.style.fontSize = fs.toFixed(2) + 'px';
    }
    fit();
    const onResize = () => fit();
    window.addEventListener('resize', onResize);
    const _cleanup = reveal;
    ref.reveal = function () { window.removeEventListener('resize', onResize); _cleanup(); };
    overlay.addEventListener('click', () => {}); // (listeners already use closure ref)

    if (reduce) {
      // draw final state, brief hold, reveal
      let s = '';
      for (let y = 0; y < rows; y++) { for (let x = 0; x < cols; x++) s += finalCh[y*cols+x]; s += '\n'; }
      pre.textContent = s;
      timers.push(setTimeout(ref.reveal, 1200));
      return;
    }

    // ---- main render loop -----------------------------------------------
    let start = null, raf = 0, frame = 0;
    function render(now) {
      if (finished) return;
      if (start === null) start = now;
      const t = (now - start) * speed;
      frame++;
      const bucket = (frame / 3) | 0;       // re-randomise scramble ~20fps
      const scanFront = (t / DRAW) * maxFigRow;

      let out = '';
      for (let y = 0; y < rows; y++) {
        let line = '';
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          if (!lit[i]) { line += ' '; continue; }
          if (t >= resolveAt[i]) { line += finalCh[i]; continue; }
          if (opts.motion === 'scanline') {
            // unresolved cells stay blank; a bright cursor rides the frontier
            if (y <= scanFront + 1.2 && y > scanFront - 1.2) {
              line += scr[(bucket + i) % scr.length];
            } else { line += ' '; }
          } else {
            line += scr[((bucket * 7 + i * 13) >>> 0) % scr.length];
          }
        }
        out += line + '\n';
      }
      pre.textContent = out;

      if (t < DRAW + 60) { raf = requestAnimationFrame(render); return; }

      // settle: ensure final state painted once
      let s = '';
      for (let y = 0; y < rows; y++) { for (let x = 0; x < cols; x++) s += finalCh[y*cols+x]; s += '\n'; }
      pre.textContent = s;
    }
    raf = requestAnimationFrame(render);

    // hold a beat, then exit
    const T = (ms) => ms / speed;

    // dissolve-up (used by non-decode motions if opts.exit==='dissolve')
    function dissolveExit() {
      const t0 = performance.now();
      (function fade(n){
        const p = Math.min(1, (n - t0) / DISSOLVE);
        pre.style.opacity = String(1 - p);
        pre.style.transform = `translateY(${-12*p}px) scale(${1+0.04*p})`;
        if (p < 1 && !finished) requestAnimationFrame(fade);
      })(t0);
      timers.push(setTimeout(() => ref.reveal(), T(DISSOLVE)));
    }

    // EMBER-RISE — the figure's glyphs detach and float upward with a gentle
    // outward drift and sideways sway, fading as they ascend. Releases bottom-up
    // so the figure evaporates upward, then flows into the page. One canvas,
    // ~2k plain fillText/frame, no shadows — cheap.
    function emberExit() {
      const fs = parseFloat(pre.style.fontSize) || 12;
      const probe = document.createElement('canvas').getContext('2d');
      probe.font = fs + "px 'IBM Plex Mono', ui-monospace, monospace";
      const adv = probe.measureText('0').width || fs * 0.6;
      const rect = pre.getBoundingClientRect();
      const ox = rect.left, oy = rect.top;          // grid origin on screen
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const vw = window.innerWidth, vh = window.innerHeight;

      const cv = document.createElement('canvas');
      cv.width = Math.ceil(vw * dpr); cv.height = Math.ceil(vh * dpr);
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1;';
      const cctx = cv.getContext('2d');
      cctx.scale(dpr, dpr);
      cctx.font = fs + "px 'IBM Plex Mono', ui-monospace, monospace";
      cctx.textBaseline = 'top';
      overlay.appendChild(cv);
      pre.style.display = 'none';

      // build particles; track the figure's vertical extent for a bottom-up wave
      const P = [];
      const cgx = ox + (cols / 2) * adv;
      let yMin = Infinity, yMax = -Infinity;
      for (let i = 0; i < N; i++) {
        if (!lit[i] || finalCh[i] === ' ') continue;
        const gx = i % cols, gy = (i / cols) | 0;
        const px = ox + gx * adv, py = oy + gy * fs;
        if (py < yMin) yMin = py; if (py > yMax) yMax = py;
        P.push({ x: px, y: py, ch: finalCh[i],
          out: px < cgx ? -1 : 1,                    // gentle outward x bias
          seed: i });
      }
      const figH = Math.max(1, yMax - yMin);

      const DUR = 2000;
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const easeIn = (t) => t * t;
      const t0 = performance.now();

      (function step(now) {
        if (finished) return;
        const T0 = (now - t0) * speed;
        const g = Math.min(1, T0 / DUR);             // global progress
        const frame = (T0 / 60) | 0;                 // flicker tick

        cctx.clearRect(0, 0, vw, vh);
        cctx.fillStyle = pal.fg;
        const rise = vh * 0.62;                      // how far embers float up

        for (let k = 0; k < P.length; k++) {
          const p = P[k];
          // bottom-up release: lower glyphs (larger y) let go first
          const yn = (p.y - yMin) / figH;            // 0 top .. 1 bottom
          const delay = (1 - yn) * 0.45 + rnd(p.seed) * 0.12;
          let lt = (g - delay) / (1 - delay * 0.7);
          if (lt <= 0) {
            const ch = rnd(p.seed + frame) < 0.05 ? scr[(frame + p.seed) % scr.length] : p.ch;
            cctx.globalAlpha = 1;
            cctx.fillText(ch, p.x, p.y);
            continue;
          }
          lt = Math.min(1, lt);
          const e = easeOut(lt);
          const r1 = rnd(p.seed), r2 = rnd(p.seed * 7 + 3);
          const up = e * rise * (0.7 + r1 * 0.6);                       // upward drift
          const sway = Math.sin(lt * Math.PI * (1.5 + r2) + p.seed) * fs * 1.6 * lt;
          const drift = p.out * e * fs * (1.5 + r2 * 3);                // slight outward
          const sx = p.x + drift + sway;
          const sy = p.y - up;
          const ch = lt < 0.35 && rnd(p.seed + frame) < 0.4
            ? scr[((frame * 7 + p.seed * 13) >>> 0) % scr.length] : p.ch;
          cctx.globalAlpha = Math.max(0, 1 - easeIn(lt));
          cctx.fillText(ch, sx, sy);
        }
        cctx.globalAlpha = 1;

        // flow into the page: fade the whole overlay over the back half
        overlay.style.opacity = g < 0.45 ? '1'
          : Math.max(0, 1 - (g - 0.45) / 0.55).toFixed(3);

        if (g < 1) requestAnimationFrame(step); else ref.reveal();
      })(t0);
    }

    // simple crossfade: hold the finished figure a beat, fade the overlay
    // out to reveal the home screen underneath.
    function fadeExit() {
      const FADE = 900;
      const t0 = performance.now();
      (function f(n) {
        if (finished) return;
        const p = Math.min(1, (n - t0) * speed / FADE);
        overlay.style.opacity = String(1 - p);
        if (p < 1) requestAnimationFrame(f); else ref.reveal();
      })(t0);
    }

    timers.push(setTimeout(fadeExit, T(DRAW + HOLD + 350)));
  }

  function replayIntro(opts) {
    if (current) { try { current.reveal(); } catch (e) {} }
    document.querySelectorAll('.intro-overlay, .intro-skip').forEach(n => n.remove());
    current = null;
    mountIntro(document.body, Object.assign({}, lastOpts, opts || {}));
  }

  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d && d.type === 'intro:apply') replayIntro(d.opts || {});
  });

  window.mountIntro = mountIntro;
  window.replayIntro = replayIntro;
})();
