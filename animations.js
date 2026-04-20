/* animations.js — XxXAurora enhanced FX */
(function () {
  'use strict';

  const MOTION_OK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── SCRAMBLE UTILITY ──────────────────────────────────────────────
  const SC_CHARS = '!<>_\\/[]{}—=+*^?#アイウエオカキクケ0123456789ABCDEF';

  function scrambleTo(el, targetText, opts) {
    opts = opts || {};
    const speed  = opts.speed  || 1.8;   // chars-per-frame resolve rate
    const onDone = opts.onDone || null;

    const chars = targetText.split('');
    const queue = chars.map((c, i) => ({
      to:    c,
      start: Math.floor(i / speed),
      end:   Math.floor(i / speed) + Math.floor(6 + Math.random() * 10),
      cur:   '',
    }));

    let frame = 0;
    let raf;

    function tick() {
      let done = 0;
      let out  = '';
      queue.forEach(item => {
        if (frame >= item.end) {
          done++;
          out += item.to;
        } else if (frame >= item.start) {
          if (!item.cur || Math.random() < 0.32) {
            item.cur = SC_CHARS[Math.floor(Math.random() * SC_CHARS.length)];
          }
          out += item.cur;
        } else {
          out += item.to;
        }
      });

      el.textContent = out;

      if (done < chars.length) {
        raf = requestAnimationFrame(() => { frame++; tick(); });
      } else {
        onDone && onDone();
      }
    }

    cancelAnimationFrame(raf);
    tick();
  }

  // ── 1. WELCOME TERMINAL BOOT ──────────────────────────────────────
  const BOOT_LINES = [
    '> NEURAL INTERFACE v2.4.1 — ACTIVE',
    '> LOADING ASSET MANIFESTS .......',
    '> ESTABLISHING SECURE TUNNEL ... OK',
    '> COMPILING VISUAL CORTEX ........',
    '> ALL SYSTEMS NOMINAL',
  ];

  function typeInto(el, text, msPerChar) {
    return new Promise(resolve => {
      el.textContent = '';
      let i = 0;
      const id = setInterval(() => {
        el.textContent += text[i++];
        if (i >= text.length) { clearInterval(id); resolve(); }
      }, msPerChar);
    });
  }

  function initWelcomeTerminal() {
    const overlay = document.getElementById('welcome-overlay');
    const panel   = overlay && overlay.querySelector('.welcome-panel');
    if (!panel) return;

    // Build terminal container
    const term = document.createElement('div');
    term.className = 'welcome-terminal';
    term.setAttribute('aria-hidden', 'true');
    panel.insertBefore(term, panel.firstChild);

    const lineEls = BOOT_LINES.map(() => {
      const p = document.createElement('p');
      p.className = 'wt-line';
      term.appendChild(p);
      return p;
    });

    // Type each line with cumulative delay
    let delay = 180;
    BOOT_LINES.forEach((text, i) => {
      const isLast = i === BOOT_LINES.length - 1;
      setTimeout(() => {
        if (isLast) lineEls[i].classList.add('wt-line-final');
        typeInto(lineEls[i], text, 18);
      }, delay);
      delay += text.length * 18 + 120;
    });

    // When phase → intro: fade terminal out
    const mo = new MutationObserver(() => {
      const phase = overlay.getAttribute('data-phase');
      if (phase === 'intro') {
        mo.disconnect();
        term.style.transition = 'opacity 450ms ease';
        term.style.opacity    = '0';
      }
    });
    mo.observe(overlay, { attributes: true, attributeFilter: ['data-phase'] });
  }

  // ── 2. CP2077-STYLE GLITCH SYSTEM ────────────────────────────────
  function initGlitchBars() {
    const overlay = document.getElementById('welcome-overlay');
    if (!overlay) return;

    const wrap = document.createElement('div');
    wrap.className = 'wg-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    overlay.appendChild(wrap);

    const panel = overlay.querySelector('.welcome-panel');

    // ─ HEAVY TEAR: panel displacement + full-width slices + RGB ghost
    function heavyTear() {
      // Shake the panel (CP2077 signature move)
      if (panel) {
        panel.classList.add('cp77-tear');
        setTimeout(() => panel.classList.remove('cp77-tear'), 260);
      }

      // 2-5 full-width horizontal displacement slices
      const count = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const el    = document.createElement('div');
        const top   = 4 + Math.random() * 90;
        const h     = 3 + Math.random() * 22;
        const shift = (Math.random() - 0.5) * 70;
        const cyan  = Math.random() > 0.42;
        const a     = 0.28 + Math.random() * 0.48;
        el.style.cssText = `position:absolute;left:0;right:0;top:${top}%;height:${h}px;` +
          `background:${cyan ? `rgba(0,232,255,${a})` : `rgba(255,30,80,${a})`};` +
          `transform:translateX(${shift}px);mix-blend-mode:screen;pointer-events:none;`;
        wrap.appendChild(el);
        setTimeout(() => el.remove(), 55 + Math.random() * 90);
      }

      // RGB ghost pair (1px red + 1px cyan, offset ±8px)
      const gy = 8 + Math.random() * 82;
      [['rgba(255,30,80,0.7)', -8], ['rgba(0,232,255,0.7)', 8]].forEach(([col, dx]) => {
        const g = document.createElement('div');
        g.style.cssText = `position:absolute;left:0;right:0;top:${gy}%;height:1px;` +
          `background:${col};transform:translateX(${dx}px);mix-blend-mode:screen;pointer-events:none;`;
        wrap.appendChild(g);
        setTimeout(() => g.remove(), 75);
      });

      // Brief full-screen cyan flash
      const flash = document.createElement('div');
      flash.className = 'cp77-flash';
      flash.style.background = 'rgba(0,232,255,0.055)';
      overlay.appendChild(flash);
      setTimeout(() => flash.remove(), 95);
    }

    // ─ MEDIUM: scattered colored bars
    function colorBars() {
      const count = 5 + Math.floor(Math.random() * 7);
      for (let i = 0; i < count; i++) {
        const el   = document.createElement('div');
        const top  = Math.random() * 100;
        const h    = 1 + Math.random() * 7;
        const w    = 15 + Math.random() * 70;
        const left = Math.random() * (100 - w);
        const cyan = Math.random() > 0.38;
        const a    = 0.22 + Math.random() * 0.52;
        el.style.cssText = `position:absolute;top:${top}%;left:${left}%;width:${w}%;height:${h}px;` +
          `background:${cyan ? `rgba(0,232,255,${a})` : `rgba(255,30,80,${a})`};` +
          `mix-blend-mode:screen;pointer-events:none;`;
        wrap.appendChild(el);
        setTimeout(() => el.remove(), 35 + Math.random() * 75);
      }
    }

    // ─ MICRO-FLICKER: constant single-line scanline hits
    function microFlicker() {
      if (overlay.getAttribute('data-phase') === 'entered') return;
      if (Math.random() > 0.55) {
        const el  = document.createElement('div');
        const top = Math.random() * 100;
        const a   = 0.35 + Math.random() * 0.55;
        el.style.cssText = `position:absolute;left:0;right:0;top:${top}%;height:1px;` +
          `background:rgba(0,232,255,${a});mix-blend-mode:screen;pointer-events:none;`;
        wrap.appendChild(el);
        setTimeout(() => el.remove(), 25 + Math.random() * 35);
      }
      setTimeout(microFlicker, 90 + Math.random() * 220);
    }

    // ─ MAIN BURST SCHEDULER
    function spawnBurst() {
      if (overlay.getAttribute('data-phase') === 'entered') return;
      const r = Math.random();
      if      (r > 0.62) heavyTear();
      else if (r > 0.22) colorBars();
      // else: skip (natural quiet moment)
      setTimeout(spawnBurst, 480 + Math.random() * 1400);
    }

    setTimeout(spawnBurst,   280);
    setTimeout(microFlicker, 150);
  }

  // ── 3. WELCOME SCANLINE TICKER (side labels) ───────────────────────
  function initWelcomeSideTicker() {
    const overlay = document.getElementById('welcome-overlay');
    if (!overlay || !MOTION_OK) return;

    const ticker = document.createElement('div');
    ticker.className = 'wt-side-ticker';
    ticker.setAttribute('aria-hidden', 'true');
    overlay.appendChild(ticker);

    const labels = ['SYS:ONLINE', 'MEM:OK', 'NET:SECURE', 'GPU:ACTIVE', 'AI:READY'];
    let idx = 0;

    const el = document.createElement('span');
    el.textContent = labels[0];
    ticker.appendChild(el);

    setInterval(() => {
      if (overlay.getAttribute('data-phase') === 'entered') return;
      idx = (idx + 1) % labels.length;
      scrambleTo(el, labels[idx], { speed: 3 });
    }, 1200);
  }

  function initWelcomeTextGlitch() {
    const overlay = document.getElementById('welcome-overlay');
    if (!overlay || !MOTION_OK) return;

    const brand = overlay.querySelector('.welcome-brand');
    const sub = overlay.querySelector('.welcome-sub');
    if (!brand && !sub) return;

    let burstTimer = 0;

    function syncTextLayers() {
      if (brand) {
        brand.dataset.brand = brand.textContent.trim();
      }
      if (sub) {
        sub.dataset.text = sub.textContent.trim();
      }
    }

    function fireBurst(el, duration) {
      if (!el) return;
      el.classList.remove('welcome-text-glitch');
      void el.offsetWidth;
      el.classList.add('welcome-text-glitch');
      window.setTimeout(() => el.classList.remove('welcome-text-glitch'), duration);
    }

    function stopBursts() {
      window.clearTimeout(burstTimer);
      burstTimer = 0;
      brand && brand.classList.remove('welcome-text-glitch');
      sub && sub.classList.remove('welcome-text-glitch');
    }

    function scheduleBurst() {
      stopBursts();
      if (overlay.getAttribute('data-phase') !== 'intro') return;

      syncTextLayers();
      fireBurst(brand, 210);

      if (sub && Math.random() > 0.26) {
        window.setTimeout(() => fireBurst(sub, 180), 35 + Math.random() * 55);
      }

      burstTimer = window.setTimeout(scheduleBurst, 620 + Math.random() * 920);
    }

    const textMo = new MutationObserver(syncTextLayers);
    brand && textMo.observe(brand, { childList: true, subtree: true, characterData: true });
    sub && textMo.observe(sub, { childList: true, subtree: true, characterData: true });

    const phaseMo = new MutationObserver(() => {
      syncTextLayers();
      const phase = overlay.getAttribute('data-phase');
      if (phase === 'intro') {
        scheduleBurst();
        return;
      }

      stopBursts();
      if (phase === 'entered') {
        textMo.disconnect();
        phaseMo.disconnect();
      }
    });

    phaseMo.observe(overlay, { attributes: true, attributeFilter: ['data-phase'] });
    syncTextLayers();

    if (overlay.getAttribute('data-phase') === 'intro') {
      scheduleBurst();
    }
  }

  // ── 4. HERO TITLE GLITCH LAYERS ───────────────────────────────────
  // CSS .glitch-hit triggers the animation; JS adds the duplicate layers.
  function enhanceHeroGlitch() {
    const h2 = document.querySelector('.hero h2');
    if (!h2) return;

    const txt = h2.textContent.trim();
    h2.dataset.glitchText = txt;

    [1, 2].forEach(n => {
      const lay = document.createElement('span');
      lay.className      = `glitch-layer glitch-layer-${n}`;
      lay.textContent    = txt;
      lay.setAttribute('aria-hidden', 'true');
      h2.appendChild(lay);
    });
  }

  // ── 5. PROJECT CARDS SCAN-IN ──────────────────────────────────────
  function initCardScanIn() {
    if (!window.anime) return;

    const cards = document.querySelectorAll('.project-grid .project-card');
    if (!cards.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);

        const scan = entry.target.querySelector('.card-scan-line');
        if (!scan) return;

        anime({
          targets:  scan,
          scaleX:   [0, 1.04, 0],
          opacity:  [0, 0.55, 0],
          duration: 520,
          delay:    80,
          easing:   'easeInOutQuad',
        });
      });
    }, { threshold: 0.18 });

    cards.forEach(card => {
      const scan = document.createElement('div');
      scan.className = 'card-scan-line';
      scan.setAttribute('aria-hidden', 'true');
      card.appendChild(scan);
      obs.observe(card);
    });
  }

  // ── 6. SIDEBAR NAV FLIP ───────────────────────────────────────────
  const FLIP_POOL = '0123456789ABCDEF><#@/\\';

  function flipTo(el, target, ms) {
    const steps = Math.floor(ms / 38);
    let step = 0;
    const id = setInterval(() => {
      step++;
      if (step >= steps) {
        el.textContent = target;
        clearInterval(id);
        return;
      }
      const progress  = step / steps;
      const resolved  = Math.floor(progress * target.length);
      let out = '';
      for (let i = 0; i < target.length; i++) {
        out += i < resolved
          ? target[i]
          : FLIP_POOL[Math.floor(Math.random() * FLIP_POOL.length)];
      }
      el.textContent = out;
    }, 38);
  }

  function initSidebarFlip() {
    document.querySelectorAll('.sidebar nav a').forEach(link => {
      link.addEventListener('mouseenter', () => {
        const cur = link.textContent.trim();
        flipTo(link, cur, 340);
      });
    });
  }

  // ── 7. SECTION TITLE DECODE ON SCROLL ────────────────────────────
  function initSectionDecode() {
    const heads = document.querySelectorAll('.section-head h3');
    if (!heads.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const text = entry.target.textContent.trim();
        // small delay so GSAP reveal completes first
        setTimeout(() => scrambleTo(entry.target, text, { speed: 0.6 }), 160);
      });
    }, { threshold: 0.45 });

    heads.forEach(h => obs.observe(h));
  }

  // ── 8. WELCOME CORNER BRACKETS ────────────────────────────────────
  function initWelcomeCorners() {
    const overlay = document.getElementById('welcome-overlay');
    if (!overlay || !window.anime) return;

    const wrap = document.createElement('div');
    wrap.className = 'wc-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    overlay.appendChild(wrap);

    ['tl', 'tr', 'bl', 'br'].forEach(pos => {
      const c = document.createElement('span');
      c.className = `wc-corner wc-${pos}`;
      wrap.appendChild(c);
    });

    // phase → intro: animate corners in
    const mo = new MutationObserver(() => {
      const phase = overlay.getAttribute('data-phase');
      if (phase === 'intro') {
        mo.disconnect();
        anime({
          targets:   '.wc-corner',
          opacity:   [0, 0.65],
          scale:     [0.5, 1],
          duration:  700,
          delay:     anime.stagger(120),
          easing:    'easeOutExpo',
        });
      }
    });
    mo.observe(overlay, { attributes: true, attributeFilter: ['data-phase'] });
  }

  // ── ENTRY POINT ───────────────────────────────────────────────────
  function init() {
    if (!MOTION_OK) return;

    // Welcome effects (always run, overlay present at page load)
    initWelcomeTerminal();
    initGlitchBars();
    initWelcomeTextGlitch();
    initWelcomeSideTicker();
    initWelcomeCorners();

    // Post-entry effects: wait for home-entered body class
    const bodyMo = new MutationObserver(() => {
      if (!document.body.classList.contains('home-entered')) return;
      bodyMo.disconnect();
      // slight delay so GSAP entry animation starts
      setTimeout(() => {
        enhanceHeroGlitch();
        initCardScanIn();
        initSidebarFlip();
        initSectionDecode();
      }, 200);
    });
    bodyMo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
