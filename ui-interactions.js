(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navDuration = 340;

  const getCurrentTopLevel = () => {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const topLevel = new Set(['index.html', 'projects.html', 'about.html', 'connect.html']);
    return topLevel.has(file) ? file : 'projects.html';
  };

  const isMobileViewport = () => window.matchMedia('(max-width: 1024px)').matches;

  // ---------- Page transition ----------
  if (!prefersReduced && !isMobileViewport()) {
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

  // ---------- Desktop nav active indicator ----------
  const mountDesktopNavIndicator = () => {
    const navList = document.querySelector('.site-header .container > nav > .nav-list');
    if (!navList || isMobileViewport()) {
      const old = document.querySelector('.nav-indicator');
      if (old) old.remove();
      return;
    }

    const links = Array.from(navList.querySelectorAll('a[href]'));
    if (!links.length) return;

    let indicator = navList.querySelector('.nav-indicator');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'nav-indicator';
      navList.appendChild(indicator);
    }

    const current = getCurrentTopLevel();
    let active = links.find((a) => (a.getAttribute('href') || '').toLowerCase() === current);
    if (!active) active = links[0];

    const moveIndicator = (target) => {
      if (!target) return;
      links.forEach((a) => a.classList.toggle('is-current', a === target));

      const listRect = navList.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      const x = rect.left - listRect.left;
      indicator.style.width = `${rect.width}px`;
      indicator.style.transform = `translate3d(${x}px, 0, 0)`;
      indicator.classList.add('visible');
    };

    moveIndicator(active);    links.forEach((link) => {
      link.addEventListener('click', () => moveIndicator(link));
    });
    window.addEventListener('resize', () => moveIndicator(active), { passive: true });
  };

  // ---------- Magnetic buttons ----------
  if (!prefersReduced && !isMobileViewport()) {
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

  // ---------- Mobile bottom navigation ----------
  const mountBottomNav = () => {
    const existing = document.querySelector('.mobile-bottom-nav');
    if (!isMobileViewport()) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    const current = getCurrentTopLevel();
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
    if (!isMobileViewport()) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    const wrap = document.createElement('div');
    wrap.className = 'mobile-fab-stack';
    wrap.innerHTML = `
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

  const mountResponsiveUI = () => {
    mountDesktopNavIndicator();
    mountBottomNav();
    mountFab();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountResponsiveUI, { once: true });
  } else {
    mountResponsiveUI();
  }

  window.addEventListener('resize', mountResponsiveUI, { passive: true });
})();


