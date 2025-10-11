// project-script.js
// Lazy loader initializer (exposed)
window.__projectLazyInit = function initLazy() {
  const lazyImgs = Array.from(document.querySelectorAll('img.lazy'));
  if (lazyImgs.length === 0) return;

  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const img = en.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.onload = () => img.classList.add('is-loaded');
            img.removeAttribute('data-src');
          }
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '240px 0px', threshold: 0.03 });
    lazyImgs.forEach(i => imgObserver.observe(i));
  } else {
    lazyImgs.forEach(img => {
      const src = img.getAttribute('data-src'); if (src) img.src = src;
      img.onload = () => img.classList.add('is-loaded');
    });
  }
};

// run on DOM ready for static pages
document.addEventListener('DOMContentLoaded', () => {
  // init lazy images for static loads
  if (window.__projectLazyInit) window.__projectLazyInit();

  // Like / Appreciate (project page)
  const likeBtn = document.getElementById('likeBtn');
  const likeCountEl = document.getElementById('likeCount');
  if (likeBtn && likeCountEl) {
    const pageKey = 'likes:' + (location.pathname + location.search).replace(/[^\w\-]/g, '_');
    let likes = parseInt(localStorage.getItem(pageKey + ':count') || '0', 10);
    const likedAlready = localStorage.getItem(pageKey + ':user') === '1';
    function renderLikes(){ likeCountEl.textContent = likes; if (localStorage.getItem(pageKey + ':user') === '1') document.getElementById('heartIcon').style.color = '#e25555'; }
    renderLikes();
    likeBtn.addEventListener('click', () => {
      const already = localStorage.getItem(pageKey + ':user') === '1';
      if (already) { likes = Math.max(0, likes - 1); localStorage.removeItem(pageKey + ':user'); }
      else { likes = likes + 1; localStorage.setItem(pageKey + ':user','1'); }
      localStorage.setItem(pageKey + ':count', String(likes));
      renderLikes();
    });
  }

  // Share button (project page)
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const title = document.querySelector('.project-title')?.textContent || document.title;
      const url = location.href;
      if (navigator.share) {
        try { await navigator.share({ title, url }); } catch(e) {}
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard');
      } catch (e) {
        showToast('Unable to copy link');
      }
    });
  }

  // simple toast
  function showToast(msg){
    const el = document.createElement('div');
    el.textContent = msg;
    Object.assign(el.style, {
      position: 'fixed', bottom: '86px', left: '50%', transform: 'translateX(-50%)',
      padding:'8px 14px', background:'rgba(0,0,0,0.85)', color:'#fff', borderRadius:'999px', zIndex:9999, fontSize:'13px'
    });
    document.body.appendChild(el);
    setTimeout(()=> el.style.opacity = '0', 1600);
    setTimeout(()=> el.remove(), 2200);
  }

  // Lightbox: basic click-to-open for images and videos
  (function lightbox(){
    let overlay, content, items;
    function createLB(){
      overlay = document.createElement('div'); overlay.className='lb-overlay';
      Object.assign(overlay.style, {position:'fixed',left:0,top:0,right:0,bottom:0,background:'rgba(0,0,0,0.94)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',zIndex:99999});
      content = document.createElement('div'); content.style.maxWidth='1200px'; content.style.width='100%';
      overlay.appendChild(content); document.body.appendChild(overlay);
      overlay.addEventListener('click', (e)=> { if (e.target === overlay) closeLB(); });
      document.addEventListener('keydown', (e)=> { if (!overlay || overlay.style.display==='none') return; if (e.key==='Escape') closeLB(); if (e.key==='ArrowRight') navigate(1); if (e.key==='ArrowLeft') navigate(-1); });
    }
    function openAt(index){
      items = Array.from(document.querySelectorAll('.project-image img, .project-image video'));
      if (!items.length || index<0 || index>=items.length) return;
      if (!overlay) createLB();
      render(index);
      overlay.style.display='flex';
    }
    function closeLB(){ if (overlay) overlay.style.display='none'; }
    let cur = 0;
    function navigate(dir){ cur = Math.max(0, Math.min(items.length-1, cur + dir)); render(cur); }
    function render(i){
      cur = i;
      content.innerHTML = '';
      const it = items[cur];
      if (!it) return;
      if (it.tagName === 'IMG') {
        const im = document.createElement('img'); im.src = it.src || it.dataset.src; im.style.width='100%'; content.appendChild(im);
      } else if (it.tagName === 'VIDEO') {
        const v = document.createElement('video'); v.controls=true; v.autoplay=true; v.style.width='100%';
        const src = it.currentSrc || it.querySelector('source')?.src || it.src;
        const s = document.createElement('source'); s.src = src; v.appendChild(s); content.appendChild(v);
      }
    }
    document.body.addEventListener('click', (e)=>{
      const img = e.target.closest('.project-image img');
      const vid = e.target.closest('.project-image video');
      if (img) { const itemsArr = Array.from(document.querySelectorAll('.project-image img, .project-image video')); openAt(itemsArr.indexOf(img)); }
      else if (vid) { const itemsArr = Array.from(document.querySelectorAll('.project-image img, .project-image video')); openAt(itemsArr.indexOf(vid)); }
    });
  })();
});
