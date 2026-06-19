/* Intro animation — a line drawing of a standing Greaco-Indian (Gandharan)
   Buddha is sketched on, then the scene dissolves to reveal the page.
   Modelled on the classic standing Gandhara type: large nimbus, wavy hair
   with ushnisha topknot, serene mustached face, heavy sanghati draped over
   both shoulders with cascading U-folds, the proper-left arm hanging with
   tight stacked parallel folds to a lowered hand. (Lotus set aside for now.)

   Single-weight line art, drawn on with the pathLength=1 dash trick.

   Config (any of): stroke, weight, bg, speed, skipFont, onReveal.
   Read from mountIntro(opts) AND URL params (?stroke=&weight=&speed=&bg=).
   window.replayIntro(opts) re-runs it; a postMessage {type:'intro:apply', opts}
   does the same (used by the Tweaks panel).
*/
(function () {
  // ---- Line art (viewBox 0 0 360 640) ------------------------------------
  function buildBuddha() {
    const P = (cls, d) => `<path class="dl ${cls}" pathLength="1" d="${d}"/>`;
    const C = (cls, cx, cy, r) =>
      `<circle class="dl ${cls}" pathLength="1" cx="${cx}" cy="${cy}" r="${r}"/>`;

    let s = '';

    // nimbus / halo
    s += P('d-halo', 'M76,120 A104,104 0 1 1 284,120 A104,104 0 1 1 76,120 Z');

    // topknot (ushnisha) + wavy hair
    s += P('d-hair', 'M158,60 C154,40 206,40 202,60');
    s += P('d-hair2', 'M162,52 C166,44 174,44 178,52 C182,44 192,44 198,54');
    s += P('d-hair2', 'M150,86 C156,76 164,76 170,86 M174,84 C180,74 190,74 196,84 M200,88 C206,80 214,80 220,90');
    s += P('d-hair', 'M138,140 C140,92 160,68 180,68 C200,68 222,92 224,140');
    s += P('d-hair2', 'M140,118 C146,110 152,110 158,118 M204,118 C210,110 218,110 224,120');

    // face
    s += P('d-face', 'M180,72 C150,72 138,102 138,134 C138,170 158,196 180,196 C202,196 222,170 222,134 C222,102 210,72 180,72 Z');
    // long earlobes
    s += P('d-ear', 'M138,128 C127,134 127,170 142,180');
    s += P('d-ear', 'M222,128 C233,134 233,170 218,180');
    // brows
    s += P('d-feat', 'M148,124 C160,117 172,117 180,123');
    s += P('d-feat', 'M180,123 C188,117 200,117 212,124');
    // urna
    s += C('d-feat', 180, 118, 2.4);
    // half-open downcast eyes
    s += P('d-feat', 'M150,136 C160,130 172,130 180,135 C173,142 160,142 150,136 Z');
    s += P('d-feat', 'M180,135 C188,130 200,130 210,136 C200,142 187,142 180,135 Z');
    // nose
    s += P('d-feat', 'M180,124 L175,156 C172,162 188,162 185,156');
    s += P('d-feat', 'M175,156 C178,159 182,159 185,156');
    // mustache
    s += P('d-feat', 'M164,168 C172,164 178,165 180,169 C182,165 188,164 196,168');
    // lips
    s += P('d-feat', 'M168,176 C174,172 186,172 192,176');
    s += P('d-feat', 'M169,177 C175,183 185,183 191,177');
    // neck + throat ring
    s += P('d-body', 'M166,196 L167,212 M194,196 L193,212');
    s += P('d-body', 'M162,206 C172,213 188,213 198,206');

    // ---- robe ----
    // front neckline + thick rolled himation edge crossing down-left
    s += P('d-robe', 'M158,212 C168,236 196,238 224,214');
    s += P('d-robe', 'M236,214 C230,256 196,290 150,306');
    s += P('d-robe', 'M150,306 C150,318 154,326 160,330');
    // cascading chest U-folds
    s += P('d-robe', 'M150,224 C166,250 206,252 232,224');
    s += P('d-robe', 'M150,242 C168,272 204,272 234,246');
    s += P('d-robe', 'M152,262 C172,292 202,294 232,266');
    s += P('d-robe', 'M156,282 C176,312 200,314 228,286');
    s += P('d-robe', 'M160,302 C180,330 198,332 222,306');
    s += P('d-robe', 'M166,320 C184,346 198,348 216,324');
    // belly swag folds
    s += P('d-robe', 'M152,340 C172,378 196,380 222,346');
    s += P('d-robe', 'M150,366 C174,406 196,408 222,372');
    s += P('d-robe', 'M150,392 C176,430 198,430 222,398');

    // proper-left arm (viewer right): hangs straight with stacked folds
    s += P('d-body', 'M248,216 C268,250 276,300 274,350 C273,402 266,456 258,500');
    s += P('d-body', 'M232,250 C246,296 250,348 248,398 C247,440 246,470 248,500');
    for (let y = 332; y <= 496; y += 12) {
      s += P('d-fold', `M249,${y} C257,${y + 6} 267,${y + 4} 273,${y - 1}`);
    }
    // lowered open hand holding a fold
    s += P('d-hand', 'M256,500 C250,516 252,536 264,544 C278,542 288,528 284,508');
    s += P('d-hand2', 'M262,544 L260,560 M270,546 L270,562 M278,540 L280,556');
    s += P('d-hand2', 'M284,510 C290,508 292,516 288,522');

    // proper-right arm (viewer left): cloth draped over the shoulder,
    // hanging panel of folds down the side
    s += P('d-body', 'M150,212 C124,224 110,250 106,286 C104,320 108,350 116,372');
    s += P('d-robe', 'M150,256 C138,278 126,298 118,322');
    s += P('d-fold', 'M110,300 C104,350 108,410 120,460');
    s += P('d-fold', 'M120,316 C116,360 120,414 132,462');
    s += P('d-fold', 'M132,314 C130,360 134,414 144,464');
    s += P('d-fold', 'M146,316 C146,360 148,414 154,466');
    s += P('d-fold', 'M158,320 C160,362 160,414 164,468');
    s += P('d-body', 'M172,258 C176,330 173,416 173,470');
    s += P('d-robe', 'M108,460 C130,478 158,478 174,468');

    // lower robe vertical folds + hem
    s += P('d-robe', 'M152,410 C150,470 152,540 156,604');
    s += P('d-robe', 'M170,420 C169,478 170,544 172,606');
    s += P('d-robe', 'M188,422 C188,480 188,546 188,608');
    s += P('d-robe', 'M206,420 C208,478 208,544 206,606');
    s += P('d-robe', 'M222,410 C228,470 226,540 222,604');
    s += P('d-body', 'M140,606 C164,620 214,620 240,606');

    return `<g class="intro-buddha">${s}</g>`;
  }

  const svg = `
    <svg class="intro-svg" viewBox="0 0 360 640" fill="none"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${buildBuddha()}
    </svg>`;

  // ---- Styles ------------------------------------------------------------
  const css = `
  .intro-overlay{
    position:fixed; inset:0; z-index:9999;
    display:grid; place-items:center;
    background:var(--intro-bg,#fff);
    cursor:pointer; transition:opacity .8s ease;
  }
  .intro-overlay.done{ opacity:0; pointer-events:none; }
  .intro-svg{
    height:min(82vh,660px); width:auto; overflow:visible;
    color:var(--intro-stroke,#111);
  }
  .intro-svg .dl{
    fill:none; stroke:currentColor;
    stroke-width:var(--intro-weight,1.4);
    stroke-linecap:round; stroke-linejoin:round;
    vector-effect:non-scaling-stroke;
    stroke-dasharray:1; stroke-dashoffset:1;
  }
  .intro-svg .intro-buddha{ opacity:0; }
  .intro-skip{
    position:fixed; right:24px; bottom:22px; z-index:10000;
    font:500 12px/1 var(--intro-skip-font, ui-monospace, monospace);
    letter-spacing:.14em; text-transform:uppercase;
    color:var(--intro-stroke,#111); opacity:.42;
    background:none; border:0; cursor:pointer; padding:8px;
    transition:opacity .2s;
  }
  .intro-skip:hover{ opacity:.9; }
  @media (prefers-reduced-motion: reduce){ .intro-skip{ display:none; } }
  `;

  function injectStyle() {
    if (document.getElementById('intro-style')) return;
    const s = document.createElement('style');
    s.id = 'intro-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---- Config ------------------------------------------------------------
  function urlConfig() {
    try {
      const q = new URLSearchParams(location.search);
      const o = {};
      if (q.has('stroke')) o.stroke = q.get('stroke');
      if (q.has('bg')) o.bg = q.get('bg');
      if (q.has('weight')) o.weight = parseFloat(q.get('weight'));
      if (q.has('speed')) o.speed = parseFloat(q.get('speed'));
      return o;
    } catch (e) { return {}; }
  }

  let current = null;
  let lastOpts = {};

  // ---- Timeline ----------------------------------------------------------
  function mountIntro(target, opts) {
    opts = Object.assign({}, urlConfig(), opts || {});
    lastOpts = opts;
    const host = target || document.body;
    const speed = opts.speed && opts.speed > 0 ? opts.speed : 1;
    const reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    injectStyle();

    const overlay = document.createElement('div');
    overlay.className = 'intro-overlay';
    if (opts.bg) overlay.style.setProperty('--intro-bg', opts.bg);
    if (opts.stroke) overlay.style.setProperty('--intro-stroke', opts.stroke);
    if (opts.weight) overlay.style.setProperty('--intro-weight', opts.weight);
    if (opts.skipFont) overlay.style.setProperty('--intro-skip-font', opts.skipFont);
    overlay.innerHTML = svg;

    const skip = document.createElement('button');
    skip.className = 'intro-skip';
    skip.textContent = 'skip';
    skip.setAttribute('aria-label', 'Skip intro');

    host.appendChild(overlay);
    host.appendChild(skip);

    const buddhaG = overlay.querySelector('.intro-buddha');
    const buddhaLines = overlay.querySelectorAll('.intro-buddha .dl');

    let finished = false;
    const timers = [];
    function reveal() {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      overlay.classList.add('done');
      skip.remove();
      setTimeout(() => overlay.remove(), 850);
      if (current === ref) current = null;
      if (typeof opts.onReveal === 'function') opts.onReveal();
    }
    const ref = { overlay, skip, reveal };
    current = ref;

    overlay.addEventListener('click', reveal);
    skip.addEventListener('click', (e) => { e.stopPropagation(); reveal(); });

    if (reduce) { reveal(); return; }

    const T = (ms) => ms / speed;
    const after = (ms, fn) => timers.push(setTimeout(fn, T(ms)));
    const drawOn = (el, dur, delay) => {
      el.style.transition =
        `stroke-dashoffset ${T(dur)}ms cubic-bezier(.6,.02,.2,1) ${T(delay)}ms`;
      requestAnimationFrame(() => { el.style.strokeDashoffset = '0'; });
    };

    // PHASE 1 — sketch the figure on, head → hem
    const n = buddhaLines.length;
    const step = 48;
    after(120, () => {
      buddhaG.style.transition = 'opacity 500ms ease';
      buddhaG.style.opacity = '1';
      buddhaLines.forEach((p, i) => drawOn(p, 900, i * step));
    });
    const drawDone = 120 + n * step + 900;

    // PHASE 2 — hold, then dissolve & reveal
    after(drawDone + 900, () => {
      const el = overlay.querySelector('.intro-svg');
      el.style.transition = 'opacity 900ms ease, transform 1100ms cubic-bezier(.4,0,.2,1)';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-10px) scale(1.03)';
    });
    after(drawDone + 1600, reveal);
  }

  function replayIntro(opts) {
    if (current) { current.overlay.remove(); current.skip.remove(); current = null; }
    document.querySelectorAll('.intro-overlay, .intro-skip').forEach((n) => n.remove());
    mountIntro(document.body, Object.assign({}, lastOpts, opts || {}));
  }

  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d && d.type === 'intro:apply') replayIntro(d.opts || {});
  });

  window.mountIntro = mountIntro;
  window.replayIntro = replayIntro;
})();
