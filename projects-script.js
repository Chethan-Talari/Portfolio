// projects-script.js
// Robust tab ordering + default UI/UX active + consistent card sizing (16:9)

(async function () {
  const manifestPath = 'projects.json';
  let projects = [];
  const projectsGrid = document.getElementById('projectsGrid');
  const tabsContainer = document.getElementById('projectTabs');
  const sortSelect = document.getElementById('sortSelect');

  // The exact order you requested (we will match these to actual categories in data)
  const preferredOrderNormalized = ['ui/ux', 'brand identity', 'documentaries', 'editing'];

  async function loadManifest() {
    try {
      const resp = await fetch(manifestPath, { cache: "no-store" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      const json = await resp.json();
      if (Array.isArray(json)) projects = json.slice();
      else if (json && typeof json === 'object') projects = Object.keys(json).map(k => ({ slug: k, ...json[k] }));
      else projects = [];
      console.log('Loaded projects:', projects.length);
    } catch (err) {
      console.error('Error loading projects.json:', err);
      projects = [];
      if (projectsGrid) projectsGrid.innerHTML = `<div style="grid-column:1/-1;color:#777;padding:28px 20px;">Error loading projects: ${err.message}</div>`;
    }
  }

  // return array of unique category strings as they appear in data
  function getCategories(list) {
    const set = new Set();
    list.forEach(p => {
      if (p.category) {
        p.category.split(',').map(s => s.trim()).forEach(cat => { if (cat) set.add(cat); });
      }
    });
    return Array.from(set);
  }

  // find the actual category string from 'cats' that matches a normalized preference
  function findMatchingCategory(cats, normalizedKey) {
    const lowerCats = cats.map(c => c.toLowerCase());
    // exact match first
    let idx = lowerCats.indexOf(normalizedKey);
    if (idx !== -1) return cats[idx];
    // otherwise accept partial matches (like 'ui/ux design' vs 'ui/ux')
    for (let i=0;i<lowerCats.length;i++){
      if (lowerCats[i].includes(normalizedKey) || normalizedKey.includes(lowerCats[i])) return cats[i];
    }
    return null;
  }

  // Build tabs in the exact requested order, with "View all" last.
  function buildTabs(list) {
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';

    const cats = getCategories(list); // actual category labels
    const ordered = [];

    // map preferred normalized list to actual labels if present
    preferredOrderNormalized.forEach(pref => {
      const match = findMatchingCategory(cats, pref);
      if (match && !ordered.includes(match)) ordered.push(match);
    });

    // append any remaining categories not in preferredOrder (preserve their original order)
    cats.forEach(c => { if (!ordered.includes(c)) ordered.push(c); });

    // Determine default active: prefer the UI/UX actual label, otherwise 'all'
    const defaultUIUX = findMatchingCategory(cats, 'ui/ux');
    const defaultActive = defaultUIUX || 'all';

    // Create buttons for ordered categories
    ordered.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'tab';
      btn.type = 'button';
      btn.dataset.cat = cat;
      btn.textContent = cat;
      if (cat === defaultActive) btn.classList.add('active');
      tabsContainer.appendChild(btn);
    });

    // Finally add View all as the last tab
    const allBtn = document.createElement('button');
    allBtn.className = 'tab';
    allBtn.type = 'button';
    allBtn.dataset.cat = 'all';
    allBtn.textContent = 'View all';
    if (defaultActive === 'all') allBtn.classList.add('active');
    tabsContainer.appendChild(allBtn);

    // Ensure single event listener (remove previous if any)
    if (tabsContainer._listenerAttached) return;
    tabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      updateView(btn.dataset.cat || 'all', sortSelect?.value || 'featured');
      // scroll to grid top a little for UX
      projectsGrid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    tabsContainer._listenerAttached = true;
  }

  function createCard(p) {
    const a = document.createElement('a');
    a.className = 'project-card';
    a.href = `project.html?slug=${encodeURIComponent(p.slug)}`;
    a.setAttribute('aria-label', p.title || p.slug);

    const img = p.thumb || p.cover || (p.media && p.media[0]) || '';

    const thumb = document.createElement('div');
    thumb.className = 'project-thumb';
    if (img) {
      // set background image — escape single quotes
      thumb.style.backgroundImage = `url("${img.replace(/"/g,'\\"')}")`;
      // test image existence to fall back gracefully
      const tester = new Image();
      tester.onerror = () => {
        thumb.style.backgroundImage = 'none';
        thumb.style.backgroundColor = '#f6f6f6';
      };
      tester.src = img;
    } else {
      thumb.style.backgroundColor = '#f6f6f6';
    }

    const meta = document.createElement('div');
    meta.className = 'project-meta';
    const h = document.createElement('h4');
    h.textContent = p.title || p.slug;
    const sub = document.createElement('div');
    sub.className = 'meta-sub';
    sub.textContent = [p.category || '', p.year || ''].filter(Boolean).join(' · ');

    meta.appendChild(h);
    meta.appendChild(sub);
    a.appendChild(thumb);
    a.appendChild(meta);
    return a;
  }

  function renderList(list) {
    if (!projectsGrid) return;
    projectsGrid.classList.add('projects-grid');
    projectsGrid.innerHTML = '';
    if (!list.length) {
      projectsGrid.innerHTML = `<div style="grid-column:1/-1;color:#777;padding:28px 20px;">No projects found.</div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    list.forEach(p => frag.appendChild(createCard(p)));
    projectsGrid.appendChild(frag);
  }

  function filterByCategory(list, cat) {
    if (!cat || cat === 'all') return list;
    return list.filter(p => {
      if (!p.category) return false;
      const cats = p.category.split(',').map(s => s.trim().toLowerCase());
      // match normalized category names: if user clicked 'UI/UX' and project has 'UI/UX design'
      const clicked = (cat || '').toLowerCase();
      return cats.some(c => c === clicked || c.includes(clicked) || clicked.includes(c));
    });
  }

  function sortList(list, mode) {
    const arr = list.slice();
    if (mode === 'featured') arr.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    else if (mode === 'title') arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    return arr;
  }

  function updateView(cat = 'all', sortKey = 'featured') {
    let list = filterByCategory(projects, cat);
    list = sortList(list, sortKey);
    renderList(list);
  }

  // Init sequence
  await loadManifest();
  buildTabs(projects);

  // Find which tab is actually active (we set it in buildTabs) and render that
  const activeBtn = tabsContainer?.querySelector('.tab.active');
  const initialCat = activeBtn ? activeBtn.dataset.cat : 'all';
  updateView(initialCat, sortSelect?.value || 'featured');

  // Wire sort control
  sortSelect?.addEventListener('change', () => {
    const active = tabsContainer?.querySelector('.tab.active');
    updateView(active?.dataset.cat || 'all', sortSelect.value);
  });

})();
