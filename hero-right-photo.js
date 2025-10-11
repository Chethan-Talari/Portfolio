// hero-right-photo.js
document.addEventListener('DOMContentLoaded', () => {
  const img = document.querySelector('.hero-photo');
  const hero = document.querySelector('.hero-hero');
  const fold = document.getElementById('heroFold');

  // load image (lazy)
  const loadImage = (el) => {
    if (!el) return;
    if (el.dataset.src) {
      el.src = el.dataset.src;
      el.removeAttribute('data-src');
      el.addEventListener('load', () => el.classList.add('visible'), { once: true });
      el.addEventListener('error', () => { el.classList.add('visible'); }, { once: true });
    } else {
      // if already has src
      if (el.complete) el.classList.add('visible');
      else el.addEventListener('load', () => el.classList.add('visible'), { once: true });
    }
  };

  // reveal on load or intersection
  if (img) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(ent => {
          if (ent.isIntersecting) {
            loadImage(img);
            obs.unobserve(img);
          }
        });
      }, { rootMargin: '200px 0px', threshold: 0.05 });
      io.observe(img);
    } else {
      loadImage(img);
    }
  }

  // hide fold when user scrolls past hero
  if (hero && fold && 'IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries) => {
      const en = entries[0];
      if (!en.isIntersecting) {
        fold.classList.add('hidden');
      } else {
        fold.classList.remove('hidden');
      }
    }, { threshold: 0, rootMargin: '-40px 0px' });
    io2.observe(hero);
  }
});
