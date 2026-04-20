(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    return;
  }

  const ENTER_CLASS = "page-enter";
  const LEAVE_CLASS = "page-leave";
  const LEAVE_MS = 240;

  function runEnter() {
    document.body.classList.remove(LEAVE_CLASS);
    document.body.classList.remove(ENTER_CLASS);
    window.requestAnimationFrame(() => {
      document.body.classList.add(ENTER_CLASS);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runEnter, { once: true });
  } else {
    runEnter();
  }

  window.addEventListener("pageshow", () => {
    document.body.classList.remove(LEAVE_CLASS);
  });

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) {
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const link = event.target.closest("a[href]");
    if (!link) {
      return;
    }
    if (link.target && link.target !== "_self") {
      return;
    }
    if (link.hasAttribute("download")) {
      return;
    }

    const href = link.getAttribute("href");
    if (!href || href.startsWith("javascript:")) {
      return;
    }

    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) {
      return;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return;
    }

    const isSameDocumentHash =
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash;
    if (isSameDocumentHash) {
      return;
    }

    event.preventDefault();
    document.body.classList.remove(ENTER_CLASS);
    document.body.classList.add(LEAVE_CLASS);

    window.setTimeout(() => {
      window.location.assign(url.href);
    }, LEAVE_MS);
  });
})();

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
  if (prefersReducedMotion || !supportsFinePointer) {
    return;
  }

  const body = document.body;
  if (!body) {
    return;
  }

  const cursor = document.createElement("div");
  cursor.className = "cyber-cursor";
  cursor.dataset.state = "idle";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = [
    '<span class="cyber-cursor__ring"></span>',
    '<span class="cyber-cursor__cross"></span>',
    '<span class="cyber-cursor__dot"></span>',
    '<span class="cyber-cursor__pulse"></span>'
  ].join("");

  body.appendChild(cursor);
  body.classList.add("cyber-cursor-enabled");

  const INTERACTIVE_SELECTOR = [
    "a[href]",
    "button",
    "[role='button']",
    "summary",
    "label[for]",
    "select",
    "input:not([type='hidden'])",
    "textarea",
    "[tabindex]:not([tabindex='-1'])"
  ].join(", ");
  const ARMING_MS = 130;
  const CLICK_PULSE_MS = 190;

  let activeTarget = null;
  let armingTimer = 0;
  let clickTimer = 0;
  let frameId = 0;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;

  const setCursorState = (nextState) => {
    if (cursor.dataset.state !== nextState) {
      cursor.dataset.state = nextState;
    }
  };

  const scheduleRender = () => {
    if (frameId) {
      return;
    }

    frameId = window.requestAnimationFrame(() => {
      frameId = 0;
      cursor.style.left = `${pointerX}px`;
      cursor.style.top = `${pointerY}px`;
    });
  };

  const resolveInteractiveTarget = (target) => {
    if (!(target instanceof Element)) {
      return null;
    }

    const candidate = target.closest(INTERACTIVE_SELECTOR);
    if (!candidate) {
      return null;
    }
    if (candidate.hasAttribute("disabled")) {
      return null;
    }
    if (candidate.getAttribute("aria-disabled") === "true") {
      return null;
    }
    return candidate;
  };

  const clearArmingTimer = () => {
    if (!armingTimer) {
      return;
    }
    window.clearTimeout(armingTimer);
    armingTimer = 0;
  };

  const armInteractiveState = (target) => {
    if (target === activeTarget && cursor.dataset.state !== "idle") {
      return;
    }

    activeTarget = target;
    clearArmingTimer();
    setCursorState("arming");

    armingTimer = window.setTimeout(() => {
      armingTimer = 0;
      if (activeTarget === target) {
        setCursorState("active");
      }
    }, ARMING_MS);
  };

  const resetToIdle = () => {
    activeTarget = null;
    clearArmingTimer();
    setCursorState("idle");
  };

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") {
        cursor.classList.remove("is-visible");
        resetToIdle();
        return;
      }

      pointerX = event.clientX;
      pointerY = event.clientY;
      scheduleRender();
      cursor.classList.add("is-visible");

      const hoveredTarget = resolveInteractiveTarget(event.target);
      if (hoveredTarget === activeTarget) {
        return;
      }
      if (!hoveredTarget) {
        resetToIdle();
        return;
      }
      armInteractiveState(hoveredTarget);
    },
    { passive: true }
  );

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") {
      return;
    }

    const hoveredTarget = resolveInteractiveTarget(event.target);
    if (!hoveredTarget) {
      return;
    }

    cursor.classList.remove("is-clicking");
    if (clickTimer) {
      window.clearTimeout(clickTimer);
    }
    void cursor.offsetWidth;
    cursor.classList.add("is-clicking");
    clickTimer = window.setTimeout(() => {
      clickTimer = 0;
      cursor.classList.remove("is-clicking");
    }, CLICK_PULSE_MS);
  });

  window.addEventListener("mouseout", (event) => {
    if (event.relatedTarget) {
      return;
    }
    cursor.classList.remove("is-visible");
    resetToIdle();
  });

  window.addEventListener("blur", () => {
    cursor.classList.remove("is-visible");
    resetToIdle();
  });
})();

