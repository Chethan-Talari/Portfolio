(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navDuration = 340;

  const getCurrentTopLevel = () => {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const topLevel = new Set(['index.html', 'projects.html', 'about.html', 'connect.html']);
    return topLevel.has(file) ? file : 'projects.html';
  };

  const isMobileViewport = () => window.matchMedia('(max-width: 1024px)').matches;
  const MOBILE_NAV_BREAKPOINT = 1024;

  const ensureThemeSurface = () => {
    // Keep theme class but drop custom page-transition overlay
    document.documentElement.classList.remove('ui-page-transition', 'ui-page-ready', 'ui-page-leaving');
    document.body.classList.add('theme-imperfect');
  };

  ensureThemeSurface();

  // ---------- Page transition ----------
  // Disabled for smoother native navigation (removed overlay flash)

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

    moveIndicator(active);
    links.forEach((link) => {
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
    // Bottom mobile navbar intentionally disabled; use header hamburger menu instead.
    if (existing) existing.remove();
  };

  // ---------- Header hamburger navigation ----------
  const mountHeaderHamburgerNav = () => {
    const headerNavList = document.querySelector('.site-header .container > nav > .nav-list');
    const toggle = document.querySelector('.site-header .nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeBtn = mobileMenu ? mobileMenu.querySelector('.close-btn') : null;
    const mobileNav = mobileMenu ? mobileMenu.querySelector('.nav-list') : null;

    if (!headerNavList || !toggle || !mobileMenu || !mobileNav) return;

    // Keep mobile links in sync when the overlay list is empty.
    if (mobileNav.children.length === 0) {
      mobileNav.innerHTML = headerNavList.innerHTML;
    }

    const openMenu = () => {
      mobileMenu.classList.add('open');
      mobileMenu.style.display = 'block';
      mobileMenu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      mobileMenu.style.display = 'none';
      mobileMenu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    const syncLayout = () => {
      const isMobile = window.matchMedia(`(max-width: ${MOBILE_NAV_BREAKPOINT}px)`).matches;

      if (isMobile) {
        headerNavList.style.display = 'none';
        toggle.style.display = 'inline-flex';
        mobileNav.style.display = 'flex';
        mobileNav.style.flexDirection = 'column';
        mobileNav.style.alignItems = 'center';
        mobileNav.style.gap = '20px';
      } else {
        headerNavList.style.display = '';
        toggle.style.display = '';
        mobileNav.style.display = '';
        mobileNav.style.flexDirection = '';
        mobileNav.style.alignItems = '';
        mobileNav.style.gap = '';
        closeMenu();
      }
    };

    if (!toggle.dataset.mobileNavBound) {
      // Use open-only behavior here because some pages also bind inline
      // open handlers on the same button; toggle logic can cause immediate
      // open-then-close conflicts in mixed setups.
      toggle.addEventListener('click', openMenu);

      if (closeBtn) closeBtn.addEventListener('click', closeMenu);

      mobileNav.addEventListener('click', (e) => {
        if (e.target && e.target.closest('a')) closeMenu();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
      });

      toggle.dataset.mobileNavBound = 'true';
    }

    syncLayout();
  };

  // ---------- Mobile floating actions ----------
  const mountFab = () => {
    const existing = document.querySelector('.mobile-fab-stack');
    // Back-to-top FAB intentionally disabled on mobile across all pages.
    if (existing) existing.remove();
  };

  const annotatePage = () => {
    const isProjectDetailPage = !!document.querySelector('.project-gallery, .doc-main');
    if (isProjectDetailPage) return;

    // Reveal/fade-up motion is intentionally disabled globally.
    document.querySelectorAll('#hero, .connect-scene, .project-header, .hero-stack, #c-celluloids-banner, .video-shell').forEach((el) => {
      el.dataset.motion = 'drift';
    });
  };

  const initCustomCursor = () => {
    if (prefersReduced || isMobileViewport() || !window.matchMedia('(pointer: fine)').matches) return;

    let dot = document.querySelector('.site-cursor');
    let ring = document.querySelector('.site-cursor-ring');

    if (!dot) {
      dot = document.createElement('div');
      dot.className = 'site-cursor';
      document.body.appendChild(dot);
    }

    if (!ring) {
      ring = document.createElement('div');
      ring.className = 'site-cursor-ring';
      document.body.appendChild(ring);
    }

    document.body.classList.add('has-custom-cursor');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const update = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      raf = requestAnimationFrame(update);
    };

    const show = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const hide = () => {
      dot.classList.remove('is-active');
      ring.classList.remove('is-hover', 'is-title', 'is-card');
    };

    const setState = (state) => {
      ring.classList.remove('is-hover', 'is-title', 'is-card');
      if (state) ring.classList.add(state);
    };

    const hoverSelector = [
      'a',
      'button',
      '[role="button"]',
      '.tab',
      '.cb-viewall-btn',
      '.cc-viewall-btn'
    ].join(',');

    const cardSelector = [
      '.project-card',
      '.testi-card',
      '.counter',
      '.tl-item'
    ].join(',');

    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      show();

      const titleTarget = event.target.closest('.hero-title, .kinetic-heading');
      const cardTarget = event.target.closest(cardSelector);
      const hoverTarget = event.target.closest(hoverSelector);

      if (titleTarget) setState('is-title');
      else if (cardTarget) setState('is-card');
      else if (hoverTarget) setState('is-hover');
      else setState('');
    }, { passive: true });

    document.addEventListener('mousedown', () => {
      dot.classList.add('is-active');
    });

    document.addEventListener('mouseup', () => {
      dot.classList.remove('is-active');
    });

    document.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);
  };

  const initRevealObserver = () => {
    document.body.classList.add('motion-ready');
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.classList.add('is-visible');
      el.removeAttribute('data-reveal');
      el.style.removeProperty('--reveal-delay');
      el.style.removeProperty('--reveal-rotate');
    });
  };

  const splitHeading = (heading) => {
    if (!heading || heading.dataset.kineticReady === 'true') return;
    const text = (heading.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text || text.length < 3) return;

    heading.dataset.kineticReady = 'true';
    heading.classList.add('kinetic-heading');
    heading.setAttribute('aria-label', text);
    heading.textContent = '';

    text.split(' ').forEach((word, wordIndex, words) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      wordSpan.setAttribute('aria-hidden', 'true');

      Array.from(word).forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.setAttribute('aria-hidden', 'true');
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
      });

      heading.appendChild(wordSpan);

      if (wordIndex < words.length - 1) {
        const spacer = document.createElement('span');
        spacer.className = 'word';
        spacer.setAttribute('aria-hidden', 'true');
        spacer.innerHTML = '&nbsp;';
        heading.appendChild(spacer);
      }
    });
  };

  const initKineticHeadings = () => {
    // Limit kinetic (hover) effect to hero heading only
    const selectors = [
      '#hero .hero-title'
    ];

    document.querySelectorAll(selectors.join(',')).forEach(splitHeading);

    if (prefersReduced) return;

    document.querySelectorAll('.kinetic-heading').forEach((heading) => {
      const chars = Array.from(heading.querySelectorAll('.char'));
      if (!chars.length) return;

      const resetChars = () => {
        heading.classList.remove('is-interacting');
        chars.forEach((char) => {
          char.style.removeProperty('--char-x');
          char.style.removeProperty('--char-y');
          char.style.removeProperty('--char-rx');
          char.style.removeProperty('--char-ry');
          char.style.removeProperty('--char-rz');
        });
      };

      heading.addEventListener('mousemove', (event) => {
        const rect = heading.getBoundingClientRect();
        const relX = ((event.clientX - rect.left) / rect.width) - 0.5;
        const relY = ((event.clientY - rect.top) / rect.height) - 0.5;

        heading.classList.add('is-interacting');
        chars.forEach((char, index) => {
          const depth = (index % 7) + 1;
          char.style.setProperty('--char-x', `${relX * depth * 3.2}px`);
          char.style.setProperty('--char-y', `${relY * depth * 2.4}px`);
          char.style.setProperty('--char-rx', `${relY * -8}deg`);
          char.style.setProperty('--char-ry', `${relX * 14}deg`);
          char.style.setProperty('--char-rz', `${relX * depth * 0.75}deg`);
        });
      }, { passive: true });

      heading.addEventListener('mouseleave', resetChars, { passive: true });
      heading.addEventListener('blur', resetChars, { passive: true });
    });
  };

  const initHeroDisciplineScramble = () => {
    const items = Array.from(document.querySelectorAll('.hero-disciplines span'));
    if (!items.length || prefersReduced) return;

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    items.forEach((item) => {
      const original = (item.textContent || '').toUpperCase();
      item.dataset.original = original;
      let timer = null;

      const stop = () => {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
        item.textContent = original;
        item.classList.remove('is-scrambling');
      };

      const start = () => {
        stop();
        item.classList.add('is-scrambling');
        let iteration = 0;

        timer = window.setInterval(() => {
          item.textContent = original
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration) return original[index];
              return alphabet[Math.floor(Math.random() * alphabet.length)];
            })
            .join('');

          iteration += 0.34;
          if (iteration >= original.length) {
            stop();
          }
        }, 34);
      };

      item.addEventListener('mouseenter', start);
      item.addEventListener('pointerenter', start);
      item.addEventListener('mouseleave', stop);
      item.addEventListener('pointerleave', stop);
      item.addEventListener('blur', stop);
    });
  };

  const initScrollMotion = () => {
    if (prefersReduced) return;

    const drifting = Array.from(document.querySelectorAll('[data-motion="drift"]'));
    const headingTargets = Array.from(document.querySelectorAll('.kinetic-heading'));

    if (!drifting.length && !headingTargets.length) return;

    let ticking = false;

    const update = () => {
      drifting.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const centerDelta = (window.innerHeight * 0.5) - rect.top;
        const drift = Math.max(-24, Math.min(24, centerDelta * 0.05));
        el.style.setProperty('--section-drift', `${drift}px`);
      });

      headingTargets.forEach((heading, index) => {
        const rect = heading.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight));
        heading.style.setProperty('--heading-drift', `${(progress - 0.5) * (index === 0 ? 22 : 12)}px`);
      });

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  };

  const mountResponsiveUI = () => {
    mountHeaderHamburgerNav();
    mountDesktopNavIndicator();
    mountBottomNav();
    mountFab();
  };

  const syncFixedHeaderOffset = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const headerHeight = Math.ceil(header.getBoundingClientRect().height);
    document.body.style.paddingTop = `${headerHeight}px`;
    document.documentElement.style.setProperty('--header-offset', `${headerHeight}px`);
  };

  const initProjectHeaderControls = () => {
    const projectHeader = document.querySelector('.project-header');
    if (!projectHeader) return;

    const backLink = projectHeader.querySelector('.project-back-link');
    const shareBtn = projectHeader.querySelector('.project-share-btn');
    const title = projectHeader.querySelector('.project-page-title');
    if (!title) return;

    if (backLink) {
      backLink.classList.add('project-back-fab');
      if (backLink.parentElement !== document.body) document.body.appendChild(backLink);
    }

    if (shareBtn) {
      let row = projectHeader.querySelector('.project-title-row');
      if (!row) {
        row = document.createElement('div');
        row.className = 'project-title-row';
        title.parentElement.insertBefore(row, title);
      }
      row.appendChild(title);
      row.appendChild(shareBtn);
    }

    const topActions = projectHeader.querySelector('.project-top-actions');
    if (topActions) topActions.remove();
  };

  const initPage = () => {
    syncFixedHeaderOffset();
    initProjectHeaderControls();
    mountResponsiveUI();
    annotatePage();
    // Custom cursor disabled for accessibility/visibility issues
    // initCustomCursor();
    initRevealObserver();
    initKineticHeadings();
    initHeroDisciplineScramble();
    initScrollMotion();
    window.addEventListener('resize', syncFixedHeaderOffset, { passive: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage, { once: true });
  } else {
    initPage();
  }

  window.addEventListener('resize', mountResponsiveUI, { passive: true });
})();
