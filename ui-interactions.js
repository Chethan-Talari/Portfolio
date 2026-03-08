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

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  // ---------- Mobile bottom navigation ----------
  const mountBottomNav = () => {
    const existing = document.querySelector('.mobile-bottom-nav');
    if (!isMobile()) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const topLevel = new Set(['index.html', 'projects.html', 'about.html', 'connect.html']);
    const current = topLevel.has(currentFile) ? currentFile : 'projects.html';

    const links = [
      { href: 'index.html', label: 'Home', icon: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/>' },
      { href: 'projects.html', label: 'Projects', icon: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16"/><path d="M10 4v16"/>' },
      { href: 'about.html', label: 'About', icon: '<circle cx="12" cy="7.5" r="3"/><path d="M6 20c0-3.2 2.7-5.5 6-5.5s6 2.3 6 5.5"/>' },
      { href: 'connect.html', label: 'Connect', icon: '<path d="M3.5 6.5h17v11h-17z"/><path d="M4.5 7.5L12 13l7.5-5.5"/>' }
    ];

    const nav = document.createElement('nav');
    nav.className = 'mobile-bottom-nav';
    nav.setAttribute('aria-label', 'Primary mobile navigation');
    nav.innerHTML = links.map((item) => {
      const active = current === item.href ? ' is-active' : '';
      return `<a href="${item.href}" class="${active.trim()}"><svg viewBox="0 0 24 24" aria-hidden="true">${item.icon}</svg><span>${item.label}</span></a>`;
    }).join('');

    document.body.appendChild(nav);
  };

  // ---------- Mobile floating actions ----------
  const mountFab = () => {
    const existing = document.querySelector('.mobile-fab-stack');
    if (!isMobile()) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    const contactHref = 'connect.html';

    const wrap = document.createElement('div');
    wrap.className = 'mobile-fab-stack';
    wrap.innerHTML = `
      <a href="${contactHref}" aria-label="Quick contact" title="Quick contact">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h17v11h-17z"/><path d="M4.5 7.5L12 13l7.5-5.5"/></svg>
      </a>
      <button type="button" class="fab-top" aria-label="Back to top" title="Back to top">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></svg>
      </button>
    `;

    const topBtn = wrap.querySelector('.fab-top');
    const onScroll = () => {
      if (window.scrollY > 420) topBtn.classList.add('visible');
      else topBtn.classList.remove('visible');
    };

    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    document.body.appendChild(wrap);
  };

  const mountMobileEnhancements = () => {
    mountBottomNav();
    mountFab();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountMobileEnhancements, { once: true });
  } else {
    mountMobileEnhancements();
  }

  window.addEventListener('resize', mountMobileEnhancements, { passive: true });
})();