(() => {
  const body = document.body;
  if (!body) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;

  body.classList.add("fx-enhanced");

  const ambientLayer = document.createElement("div");
  ambientLayer.className = "ambient-layer";
  ambientLayer.setAttribute("aria-hidden", "true");
  ambientLayer.innerHTML = [
    '<span class="ambient-blob ambient-blob-a"></span>',
    '<span class="ambient-blob ambient-blob-b"></span>',
    '<span class="ambient-blob ambient-blob-c"></span>',
    '<span class="ambient-grid"></span>'
  ].join("");

  const bodyFirst = body.firstElementChild;
  if (bodyFirst) {
    body.insertBefore(ambientLayer, bodyFirst);
  } else {
    body.appendChild(ambientLayer);
  }

  const progress = document.createElement("div");
  progress.className = "scroll-energy";
  progress.setAttribute("aria-hidden", "true");
  progress.innerHTML = '<span class="scroll-energy__bar"></span>';
  body.appendChild(progress);

  const updateScrollProgress = () => {
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const ratio = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    root.style.setProperty("--scroll-progress", ratio.toFixed(4));
  };

  updateScrollProgress();
  document.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);

  if (!prefersReducedMotion) {
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let frame = 0;

    const render = () => {
      frame = 0;
      pointerX += (targetX - pointerX) * 0.08;
      pointerY += (targetY - pointerY) * 0.08;

      root.style.setProperty("--ambient-x", pointerX.toFixed(4));
      root.style.setProperty("--ambient-y", pointerY.toFixed(4));

      if (
        Math.abs(pointerX - targetX) > 0.001 ||
        Math.abs(pointerY - targetY) > 0.001
      ) {
        frame = window.requestAnimationFrame(render);
      }
    };

    const onPointerMove = (event) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      targetX = (x - 0.5) * 2;
      targetY = (y - 0.5) * 2;
      if (!frame) {
        frame = window.requestAnimationFrame(render);
      }
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  const initDetailReveal = () => {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      return;
    }

    if (!document.querySelector(".detail-layout")) {
      return;
    }

    const blocks = Array.from(
      document.querySelectorAll(".detail-layout .panel, .detail-layout .quick-jump")
    );
    if (!blocks.length) {
      return;
    }

    blocks.forEach((block, index) => {
      block.classList.add("fx-reveal");
      block.style.setProperty("--fx-reveal-delay", `${Math.min(index * 48, 320)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries, activeObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -14% 0px"
      }
    );

    blocks.forEach((block) => observer.observe(block));
  };

  const initTiltPanels = () => {
    if (prefersReducedMotion || !supportsFinePointer) {
      return;
    }

    const targets = Array.from(
      document.querySelectorAll(".project-card, .quick-jump, .detail-layout .panel, .hero")
    );
    if (!targets.length) {
      return;
    }

    targets.forEach((target) => {
      target.classList.add("fx-tilt");
      if (!target.querySelector(".fx-glare")) {
        const glare = document.createElement("span");
        glare.className = "fx-glare";
        glare.setAttribute("aria-hidden", "true");
        target.appendChild(glare);
      }

      const resetTilt = () => {
        target.style.setProperty("--tilt-rotate-x", "0deg");
        target.style.setProperty("--tilt-rotate-y", "0deg");
        target.style.setProperty("--tilt-shift-x", "50%");
        target.style.setProperty("--tilt-shift-y", "50%");
        target.style.setProperty("--tilt-lift", "0px");
        target.classList.remove("is-tilting");
      };

      target.addEventListener("pointerenter", () => {
        target.classList.add("is-tilting");
      });

      target.addEventListener("pointermove", (event) => {
        const rect = target.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const rotateX = (0.5 - py) * 6;
        const rotateY = (px - 0.5) * 8;

        target.style.setProperty("--tilt-rotate-x", `${rotateX.toFixed(3)}deg`);
        target.style.setProperty("--tilt-rotate-y", `${rotateY.toFixed(3)}deg`);
        target.style.setProperty("--tilt-shift-x", `${(px * 100).toFixed(2)}%`);
        target.style.setProperty("--tilt-shift-y", `${(py * 100).toFixed(2)}%`);
        target.style.setProperty("--tilt-lift", "-4px");
      });

      target.addEventListener("pointerleave", resetTilt);
      target.addEventListener("blur", resetTilt, true);
    });
  };

  const initMagneticButtons = () => {
    if (prefersReducedMotion || !supportsFinePointer) {
      return;
    }

    const targets = Array.from(
      document.querySelectorAll(
        ".button, .ghost, .lang-btn, .sidebar nav a"
      )
    );
    if (!targets.length) {
      return;
    }

    targets.forEach((target) => {
      target.classList.add("fx-magnetic");

      const reset = () => {
        target.style.setProperty("--magnetic-x", "0px");
        target.style.setProperty("--magnetic-y", "0px");
      };

      target.addEventListener("pointermove", (event) => {
        const rect = target.getBoundingClientRect();
        const offsetX = event.clientX - (rect.left + rect.width / 2);
        const offsetY = event.clientY - (rect.top + rect.height / 2);
        const force = target.matches(".sidebar nav a") ? 0.09 : 0.14;
        target.style.setProperty("--magnetic-x", `${(offsetX * force).toFixed(2)}px`);
        target.style.setProperty("--magnetic-y", `${(offsetY * force).toFixed(2)}px`);
      });

      target.addEventListener("pointerleave", reset);
      target.addEventListener("blur", reset, true);
    });
  };

  const initTextDecode = () => {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      return;
    }

    const SELECTOR = "body :is(h1, h2, h3, h4, h5, h6, p, li, a, button, span)";
    const CHAR_POOL = "!<>_\\/[]{}-=+*^?#0123456789ABCDEF";
    const MIN_OPACITY = 0.18;
    const STAGGER_MS = 34;
    const rootEl = document.documentElement;
    const observed = new Set();
    const intersecting = new Set();
    const scheduled = new WeakSet();
    const active = new WeakSet();
    const decoded = new WeakSet();
    const orderMap = new WeakMap();
    let order = 0;
    let processFrame = 0;

    rootEl.dataset.globalTextDecode = "1";

    const shouldSkip = (el) => {
      if (!(el instanceof HTMLElement)) {
        return true;
      }

      if (
        el.matches(".welcome-progress-value, .glitch-layer") ||
        el.closest(
          ".welcome-terminal, .wt-side-ticker, .cyber-cursor, .ambient-layer, .scroll-energy, script, style"
        )
      ) {
        return true;
      }

      if (el.getAttribute("aria-hidden") === "true" || el.closest("[aria-hidden='true']")) {
        return true;
      }

      return false;
    };

    const getPrimaryTextNode = (el) => {
      if (shouldSkip(el)) {
        return null;
      }

      const hasBlockingChild = Array.from(el.children).some((child) => {
        if (!(child instanceof HTMLElement)) {
          return false;
        }
        return child.getAttribute("aria-hidden") !== "true";
      });
      if (hasBlockingChild) {
        return null;
      }

      const textNodes = Array.from(el.childNodes).filter(
        (node) =>
          node.nodeType === Node.TEXT_NODE &&
          typeof node.textContent === "string" &&
          node.textContent.trim()
      );

      if (textNodes.length !== 1) {
        return null;
      }

      return textNodes[0];
    };

    const isRenderable = (el) => {
      if (!(el instanceof HTMLElement) || !el.isConnected) {
        return false;
      }

      if (document.body.classList.contains("welcome-active") && !el.closest("#welcome-overlay")) {
        return false;
      }

      const overlay = document.getElementById("welcome-overlay");
      if (overlay && el.closest("#welcome-overlay")) {
        const phase = overlay.getAttribute("data-phase");
        if (
          phase !== "intro" &&
          el.matches(".welcome-brand, .welcome-sub, .welcome-hint")
        ) {
          return false;
        }
      }

      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) {
        return false;
      }

      let current = el;
      while (current) {
        if (current instanceof HTMLElement) {
          const style = window.getComputedStyle(current);
          if (style.display === "none" || style.visibility === "hidden") {
            return false;
          }
          if (Number.parseFloat(style.opacity || "1") < MIN_OPACITY) {
            return false;
          }
        }
        current = current.parentElement;
      }

      return true;
    };

    const getSpeed = (el, text) => {
      const denseLength = text.replace(/\s+/g, "").length;
      let speed = Math.max(0.9, Math.min(8.2, denseLength / 18));

      if (el.matches("h1, h2, h3, h4, h5, h6, .detail-sub, .project-tag")) {
        speed *= 0.82;
      } else if (el.matches("p, li, .project-summary, .project-note")) {
        speed *= 1.18;
      }

      return Math.max(0.8, Math.min(8.5, speed));
    };

    const scrambleNodeTo = (node, targetText, speed, onDone) => {
      const chars = targetText.split("");
      const queue = chars.map((char, index) => ({
        to: char,
        start: Math.floor(index / speed),
        end: Math.floor(index / speed) + Math.floor(5 + Math.random() * 8),
        current: ""
      }));

      let frame = 0;

      const tick = () => {
        let done = 0;
        let output = "";

        queue.forEach((item) => {
          if (frame >= item.end) {
            done += 1;
            output += item.to;
          } else if (frame >= item.start) {
            if (!item.current || Math.random() < 0.36) {
              item.current = CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
            }
            output += item.current;
          } else {
            output += item.to;
          }
        });

        node.textContent = output;

        if (done < chars.length) {
          window.requestAnimationFrame(() => {
            frame += 1;
            tick();
          });
          return;
        }

        node.textContent = targetText;
        onDone();
      };

      tick();
    };

    const startDecode = (el) => {
      const textNode = getPrimaryTextNode(el);
      if (!textNode) {
        return;
      }

      const finalText = textNode.textContent;
      if (!finalText || !finalText.trim()) {
        return;
      }

      active.add(el);
      el.dataset.textDecodeState = "running";
      el.dataset.textDecodeTarget = finalText.trim();

      scrambleNodeTo(textNode, finalText, getSpeed(el, finalText), () => {
        active.delete(el);
        decoded.add(el);
        intersecting.delete(el);
        observed.delete(el);
        el.dataset.textDecodeState = "done";
        observer.unobserve(el);
      });
    };

    const scheduleDecode = (el, delay) => {
      if (
        scheduled.has(el) ||
        active.has(el) ||
        decoded.has(el) ||
        el.dataset.textDecodeState === "done"
      ) {
        return;
      }

      scheduled.add(el);
      window.setTimeout(() => {
        scheduled.delete(el);

        if (!intersecting.has(el) || !isRenderable(el)) {
          requestProcess();
          return;
        }

        startDecode(el);
      }, delay);
    };

    const processTargets = () => {
      processFrame = 0;

      const ready = [];
      let blocked = false;

      intersecting.forEach((el) => {
        if (
          !(el instanceof HTMLElement) ||
          decoded.has(el) ||
          active.has(el) ||
          el.dataset.textDecodeState === "done"
        ) {
          return;
        }

        if (!isRenderable(el)) {
          blocked = true;
          return;
        }

        ready.push(el);
      });

      ready
        .sort((left, right) => (orderMap.get(left) || 0) - (orderMap.get(right) || 0))
        .forEach((el, index) => scheduleDecode(el, index * STAGGER_MS));

      if (blocked) {
        requestProcess();
      }
    };

    const requestProcess = () => {
      if (processFrame) {
        return;
      }
      processFrame = window.requestAnimationFrame(processTargets);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!(entry.target instanceof HTMLElement)) {
            return;
          }

          if (!entry.isIntersecting) {
            intersecting.delete(entry.target);
            return;
          }

          intersecting.add(entry.target);
          requestProcess();
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -12% 0px"
      }
    );

    Array.from(document.querySelectorAll(SELECTOR)).forEach((el) => {
      const textNode = getPrimaryTextNode(el);
      if (!textNode) {
        return;
      }

      orderMap.set(el, order);
      order += 1;
      observed.add(el);
      observer.observe(el);
    });

    requestProcess();
  };

  initDetailReveal();
  initTiltPanels();
  initMagneticButtons();
  document.documentElement.dataset.globalTextDecode = "1";
  window.requestAnimationFrame(initTextDecode);
})();
