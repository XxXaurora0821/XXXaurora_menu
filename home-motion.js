(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('#aurora-canvas');
  const context = canvas.getContext('2d');
  let width = 0, height = 0, frame = 0, previous = 0, time = 0;
  let visible = true, pointerX = 0, pointerY = 0, easedX = 0, easedY = 0;

  // 以一张连续扭转的曲面构成光带；动画只更新画布，不触发布局。
  function draw() {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    easedX += (pointerX - easedX) * .045;
    easedY += (pointerY - easedY) * .045;
    const scale = Math.min(width / 660, height / 650);
    const cx = width * .62, cy = height * .49;
    const rotation = -.48 + easedX * .14;
    const cr = Math.cos(rotation), sr = Math.sin(rotation);
    const bands = width < 500 ? 44 : 72;
    context.globalCompositeOperation = 'source-over';
    for (let band = 0; band < bands; band++) {
      const v = (band / (bands - 1) - .5) * 138;
      context.beginPath();
      for (let step = 0; step <= 168; step++) {
        const u = step / 168 * Math.PI * 2;
        const twist = u * 1.5 + time * .16;
        const radius = 174 + v * Math.cos(twist);
        const x = radius * Math.cos(u);
        const y = radius * Math.sin(u) * 1.18;
        const z = v * Math.sin(twist) + Math.sin(u * 2 + time * .25) * 21;
        const perspective = 670 / (670 + z);
        const px = cx + (x * cr - y * sr) * scale * perspective;
        const py = cy + (x * sr + y * cr + z * .65 + easedY * 13) * scale * perspective;
        if (!step) context.moveTo(px, py); else context.lineTo(px, py);
      }
      context.strokeStyle = `rgba(35, 65, 240, ${.16 + .26 * Math.sin(band / bands * Math.PI)})`;
      context.lineWidth = .7 * scale;
      context.stroke();
    }
    // 稀疏轨道微粒为光带提供空间参照。
    for (let i = 0; i < 32; i++) {
      const angle = i * 2.39996 + time * .012;
      const radius = (240 + (i % 7) * 13) * scale;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius * .82;
      context.beginPath();
      context.arc(x, y, i % 5 === 0 ? 1.25 : .65, 0, Math.PI * 2);
      context.fillStyle = `rgba(35,65,240,${i % 5 === 0 ? .45 : .18})`;
      context.fill();
    }
    context.globalCompositeOperation = 'source-over';
  }
  function animate(timestamp) {
    frame = 0;
    if (document.hidden || !visible || reduced.matches) return;
    if (timestamp - previous >= 1000 / 30) {
      time += Math.min((timestamp - previous) / 1000, .05);
      previous = timestamp;
      draw();
    }
    frame = requestAnimationFrame(animate);
  }
  function synchronize() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = performance.now();
    if (reduced.matches) { pointerX = pointerY = easedX = easedY = 0; draw(); }
    else if (visible && !document.hidden) frame = requestAnimationFrame(animate);
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, width < 500 ? 1.25 : 1.75);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  if (context) {
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      synchronize();
    }).observe(hero);
    document.addEventListener('visibilitychange', synchronize);
    reduced.addEventListener('change', synchronize);
    hero.addEventListener('pointermove', event => {
      if (!finePointer.matches || reduced.matches) return;
      const rect = hero.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width * 2 - 1;
      pointerY = (event.clientY - rect.top) / rect.height * 2 - 1;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointerX = pointerY = 0; });
    resize();
  }

  // 内容默认可见；仅在浏览器支持时启用渐入，脚本失效不影响阅读。
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        reveal.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px 24px 0px' });
    document.querySelectorAll('.section-head, .project-card, .contact').forEach(node => {
      node.classList.add('reveal-item');
      reveal.observe(node);
    });
  }
  document.querySelectorAll('.project-media, .playground-media').forEach(media => {
    media.addEventListener('pointermove', event => {
      if (!finePointer.matches || reduced.matches) return;
      const rect = media.getBoundingClientRect();
      media.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      media.style.setProperty('--my', `${event.clientY - rect.top}px`);
    }, { passive: true });
  });

  const links = [...document.querySelectorAll('.sidebar nav a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  const progress = document.querySelector('.reading-progress');
  let scrollQueued = false;
  function updateScroll() {
    scrollQueued = false;
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`;
    let current = sections[0];
    sections.forEach(section => {
      if (section.getBoundingClientRect().top < innerHeight * .45) current = section;
    });
    if (range > 0 && scrollY >= range - 5) current = sections.at(-1);
    links.forEach(link => {
      const active = link.hash === `#${current.id}`;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
})();
