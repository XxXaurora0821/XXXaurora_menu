(() => {
  const PRELOAD_TIMEOUT_MS = 2200;
  const FONT_TIMEOUT_MS = 1800;
  const IMAGE_TIMEOUT_MS = 1200;
  const INTRO_FAILSAFE_MS = 5200;
  const MIN_LOADING_VISUAL_MS = 2400;
  const LOADING_PROGRESS_HOLD = 0.985;
  const PROGRESS_EASE = 0.16;
  const INTRO_SEEN_SESSION_KEY = "xxxaurora-welcome-intro-seen";

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function waitForNextFrame() {
    return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
  }

  function withTimeout(task, timeoutMs) {
    return Promise.race([task, wait(timeoutMs)]);
  }

  function waitForDocumentComplete() {
    if (document.readyState === "complete") {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      window.addEventListener("load", () => resolve(), { once: true });
    });
  }

  function waitForFonts() {
    if (!document.fonts) {
      return Promise.resolve();
    }

    const targets = ['1em "Orbitron"', '1em "Chakra Petch"', '1em "Space Mono"'];
    const loads = targets.map((font) => document.fonts.load(font));

    return Promise.allSettled(loads).then(() => document.fonts.ready);
  }

  function waitForCriticalImages() {
    const images = Array.from(document.querySelectorAll("img"))
      .filter((img) => !img.loading || img.loading !== "lazy")
      .slice(0, 4);

    if (!images.length) {
      return Promise.resolve();
    }

    const pending = images.map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }
      if (typeof img.decode === "function") {
        return img.decode().catch(() => {});
      }
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    });

    return Promise.allSettled(pending).then(() => undefined);
  }

  function readIntroSeen() {
    try {
      return window.sessionStorage.getItem(INTRO_SEEN_SESSION_KEY) === "1";
    } catch (err) {
      return false;
    }
  }

  function markIntroSeen() {
    try {
      window.sessionStorage.setItem(INTRO_SEEN_SESSION_KEY, "1");
    } catch (err) {
      // Ignore storage failures (private mode / blocked storage).
    }
  }

  async function preloadCriticalAssets(onProgress) {
    const tasks = [
      () => withTimeout(waitForDocumentComplete(), PRELOAD_TIMEOUT_MS),
      () => withTimeout(waitForFonts(), FONT_TIMEOUT_MS),
      () => withTimeout(waitForCriticalImages(), IMAGE_TIMEOUT_MS)
    ];

    let done = 0;
    onProgress(0);

    await Promise.allSettled(
      tasks.map(async (runTask) => {
        await runTask();
        done += 1;
        onProgress(done / tasks.length);
      })
    );

    // Ensure at least one clean paint before intro reveal.
    await waitForNextFrame();
    await waitForNextFrame();
  }

  function initWelcomeIntro(options = {}) {
    const overlay = document.getElementById("welcome-overlay");
    const body = document.body;
    const onEnter = typeof options.onEnter === "function" ? options.onEnter : () => {};
    const onLanguageSelect =
      typeof options.onLanguageSelect === "function" ? options.onLanguageSelect : null;
    const initialLang = options.initialLang === "zh" ? "zh" : "en";
    const prefersReducedMotion = options.prefersReducedMotion === true;
    const shouldSkipIntro = body?.dataset?.welcomeIntro === "off" || readIntroSeen();

    if (!overlay || shouldSkipIntro) {
      body?.classList.remove("welcome-active", "welcome-preloading", "welcome-intro-ready");
      if (overlay) {
        overlay.setAttribute("aria-hidden", "true");
        overlay.remove();
      }
      onEnter(initialLang);
      return;
    }

    const hasGsap = !!window.gsap && !prefersReducedMotion;
    const progressBar = overlay.querySelector(".welcome-progress-bar");
    const progressValue = overlay.querySelector(".welcome-progress-value");
    const panel = overlay.querySelector(".welcome-panel");
    const loader = overlay.querySelector(".welcome-loader");
    const kicker = overlay.querySelector(".welcome-kicker");
    const brand = overlay.querySelector(".welcome-brand");
    const sub = overlay.querySelector(".welcome-sub");
    const hint = overlay.querySelector(".welcome-hint");
    const entryActions = overlay.querySelector(".welcome-entry-actions");
    const langButtons = Array.from(overlay.querySelectorAll("[data-welcome-lang]"));
    const atmosphere = overlay.querySelector(".welcome-atmosphere");

    let phase = "loading";
    let entered = false;
    let selectedLang = initialLang;
    const idleTweens = [];
    let cleanup = () => {};
    let progressFrame = 0;
    let progressVisual = 0;
    let progressActual = 0;
    let progressStartAt = 0;
    let preloadSettled = false;

    const setPhase = (nextPhase) => {
      phase = nextPhase;
      overlay.dataset.phase = nextPhase;
      body.dataset.welcomePhase = nextPhase;
      body.classList.toggle("welcome-preloading", nextPhase === "loading");
      body.classList.toggle("welcome-intro-ready", nextPhase === "intro");
    };

    const setProgress = (ratio) => {
      const clamped = Math.max(0, Math.min(1, ratio));
      if (progressBar) {
        progressBar.style.transform = `scaleX(${clamped})`;
      }
      if (progressValue) {
        progressValue.textContent = `${Math.round(clamped * 100)}%`;
      }
    };

    const stopProgressLoop = () => {
      if (progressFrame) {
        window.cancelAnimationFrame(progressFrame);
        progressFrame = 0;
      }
    };

    const updateActualProgress = (ratio) => {
      const clamped = Math.max(0, Math.min(1, ratio));
      progressActual = Math.max(progressActual, clamped);
    };

    const startProgressLoop = () => {
      progressStartAt = performance.now();
      progressVisual = 0;
      progressActual = 0;
      preloadSettled = false;

      const tick = () => {
        const elapsed = performance.now() - progressStartAt;
        const elapsedRatio = Math.max(0, Math.min(1, elapsed / MIN_LOADING_VISUAL_MS));
        const gatedByTime = elapsedRatio * LOADING_PROGRESS_HOLD;
        const cappedActual = preloadSettled
          ? LOADING_PROGRESS_HOLD
          : Math.min(progressActual, LOADING_PROGRESS_HOLD);
        const targetProgress =
          preloadSettled && elapsedRatio >= 1 ? 1 : Math.min(cappedActual, gatedByTime);
        const delta = targetProgress - progressVisual;

        if (Math.abs(delta) <= 0.0006) {
          progressVisual = targetProgress;
        } else {
          progressVisual += delta * PROGRESS_EASE;
        }

        if (targetProgress === 1 && progressVisual > 0.9995) {
          progressVisual = 1;
        }

        setProgress(progressVisual);
        progressFrame = window.requestAnimationFrame(tick);
      };

      stopProgressLoop();
      progressFrame = window.requestAnimationFrame(tick);
    };

    const finish = () => {
      applySelectedLanguage(selectedLang);
      stopProgressLoop();
      setPhase("entered");
      body.classList.remove("welcome-active", "welcome-preloading", "welcome-intro-ready");
      overlay.setAttribute("aria-hidden", "true");
      overlay.remove();
      onEnter(selectedLang);
    };

    const setSelectedLanguage = (lang) => {
      selectedLang = lang === "zh" ? "zh" : "en";
      langButtons.forEach((button) => {
        const isActive = button.getAttribute("data-welcome-lang") === selectedLang;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    const focusSelectedLanguage = () => {
      const activeButton =
        langButtons.find(
          (button) => button.getAttribute("data-welcome-lang") === selectedLang
        ) || langButtons[0];
      if (!activeButton) {
        return;
      }

      try {
        activeButton.focus({ preventScroll: true });
      } catch (err) {
        activeButton.focus();
      }
    };

    const applySelectedLanguage = (lang) => {
      if (onLanguageSelect) {
        onLanguageSelect(lang);
        return;
      }

      try {
        window.localStorage.setItem("site-lang", lang);
      } catch (err) {
        // Keep runtime language only when storage is blocked.
      }
    };

    const runEnterTransition = () => {
      if (entered || phase !== "intro") {
        return;
      }
      applySelectedLanguage(selectedLang);
      entered = true;
      markIntroSeen();
      idleTweens.forEach((tween) => tween.kill());
      cleanup();

      if (!hasGsap) {
        finish();
        return;
      }

      const gsap = window.gsap;
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: finish
      });

      tl.to(hint, { autoAlpha: 0, y: 10, duration: 0.18 });
      if (entryActions) {
        tl.to(entryActions, { autoAlpha: 0, y: 10, duration: 0.18 }, 0);
      }
      tl.to(loader, { autoAlpha: 0, y: -8, duration: 0.18 }, 0)
        .to(brand, { scale: 1.01, duration: 0.18 }, 0)
        .to(panel, { autoAlpha: 0, y: 18, scale: 0.985, duration: 0.34 }, 0.08)
        .to(atmosphere, { autoAlpha: 0.42, scale: 1.02, duration: 0.3 }, 0.08)
        .to(overlay, { autoAlpha: 0, duration: 0.3 }, 0.14);
    };

    const onLanguageButtonClick = (event) => {
      const button = event.currentTarget;
      const lang = button?.getAttribute("data-welcome-lang");
      if (!lang || phase !== "intro" || entered) {
        return;
      }

      event.preventDefault();
      setSelectedLanguage(lang);
      applySelectedLanguage(lang);
      if (entryActions) {
        entryActions.style.pointerEvents = "none";
      }
      window.setTimeout(() => {
        runEnterTransition();
      }, 90);
    };

    langButtons.forEach((button) =>
      button.addEventListener("click", onLanguageButtonClick)
    );
    setSelectedLanguage(initialLang);

    cleanup = () => {
      langButtons.forEach((button) =>
        button.removeEventListener("click", onLanguageButtonClick)
      );
    };

    let introRevealed = false;

    const runIntroReveal = () => {
      if (introRevealed) {
        return;
      }
      introRevealed = true;
      setPhase("intro");

      if (!hasGsap) {
        setProgress(1);
        if (loader) {
          loader.hidden = true;
        }
        if (hint) {
          hint.style.opacity = "1";
          hint.style.transform = "none";
        }
        if (entryActions) {
          entryActions.style.opacity = "1";
          entryActions.style.transform = "none";
          entryActions.style.pointerEvents = "auto";
        }
        applySelectedLanguage(selectedLang);
        focusSelectedLanguage();
        return;
      }

      const gsap = window.gsap;
      gsap.set([kicker, brand, sub, hint, entryActions].filter(Boolean), {
        autoAlpha: 0,
        y: 16
      });
      gsap.set(loader, { autoAlpha: 1, y: 0 });
      gsap.set(overlay, { autoAlpha: 1 });
      gsap.set(atmosphere, { autoAlpha: 0.66, scale: 1.03 });

      const tl = gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(loader, { autoAlpha: 0, y: -10, duration: 0.34 })
        .to(panel, { y: 0, duration: 0.52, ease: "power2.out" }, 0)
        .to(kicker, { autoAlpha: 1, y: 0, duration: 0.3 }, "-=0.12")
        .to(brand, { autoAlpha: 1, y: 0, duration: 0.42 }, "-=0.06")
        .to(sub, { autoAlpha: 1, y: 0, duration: 0.34 }, "-=0.16")
        .to(hint, { autoAlpha: 1, y: 0, duration: 0.3 }, "-=0.1");

      if (entryActions) {
        tl.to(entryActions, { autoAlpha: 1, y: 0, duration: 0.32 }, "-=0.08");
      }

      idleTweens.push(
        gsap.to(panel, {
          y: -3,
          duration: 3.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        })
      );

      idleTweens.push(
        gsap.to(".welcome-frame", {
          autoAlpha: 0.72,
          duration: 2.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        })
      );

      window.setTimeout(focusSelectedLanguage, 380);
    };

    const run = async () => {
      setPhase("loading");
      startProgressLoop();
      const failsafe = window.setTimeout(() => {
        preloadSettled = true;
        updateActualProgress(1);
        setProgress(1);
        stopProgressLoop();
        runIntroReveal();
      }, INTRO_FAILSAFE_MS);

      try {
        await preloadCriticalAssets(updateActualProgress);
      } catch (err) {
        updateActualProgress(1);
      }

      preloadSettled = true;
      updateActualProgress(1);

      const elapsed = performance.now() - progressStartAt;
      const remain = MIN_LOADING_VISUAL_MS - elapsed;
      if (remain > 0) {
        await wait(remain);
      }

      await wait(160);
      setProgress(1);
      stopProgressLoop();
      window.clearTimeout(failsafe);
      runIntroReveal();
    };

    run().catch(() => {
      preloadSettled = true;
      updateActualProgress(1);
      setProgress(1);
      stopProgressLoop();
      runIntroReveal();
    });
  }

  window.initWelcomeIntro = initWelcomeIntro;
})();
