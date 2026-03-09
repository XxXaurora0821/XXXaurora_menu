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
