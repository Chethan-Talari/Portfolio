// about-script.js
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) WOBBLE image (mouse-based)
  const wob = document.getElementById('wobble');
  if (wob && !prefersReduced) {
    const maxRotate = 25;
    function onMove(e) {
      const r = wob.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const x = (e.clientX - cx) / r.width;
      const y = (e.clientY - cy) / r.height;
      const rx = -y * maxRotate;
      const ry = x * maxRotate;
      wob.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
    wob.addEventListener('mousemove', onMove);
    wob.addEventListener('mouseleave', () => wob.style.transform = 'none');
    wob.addEventListener('touchmove', (ev) => {
      if (!ev.touches || !ev.touches[0]) return;
      onMove(ev.touches[0]);
    }, {passive:true});
  }



  // 2) Counters
  const counters = Array.from(document.querySelectorAll('.counter .num'));
  function animateCount(el) {
    const target = Number(el.dataset.target || 0);
    if (!target) { el.textContent = '0'; return; }
    const dur = 900;
    const start = performance.now();
    function step(t) {
      const p = Math.min(1, (t - start) / dur);
      const eased = p * (2 - p);
      el.textContent = Math.floor(eased * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  if (!prefersReduced && counters.length) {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          o.unobserve(e.target);
        }
      });
    }, {threshold:0.6});
    counters.forEach(c => obs.observe(c));
  } else {
    counters.forEach(c => c.textContent = c.dataset.target || '0');
  }

// MARQUEE control (manual horizontal loop for reliability)
const marqueeA = document.getElementById('marqueeA');
if (marqueeA) {
  const clip = marqueeA.closest('.marquee-clip');
  let offset = 0;
  let rafId = 0;
  let paused = false;
  let lastTime = 0;
  let loopWidth = 0;
  const speed = 42; // px per second

  const measure = () => {
    loopWidth = marqueeA.scrollWidth / 2;
    if (!Number.isFinite(loopWidth) || loopWidth <= 0) {
      loopWidth = 0;
    }
  };

  const tick = (time) => {
    if (!lastTime) lastTime = time;
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    if (!paused && loopWidth > 0) {
      offset -= speed * delta;
      if (Math.abs(offset) >= loopWidth) {
        offset = 0;
      }
      marqueeA.style.transform = `translate3d(${offset}px, 0, 0)`;
    }

    rafId = window.requestAnimationFrame(tick);
  };

  marqueeA.style.animation = 'none';
  marqueeA.style.willChange = 'transform';

  const start = () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    lastTime = 0;
    rafId = window.requestAnimationFrame(tick);
  };

  const reflow = () => {
    offset = 0;
    marqueeA.style.transform = 'translate3d(0, 0, 0)';
    measure();
  };

  window.addEventListener('load', reflow, { passive: true });
  window.addEventListener('resize', reflow, { passive: true });

  if (clip) {
    clip.addEventListener('mouseenter', () => { paused = true; });
    clip.addEventListener('mouseleave', () => { paused = false; });
  }

  if (prefersReduced) {
    paused = true;
    reflow();
  } else {
    reflow();
    start();
  }
}


  // 4) Fade-up reveal is disabled globally; keep elements visible immediately.
  const reveals = Array.from(document.querySelectorAll('.fade-up'));
  reveals.forEach(el => el.classList.add('visible'));

  // 5) Timeline dots + descriptions: optional highlight on scroll - just ensure visible
  // We'll sequentially reveal descs using same reveals class
  const descs = Array.from(document.querySelectorAll('.tl-desc'));
  descs.forEach((d, i) => {
    d.style.transitionDelay = '0ms';
  });

  // 6) Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

})();

// stagger timeline descriptions a little more
const tlDescs = Array.from(document.querySelectorAll('.tl-desc'));
tlDescs.forEach((d, i) => {
  d.style.transitionDelay = '0ms';
});

// --- Header Link Active State & Click Animation ---
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.main-nav .nav-link');
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const hrefFile = link.getAttribute('href').split('/').pop();
    if (hrefFile === currentFile) {
      link.classList.add('active');
    }
  });

  links.forEach(link => {
    link.addEventListener('click', e => {
      if (link.classList.contains('active')) return;
      link.classList.add('nav-clicked');
    });
  });
});

