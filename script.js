// footer year
document.getElementById('year').textContent = new Date().getFullYear();

/* simple project dataset (replace images/titles/links as needed) */
const projects = {
  uiux: [
    { title: "UI Case Study — Travel App", img: "assets/uiux1.jpg", link: "#" },
    { title: "UI Case Study — Music Platform", img: "assets/uiux2.jpg", link: "#" },
    { title: "UI Case Study — E-commerce", img: "assets/uiux3.jpg", link: "#" }
  ],
  brand: [
    { title: "Brand — Café Identity", img: "assets/brand1.jpg", link: "#" },
    { title: "Brand — Clothing Label", img: "assets/brand2.jpg", link: "#" }
  ],
  docs: [
    { title: "Documentary — Stitching Program", img: "assets/doc1.jpg", link: "#" },
    { title: "Documentary — Local Musicians", img: "assets/doc2.jpg", link: "#" }
  ],
  edit: [
    { title: "Editing Reel — Concert Montage", img: "assets/edit1.jpg", link: "#" },
    { title: "Editing — Short Film Grade", img: "assets/edit2.jpg", link: "#" }
  ]
};

const grid = document.getElementById('project-grid');
const cats = document.querySelectorAll('.cat');

function renderProjects(cat){
  grid.innerHTML = '';
  const list = (cat === 'all') ? [...projects.uiux,...projects.brand,...projects.docs,...projects.edit] : projects[cat] || [];
  list.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'project-card';
    el.innerHTML = `<a href="${p.link}" aria-label="${p.title}"><img src="${p.img}" alt="${p.title}"><h3>${p.title}</h3></a>`;
    grid.appendChild(el);
  });
}

/* category clicks */
cats.forEach(b=>{
  b.addEventListener('click', ()=>{
    const prev = document.querySelector('.cat.active');
    if(prev) prev.classList.remove('active');
    b.classList.add('active');
    renderProjects(b.dataset.cat);
  });
});
renderProjects('uiux');

/* nav active block->underline */
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      // allow default navigation; if single-page wanted, preventDefault here
    });
  });
});

// Scroll-cue visibility controller
(function() {
  const cue = document.querySelector('.scroll-cue');
  if (!cue) return;

  // If user prefers reduced motion, keep cue visible initially then hide on touch/scroll
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // threshold - how far user can scroll while cue remains visible.
  // You can tweak this (in px or fraction of viewport). Using 0.35*innerHeight keeps it visible on landing.
  const threshold = Math.max(120, window.innerHeight * 0.35);

  // initial display: show on landing (page load)
  function showInitial() {
    cue.classList.remove('hidden');
    cue.classList.add('visible');
  }

  // hide cue
  function hideCue() {
    cue.classList.remove('visible');
    cue.classList.add('hidden');
  }

  // compute whether we should show: only when near top of page
  function shouldShow() {
    return window.scrollY <= threshold;
  }

  // throttle via requestAnimationFrame
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      if (shouldShow()) {
        cue.classList.add('visible');
        cue.classList.remove('hidden');
      } else {
        cue.classList.remove('visible');
        cue.classList.add('hidden');
      }
      ticking = false;
    });
  }

  // run after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // ensure small delay so layout stabilizes
    setTimeout(() => {
      // show initially if on landing
      if (shouldShow()) showInitial(); else hideCue();

      // listen for scroll & resize
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', () => {
        // update threshold on resize
        // (avoid heavy work — just recompute threshold)
      }, { passive: true });

      // optional: hide cue after first user scroll or any touchstart (for mobile)
      window.addEventListener('touchstart', () => { if (!prefersReduced) hideCue(); }, { passive: true });
    }, 80);
  });
})();

// Scroll reveal for hero photo & slashes
document.addEventListener('DOMContentLoaded', () => {
  const photo = document.querySelector('.hero-photo');
  const slashes = document.querySelector('.hero-slashes');

  const reveal = (el) => {
    if (!el) return;
    const obs = new IntersectionObserver((entries, obsr) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          el.classList.add('visible');
          obsr.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(el);
  };

  reveal(photo);
  reveal(slashes);
});

