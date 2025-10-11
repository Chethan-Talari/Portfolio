// home-top3.js
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('homeProjects');
  if (!container) return;
  try {
    const r = await fetch('manifest.json', {cache:'no-cache'});
    const manifest = await r.json();
    const projects = Object.values(manifest || {}).filter(p => p.featured);
    // sort by feature_rank
    projects.sort((a,b)=>(a.feature_rank||999)-(b.feature_rank||999));

    // pick top 3 but enforce max one per category: prefer earliest featured of each category
    const chosen = [];
    const seenCat = new Set();
    for (const p of projects) {
      if (!seenCat.has(p.category)) {
        chosen.push(p);
        seenCat.add(p.category);
      }
      if (chosen.length >= 3) break;
    }
    // if chosen <3, fill with other featured ignoring category
    if (chosen.length < 3) {
      for (const p of projects) {
        if (!chosen.includes(p)) { chosen.push(p); if (chosen.length>=3) break; }
      }
    }

    container.innerHTML = '';
    chosen.forEach(p => {
      const a = document.createElement('a');
      a.className = 'project-card';
      a.href = `project.html?slug=${encodeURIComponent(p.slug)}`;
      a.innerHTML = `
        <img class="thumb" src="${p.thumb}" alt="${p.title} thumb">
        <div class="card-overlay" aria-hidden="true"><div class="card-title">${p.title}</div></div>
        <div class="meta" aria-hidden="true" style="padding:10px 0 0;"><div class="meta-title">${p.title}</div></div>
      `;
      container.appendChild(a);
    });

  } catch (e) {
    console.error(e);
  }
});
