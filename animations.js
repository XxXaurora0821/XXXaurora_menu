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

  // ── 2. GLITCH BARS (welcome ambience) ─────────────────────────────
  function initGlitchBars() {
    const overlay = document.getElementById('welcome-overlay');
    if (!overlay) return;

    const wrap = document.createElement('div');
    wrap.className = 'wg-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    overlay.appendChild(wrap);

    function spawnBurst() {
      if (overlay.getAttribute('data-phase') === 'entered') return;

      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const bar    = document.createElement('div');
        const top    = Math.random() * 100;
        const h      = 1 + Math.random() * 5;
        const w      = 20 + Math.random() * 55;
        const left   = Math.random() * (100 - w);
        const cyan   = Math.random() > 0.4;
        bar.className = 'wg-bar';
        bar.style.cssText =
          `top:${top}%;left:${left}%;width:${w}%;height:${h}px;` +
          `background:${cyan ? 'rgba(0,232,255,0.38)' : 'rgba(255,30,80,0.28)'};`;
        wrap.appendChild(bar);

        const life = 45 + Math.random() * 90;
        setTimeout(() => bar.remove(), life);
      }

      setTimeout(spawnBurst, 700 + Math.random() * 1200);
    }

    setTimeout(spawnBurst, 400);
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
        setTimeout(() => scrambleTo(entry.target, text, { speed: 2.2 }), 160);
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
