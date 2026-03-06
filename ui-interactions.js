(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navDuration = 480;

  // ---------- Page transition ----------
  if (!prefersReduced) {
    document.documentElement.classList.add('ui-page-transition');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.add('ui-page-ready');
      });
    });

    const isSameOriginHttp = (url) => {
      try {
        const u = new URL(url, location.href);
        return u.origin === location.origin && (u.protocol === 'http:' || u.protocol === 'https:');
      } catch {
        return false;
      }
    };

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;

      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#')) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (!isSameOriginHttp(href)) return;

      const next = new URL(href, location.href);
      if (next.href === location.href) return;

      e.preventDefault();
      document.documentElement.classList.add('ui-page-leaving');
      window.setTimeout(() => {
        location.href = next.href;
      }, navDuration);
    }, { passive: false });
  }

  // ---------- Magnetic buttons ----------
  if (!prefersReduced) {
    const selector = [
      'button',
      '[role="button"]',
      'a.cb-viewall-btn',
      'a.cc-viewall-btn',
      'a.project-back-link',
      '.tab',
      '.btn',
      '.btn-send'
    ].join(',');

    const candidates = Array.from(document.querySelectorAll(selector));
    const uniq = Array.from(new Set(candidates));

    uniq.forEach((el) => {
      if (!el || el.classList.contains('magnetic-btn')) return;
      el.classList.add('magnetic-btn');

      let raf = 0;
      const max = 10;
      const setXY = (x, y) => {
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      };

      const onMove = (evt) => {
        const r = el.getBoundingClientRect();
        const dx = evt.clientX - (r.left + r.width / 2);
        const dy = evt.clientY - (r.top + r.height / 2);
        const nx = (dx / (r.width / 2)) || 0;
        const ny = (dy / (r.height / 2)) || 0;

        const tx = Math.max(-max, Math.min(max, nx * max * 0.55));
        const ty = Math.max(-max, Math.min(max, ny * max * 0.55));

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => setXY(tx, ty));
      };

      const reset = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => setXY(0, 0));
      };

      el.addEventListener('mousemove', onMove, { passive: true });
      el.addEventListener('mouseleave', reset, { passive: true });
      el.addEventListener('blur', reset, { passive: true });
      el.addEventListener('touchstart', reset, { passive: true });
    });
  }
})();
