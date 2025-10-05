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

// MARQUEE control (set animationDuration & pause on hover)
const marqueeA = document.getElementById('marqueeA');
if (marqueeA) {
  const visibleItems = marqueeA.querySelectorAll('.marquee-item').length;
  // we duplicated sequence so visible unique items = visibleItems / 2
  const uniqueItems = Math.max(1, Math.floor(visibleItems / 2));
  // duration = items * baseSpeed (tweak baseSpeed to make it faster/slower)
  const baseSpeed = 1.5; // seconds per logo
  const duration = Math.max(14, uniqueItems * baseSpeed);
  marqueeA.style.animation = `marquee ${duration}s linear infinite`;
  // pause/resume on hover
  const clip = marqueeA.closest('.marquee-clip');
  if (clip) {
    clip.addEventListener('mouseenter', () => marqueeA.style.animationPlayState = 'paused');
    clip.addEventListener('mouseleave', () => marqueeA.style.animationPlayState = 'running');
  }
  if (prefersReduced) marqueeA.style.animationPlayState = 'paused';
}


  // 4) Reveal fade-up on scroll for elements with class 'fade-up'
  const reveals = Array.from(document.querySelectorAll('.fade-up'));
  if (!prefersReduced && reveals.length) {
    const rObs = new IntersectionObserver((entries, o) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          o.unobserve(en.target);
        }
      });
    }, {threshold:0.12});
    reveals.forEach(el => rObs.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // 5) Timeline dots + descriptions: optional highlight on scroll — just ensure visible
  // We'll sequentially reveal descs using same reveals class
  const descs = Array.from(document.querySelectorAll('.tl-desc'));
  descs.forEach((d, i) => {
    d.style.transitionDelay = (i * 80) + 'ms';
    if (!prefersReduced) d.classList.add('fade-up');
  });

  // 6) Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

})();

// stagger timeline descriptions a little more
const tlDescs = Array.from(document.querySelectorAll('.tl-desc'));
tlDescs.forEach((d, i) => {
  d.style.transitionDelay = (120 + i * 80) + 'ms';
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


