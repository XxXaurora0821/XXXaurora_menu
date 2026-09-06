(() => {
  const dialog = document.querySelector('#opening');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const replay = document.querySelector('.replay-intro');
  let exiting = false;
  let returnFocus = null;
  let exitTimer;

  function openIntro(isReplay = false) {
    if (dialog.open) return;
    returnFocus = isReplay ? replay : null;
    exiting = false;
    clearTimeout(exitTimer);
    dialog.classList.remove('is-exiting');
    dialog.showModal();
    document.body.classList.add('intro-active');
    const language = document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';
    dialog.querySelector(`[data-intro-lang="${language}"]`).focus({ preventScroll: true });
  }
  function finish() {
    clearTimeout(exitTimer);
    dialog.close();
    document.body.classList.remove('intro-active');
    dialog.classList.remove('is-exiting');
    try { sessionStorage.setItem('aurora-opening-seen', '1'); } catch {}
    // 由原生对话框隔离背景焦点，关闭后回到有效的阅读位置。
    const sectionId = ['#hello', '#projects', '#playground', '#contact'].includes(location.hash) ? location.hash : '#hello';
    const target = returnFocus || document.querySelector(sectionId);
    if (target) {
      if (!returnFocus) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    exiting = false;
  }
  function enter() {
    if (exiting || !dialog.open) return;
    exiting = true;
    dialog.classList.add('is-exiting');
    if (reduced.matches) finish();
    else exitTimer = setTimeout(finish, 760);
  }
  dialog.querySelectorAll('[data-intro-lang], .opening-skip').forEach(button => button.addEventListener('click', enter));
  dialog.addEventListener('cancel', event => { event.preventDefault(); enter(); });
  replay.addEventListener('click', () => openIntro(true));
  addEventListener('pagehide', () => {
    if (dialog.open) finish();
  });
  const navigation = performance.getEntriesByType('navigation')[0]?.type;
  let seen = false;
  try { seen = sessionStorage.getItem('aurora-opening-seen') === '1'; } catch {}
  // 刷新可重看开场；详情返回和锚点导航不重复打断。
  if (navigation !== 'back_forward' && !(navigation === 'navigate' && location.hash && seen)) openIntro();
})();
