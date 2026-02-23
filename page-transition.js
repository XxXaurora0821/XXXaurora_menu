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
