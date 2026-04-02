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

  initDetailReveal();
  initTiltPanels();
  initMagneticButtons();
})();
