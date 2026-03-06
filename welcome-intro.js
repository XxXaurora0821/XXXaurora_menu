(() => {
  const PRELOAD_TIMEOUT_MS = 2200;
  const FONT_TIMEOUT_MS = 1800;
  const IMAGE_TIMEOUT_MS = 1200;
  const INTRO_FAILSAFE_MS = 5200;

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
    const prefersReducedMotion = options.prefersReducedMotion === true;

    if (!overlay || body?.dataset?.welcomeIntro === "off") {
      body?.classList.remove("welcome-active", "welcome-preloading", "welcome-intro-ready");
      onEnter();
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
    const atmosphere = overlay.querySelector(".welcome-atmosphere");

    let phase = "loading";
    let entered = false;
    let wantsEnter = false;
    const idleTweens = [];
    let cleanup = () => {};

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

    const finish = () => {
      setPhase("entered");
      body.classList.remove("welcome-active", "welcome-preloading", "welcome-intro-ready");
      overlay.setAttribute("aria-hidden", "true");
      overlay.remove();
      onEnter();
    };

    const runEnterTransition = () => {
      if (entered || phase !== "intro") {
        return;
      }
      entered = true;
      idleTweens.forEach((tween) => tween.kill());
      cleanup();

      if (!hasGsap) {
        finish();
        return;
      }

      const gsap = window.gsap;
      gsap
        .timeline({
          defaults: { ease: "power2.out" },
          onComplete: finish
        })
        .to(hint, { autoAlpha: 0, y: 10, duration: 0.18 })
        .to(loader, { autoAlpha: 0, y: -8, duration: 0.18 }, 0)
        .to(brand, { scale: 1.01, duration: 0.18 }, 0)
        .to(panel, { autoAlpha: 0, y: 18, scale: 0.985, duration: 0.34 }, 0.08)
        .to(atmosphere, { autoAlpha: 0.42, scale: 1.02, duration: 0.3 }, 0.08)
        .to(overlay, { autoAlpha: 0, duration: 0.3 }, 0.14);
    };

    const onPointerDown = (event) => {
      if (typeof event.button === "number" && event.button !== 0) {
        return;
      }
      wantsEnter = true;
      if (phase === "intro") {
        runEnterTransition();
      }
    };

    const onKeyDown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      wantsEnter = true;
      if (phase === "intro") {
        runEnterTransition();
      }
    };

    overlay.addEventListener("pointerdown", onPointerDown);
    overlay.addEventListener("keydown", onKeyDown);
    try {
      overlay.focus({ preventScroll: true });
    } catch (err) {
      overlay.focus();
    }

    cleanup = () => {
      overlay.removeEventListener("pointerdown", onPointerDown);
      overlay.removeEventListener("keydown", onKeyDown);
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
        if (wantsEnter) {
          runEnterTransition();
        }
        return;
      }

      const gsap = window.gsap;
      gsap.set([kicker, brand, sub, hint], { autoAlpha: 0, y: 16 });
      gsap.set(loader, { autoAlpha: 1, y: 0 });
      gsap.set(overlay, { autoAlpha: 1 });
      gsap.set(atmosphere, { autoAlpha: 0.66, scale: 1.03 });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(loader, { autoAlpha: 0, y: -10, duration: 0.34 })
        .to(panel, { y: 0, duration: 0.52, ease: "power2.out" }, 0)
        .to(kicker, { autoAlpha: 1, y: 0, duration: 0.3 }, "-=0.12")
        .to(brand, { autoAlpha: 1, y: 0, duration: 0.42 }, "-=0.06")
        .to(sub, { autoAlpha: 1, y: 0, duration: 0.34 }, "-=0.16")
        .to(hint, { autoAlpha: 1, y: 0, duration: 0.3 }, "-=0.1");

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

      if (wantsEnter) {
        window.setTimeout(runEnterTransition, 90);
      }
    };

    const run = async () => {
      setPhase("loading");
      const failsafe = window.setTimeout(() => {
        setProgress(1);
        runIntroReveal();
      }, INTRO_FAILSAFE_MS);

      try {
        await preloadCriticalAssets(setProgress);
      } catch (err) {
        setProgress(1);
      }

      setProgress(1);
      await wait(80);
      window.clearTimeout(failsafe);
      runIntroReveal();
    };

    run().catch(() => {
      setProgress(1);
      runIntroReveal();
    });
  }

  window.initWelcomeIntro = initWelcomeIntro;
})();
