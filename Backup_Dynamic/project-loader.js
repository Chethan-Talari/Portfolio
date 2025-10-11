// project-loader.js - simplified robust loader using absolute URLs
(function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');

  const titleEl = document.getElementById('projectTitle');
  const descEl  = document.getElementById('projectDesc');
  const bodyEl  = document.getElementById('projectBody');
  const metaEl  = document.getElementById('projectMeta');
  const heroEl  = document.getElementById('projectHero');

  function showNotFound(){
    if (titleEl) titleEl.textContent = 'Project not found';
    if (descEl) descEl.textContent = '';
    if (bodyEl) bodyEl.innerHTML = '';
  }

  function isVideoFile(path){
    return /\.(mp4|webm|ogg)$/i.test(path);
  }

  async function loadProjectsJson(){
    try {
      const r = await fetch('projects.json', {cache:'no-store'});
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      return await r.json();
    } catch(e){
      console.error('Failed loading projects.json', e);
      return null;
    }
  }

  // convert any given path to an absolute URL (works for absolute, root-relative, or relative)
  function absUrl(path) {
    try {
      // If path already absolute (starts with http/https), URL will handle it
      return new URL(path, location.origin + '/').href;
    } catch (e) {
      // fallback: join with origin
      return (location.origin + '/' + path.replace(/^\.\//,'')).replace(/([^:])\/{2,}/g, '$1/');
    }
  }

  async function renderProject(){
    if (!slug) { showNotFound(); return; }

    const data = await loadProjectsJson();
    if (!data) { if (bodyEl) bodyEl.innerHTML = '<p style="color:#777">Unable to load project data.</p>'; return; }

    // find project
    let project = null;
    if (Array.isArray(data)) project = data.find(p => (p.slug || '') === slug);
    else project = data[slug] || Object.values(data).find(p => (p.slug || '') === slug);

    if (!project) { showNotFound(); return; }

    if (titleEl) titleEl.textContent = project.title || project.slug || 'Untitled';
    if (descEl) descEl.textContent = project.description || project.excerpt || '';
    if (metaEl) metaEl.innerHTML = (project.category ? `<div>${project.category}</div>` : '') + (project.year ? `<div>${project.year}</div>` : '');

    // hero: use absolute url
    if (heroEl) {
      heroEl.innerHTML = '';
      if (project.cover) {
        const heroUrl = absUrl(project.cover);
        console.log('Using hero URL:', heroUrl);
        const img = document.createElement('img');
        img.src = heroUrl;
        img.alt = project.title || project.slug;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.loading = 'lazy';
        img.onerror = () => { img.style.display = 'none'; };
        heroEl.appendChild(img);
      }
    }

    // media
    const raw = project.media || [];
    const entries = (Array.isArray(raw) ? raw : []).map(x => (typeof x === 'string' ? {file: x} : x)).filter(Boolean);
    if (!entries.length && project.cover) entries.push({file: project.cover});

    bodyEl.innerHTML = '';
    const gallery = document.createElement('div');
    gallery.className = 'project-gallery';

    for (const e of entries) {
      const file = e.file || e.src || '';
      const type = e.type || (isVideoFile(file) ? 'video' : 'image');
      const full = absUrl(file);
      console.log('Appending media', type, full);

      const wrap = document.createElement('div');
      wrap.className = 'project-image';

      if (type === 'video') {
        const v = document.createElement('video');
        v.controls = true;
        v.preload = 'metadata';
        v.style.width = '100%';
        const source = document.createElement('source');
        source.src = full;
        v.appendChild(source);
        v.onerror = () => { console.warn('Video failed to load:', full); };
        wrap.appendChild(v);
      } else {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = full;
        img.alt = project.title || project.slug;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.onerror = () => { console.warn('Image failed to load:', full); img.style.display='none'; };
        wrap.appendChild(img);
      }

      gallery.appendChild(wrap);
    }

    bodyEl.appendChild(gallery);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderProject);
  else renderProject();

})();
