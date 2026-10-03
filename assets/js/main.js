/* =====================================================================
   main.js — content/*.yml 을 읽어 페이지를 채웁니다.
   보통은 이 파일을 수정할 필요가 없습니다. 내용은 content/ 폴더에서!
   ===================================================================== */
(() => {
  'use strict';
  const FILES = ['profile', 'research', 'publications', 'projects', 'news', 'people', 'honors'];
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, attrs = {}, html = '') => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'style' && typeof v === 'object') Object.entries(v).forEach(([p, val]) => e.style.setProperty(p, val));
      else e.setAttribute(k, v);
    }
    if (html) e.innerHTML = html;
    return e;
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // tiny markdown: **bold**, *italic*, [text](url)
  const md = s => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+|[^)\s]+)\)/g, (m, t, u) => `<a href="${u}" ${/^https?:/.test(u) ? 'target="_blank" rel="noopener"' : ''}>${t}</a>`);
  const list = v => Array.isArray(v) ? v : [];
  const ICONS = {
    mail: '<path d="M3 5h18v14H3z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m3 6 9 7 9-7" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    doc: '<path d="M6 2h9l5 5v15H6z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M14 2v6h6M9 13h8M9 17h8" stroke="currentColor" stroke-width="1.8"/>',
    pin: '<path d="M12 22s7-7.6 7-13a7 7 0 1 0-14 0c0 5.4 7 13 7 13z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="9" r="2.5" fill="currentColor"/>',
    lab: '<path d="M9 2v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 8V2M8 2h8M7 14h10" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    uni: '<path d="m2 9 10-5 10 5-10 5z M6 11v5c3 2 9 2 12 0v-5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    scholar: '<path d="m2 9 10-6 10 6-10 6z" fill="currentColor"/><circle cx="12" cy="17" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    orcid: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 9v7M11 8h2.5a4 4 0 0 1 0 8H11z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" stroke="currentColor" stroke-width="1.8"/>',
    link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    github: '<path d="M12 2a10 10 0 0 0-3 19.5c.5 0 .7-.2.7-.5v-2c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z" fill="currentColor"/>'
  };
  const icon = n => `<svg class="ic" viewBox="0 0 24 24">${ICONS[n] || ICONS.link}</svg>`;

  let PILLAR = {};
  const colorOf = name => PILLAR[(name || '').toLowerCase()] || '#38bdf8';
  const initials = n => n.split(/[\s·]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  // ------------------------------------------------------------------ load
  async function load() {
    if (location.protocol === 'file:') {
      showError('이 페이지는 파일을 직접 열면(file://) 내용을 불러올 수 없습니다.\n폴더에서 터미널을 열고 <code>python -m http.server</code> 실행 후 <code>http://localhost:8000</code> 으로 여세요.\n(Opened as a local file — run a local server; see README.)');
      return;
    }
    if (!window.jsyaml) { showError('js-yaml 라이브러리를 불러오지 못했습니다 (인터넷 연결 확인).'); return; }
    const data = {}, errs = [];
    await Promise.all(FILES.map(async f => {
      try {
        const r = await fetch(`content/${f}.yml?v=${Date.now()}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        data[f] = jsyaml.load(await r.text()) || {};
      } catch (e) {
        errs.push(`<b>content/${f}.yml</b>: ${esc(e.reason || e.message)}${e.mark ? ` — line ${e.mark.line + 1}, column ${e.mark.column + 1}` : ''}`);
        data[f] = {};
      }
    }));
    if (errs.length) showError('YAML 파일에 오류가 있습니다 (YAML error):\n' + errs.join('\n') + '\n흔한 원인: 들여쓰기(스페이스 2칸), 콜론(:)이 들어간 문장을 따옴표로 감싸지 않음.');
    const safe = (fn, d, name) => { try { fn(d); } catch (e) { console.error(name, e); } };
    safe(renderProfile, data.profile, 'profile');
    safe(renderResearch, data.research, 'research');
    safe(renderProjects, data.projects, 'projects');
    safe(renderPubs, data.publications, 'publications');
    safe(renderNews, data.news, 'news');
    safe(renderPeople, data.people, 'people');
    safe(renderHonors, data.honors, 'honors');
    setupReveal();
  }
  function showError(html) { const b = $('#load-error'); b.innerHTML = html; b.hidden = false; }

  // ------------------------------------------------------------------ profile
  function renderProfile(p) {
    if (!p || !p.name) return;
    list(p.pillars).forEach(x => PILLAR[x.name.toLowerCase()] = x.color);
    const root = document.documentElement.style;
    ['physics', 'probability', 'ai', 'people'].forEach(k => PILLAR[k] && root.setProperty(`--${k}`, PILLAR[k]));

    document.title = `${p.name} · ${p.tagline || 'Research'}`;
    $('#hero-name').textContent = p.name;
    $('#hero-cred').textContent = p.credentials ? `, ${p.credentials}` : '';
    $('#hero-title').textContent = p.title || '';
    $('#hero-aff').textContent = [p.affiliation, p.institution].filter(Boolean).join(' · ');
    $('#hero-tagline').textContent = p.tagline || '';
    $('#hero-headline').textContent = p.headline || '';
    $('.brand-name').textContent = p.name;

    const pl = $('#hero-pillars'); pl.innerHTML = '';
    list(p.pillars).forEach(x => pl.append(el('li', { style: { '--c': x.color }, title: x.short || '' }, `<i></i><b>${esc(x.name)}</b>`)));
    $('#pillar-bar').innerHTML = list(p.pillars).map(x => `<span style="--c:${esc(x.color)}"></span>`).join('');
    $('#foot-pillars').innerHTML = list(p.pillars).map(x => `<b style="color:${esc(x.color)}">${esc(x.name)}</b>`).join(' · ');
    $('#foot-copy').textContent = `© ${new Date().getFullYear()} ${p.name}`;

    const m = p.media || {};
    if (m.portrait) $('#portrait').src = m.portrait;
    if (m.avatar) $('#avatar').src = m.avatar;
    const hv = $('#hero-video');
    if (m.hero_video) { hv.querySelector('source').src = m.hero_video; if (m.hero_poster) hv.poster = m.hero_poster; hv.load(); }
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) hv.play().catch(() => {});

    $('#bio').innerHTML = list(p.bio).map(t => `<p>${md(t)}</p>`).join('');
    $('#appointments').innerHTML = list(p.appointments).map(a => `<li><b>${esc(a.role)}</b><span>${esc(a.org)} · ${esc(a.years)}</span></li>`).join('');
    $('#education').innerHTML = list(p.education).map(a => `<li><b>${esc(a.degree)}</b><span>${esc(a.school)} · ${esc(a.year)}</span></li>`).join('');

    const c = p.contact || {};
    document.querySelectorAll('[data-bind="cv"]').forEach(a => { if (c.cv) a.href = c.cv; else a.remove(); });
    const links = list(p.links);
    const ar = $('#about-links'); ar.innerHTML = '';
    if (c.cv) ar.append(el('a', { class: 'btn btn-out', href: c.cv, target: '_blank', rel: 'noopener' }, `${icon('doc')}Download CV`));
    links.forEach(l => ar.append(el('a', { class: 'btn btn-out', href: l.url, target: '_blank', rel: 'noopener' }, `${icon(l.icon)}${esc(l.label)}`)));

    const pc = list(p.pillars).map(x => x.color);
    $('#stats').innerHTML = list(p.stats).map((s, i) => `<div class="stat" style="--c:${esc(pc[i % pc.length] || '#0e1726')}"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('');

    // overview video
    $('#ov-title').textContent = m.overview_title || 'Research overview';
    $('#ov-cap').textContent = m.overview_caption || '';
    const pl2 = $('#player');
    if (m.overview_youtube) {
      pl2.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${esc(m.overview_youtube)}?rel=0" title="Research overview" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`;
    } else if (m.overview_video) {
      pl2.innerHTML = `<video controls preload="none" playsinline poster="${esc(m.overview_poster || '')}"><source src="${esc(m.overview_video)}" type="video/mp4"></video>`;
    } else $('#overview').remove();

    // contact
    const lines = [];
    if (c.email) lines.push(`<div class="cline">${icon('mail')}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a><button class="copy" data-copy="${esc(c.email)}">copy</button></div>`);
    if (c.email2) lines.push(`<div class="cline">${icon('mail')}<a href="mailto:${esc(c.email2)}">${esc(c.email2)}</a><button class="copy" data-copy="${esc(c.email2)}">copy</button></div>`);
    if (c.address) lines.push(`<div class="cline">${icon('pin')}<span>${esc(c.address)}</span></div>`);
    const btns = [];
    if (c.cv) btns.push(`<a class="btn btn-light" href="${esc(c.cv)}" target="_blank" rel="noopener">${icon('doc')}CV (PDF${c.cv_updated ? ', ' + esc(c.cv_updated) : ''})</a>`);
    links.forEach(l => btns.push(`<a class="btn btn-ghost" href="${esc(l.url)}" target="_blank" rel="noopener">${icon(l.icon)}${esc(l.label)}</a>`));
    $('#contact-lines').innerHTML = lines.join('') + `<div class="c-btns">${btns.join('')}</div>`;
    document.querySelectorAll('.copy').forEach(b => b.addEventListener('click', () => {
      navigator.clipboard?.writeText(b.dataset.copy).then(() => { b.textContent = 'copied'; setTimeout(() => b.textContent = 'copy', 1400); });
    }));
  }

  // ------------------------------------------------------------------ research
  function mediaHTML(m, alt) {
    if (!m) return '';
    if (m.type === 'video') return `<video autoplay muted loop playsinline preload="metadata" poster="${esc(m.poster || '')}" aria-label="${esc(alt)}"><source src="${esc(m.src)}" type="video/mp4"></video>`;
    return `<img src="${esc(m.src)}" alt="${esc(alt)}" loading="lazy">`;
  }
  function renderResearch(r) {
    if (!r) return;
    $('#research-intro').innerHTML = md(r.intro || '');
    const box = $('#themes'); box.innerHTML = '';
    list(r.themes).forEach(t => {
      const c = colorOf(t.pillar);
      const art = el('article', { class: 'theme reveal', id: `theme-${t.id || ''}`, style: { '--accent': c } });
      const gal = list(t.gallery);
      const papers = list(t.papers).map(d => `<a href="https://doi.org/${esc(d)}" target="_blank" rel="noopener">${icon('doc')} ${esc(d.split('/')[0] === '10.48550' ? 'arXiv' : 'doi')}: ${esc(d.replace(/^10\.\d+\//, ''))}</a>`).join('');
      art.innerHTML = `
        <figure class="theme-media">
          <div class="frame" data-full="${t.media && t.media.type !== 'video' ? esc(t.media.src) : ''}" data-cap="${esc(t.media?.caption || '')}">${mediaHTML(t.media, t.title)}</div>
          <figcaption>${md(t.media?.caption || '')}</figcaption>
          ${gal.length ? `<div class="thumbs">${gal.map(g => `<button data-full="${esc(g.src)}" data-cap="${esc(g.caption || '')}" aria-label="Enlarge figure"><img src="${esc(g.src)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
        </figure>
        <div>
          <div class="theme-kicker">${esc(t.kicker || t.pillar)}</div>
          <h3>${esc(t.title)}</h3>
          <p>${md(t.summary || '')}</p>
          <ul>${list(t.bullets).map(b => `<li>${md(b)}</li>`).join('')}</ul>
          <div class="tags">${list(t.tags).map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
          ${papers ? `<div class="paper-links">${papers}</div>` : ''}
        </div>`;
      box.append(art);
    });
    const also = $('#also'); also.innerHTML = '';
    list(r.also).forEach(a => {
      const card = el('article', { class: 'also reveal', style: { '--accent': a.color || '#4ade80' } });
      const g = list(a.gallery);
      card.innerHTML = `<div class="img ${a.fit === 'contain' ? 'contain' : a.fit === 'contain-dark' ? 'contain dark' : ''}" data-full="${esc(a.image)}" data-cap="${esc(a.title)}">${a.image ? `<img src="${esc(a.image)}" alt="${esc(a.title)}" loading="lazy">` : ''}</div>
        <div class="body"><h4>${esc(a.title)}</h4><p>${md(a.text || '')}</p>
        ${g.length ? `<div class="thumbs">${g.map(x => `<button data-full="${esc(x.src)}" data-cap="${esc(x.caption || '')}" aria-label="Enlarge figure"><img src="${esc(x.src)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}</div>`;
      also.append(card);
    });
  }

  // ------------------------------------------------------------------ projects
  function renderProjects(d) {
    const ps = list(d && d.projects);
    const cur = ps.filter(p => p.status === 'current');
    $('#proj-current').innerHTML = cur.map(p => `
      <article class="proj reveal" style="--accent:${esc(p.color || '#38bdf8')}">
        <span class="role">${esc(p.role || '')}</span>
        <h4>${esc(p.title)}</h4>
        ${p.text ? `<p>${md(p.text)}</p>` : ''}
        <div class="meta"><span>${esc(p.sponsor || '')}</span><span><b>${esc(p.amount || '')}</b>${p.amount ? ' · ' : ''}${esc(p.period || '')}</span></div>
      </article>`).join('');
    $('#proj-pending').innerHTML = ps.filter(p => p.status === 'pending').map(p =>
      `<div class="pending"><span class="pill">Pending</span><b>${esc(p.title)}</b> — ${esc(p.sponsor || '')} · ${esc(p.role || '')}${p.amount ? ' · ' + esc(p.amount) : ''}</div>`).join('');
    $('#proj-past').innerHTML = ps.filter(p => p.status === 'past').map(p =>
      `<li><b>${esc(p.title)}</b><span>${esc(p.sponsor || '')} · ${esc(p.role || '')} · ${esc(p.period || '')}</span></li>`).join('');
  }

  // ------------------------------------------------------------------ publications
  function renderPubs(d) {
    const papers = list(d && d.papers).map((p, i) => ({ ...p, _i: i }));
    const me = list(d && d.me);
    const TYPES = [['all', 'All'], ['selected', 'Selected'], ['journal', 'Journal'], ['conference', 'Proceedings'], ['submitted', 'Under review'], ['report', 'Reports & thesis']];
    const count = k => k === 'all' ? papers.length : k === 'selected' ? papers.filter(p => p.selected).length
      : k === 'report' ? papers.filter(p => p.type === 'report' || p.type === 'thesis').length : papers.filter(p => p.type === k).length;
    let filt = 'all', q = '';
    const fbox = $('#pub-filters');
    fbox.innerHTML = TYPES.filter(([k]) => count(k) > 0).map(([k, l]) => `<button class="chip" role="tab" data-k="${k}" aria-selected="${k === filt}">${l}<small>${count(k)}</small></button>`).join('');
    fbox.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      filt = b.dataset.k; fbox.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-selected', x === b)); draw();
    });
    $('#pub-search').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); draw(); });
    const bold = a => { let s = esc(a); me.forEach(n => { s = s.split(esc(n)).join(`<b>${esc(n)}</b>`); }); return s; };
    const LBL = { journal: 'Journal', conference: 'Proceedings', submitted: 'Under review', report: 'Report', thesis: 'Thesis' };
    function draw() {
      let ps = papers.filter(p => filt === 'all' || (filt === 'selected' ? p.selected : filt === 'report' ? (p.type === 'report' || p.type === 'thesis') : p.type === filt));
      if (q) ps = ps.filter(p => [p.title, p.authors, p.venue, p.year].join(' ').toLowerCase().includes(q));
      // order: submitted first, then by year desc, keep file order within year
      const rank = p => p.type === 'submitted' ? 1 : 0;
      ps.sort((a, b) => rank(b) - rank(a) || (b.year || 0) - (a.year || 0) || a._i - b._i);
      const groups = [];
      ps.forEach(p => {
        const key = p.type === 'submitted' ? 'In review' : String(p.year || '');
        let g = groups.find(x => x.k === key); if (!g) groups.push(g = { k: key, items: [] }); g.items.push(p);
      });
      $('#pub-list').innerHTML = groups.length ? groups.map(g => `
        <div class="year-group"><div class="yr">${esc(g.k)}</div><div>${g.items.map(p => {
          const url = p.url || (p.doi ? `https://doi.org/${p.doi}` : '');
          return `<div class="pub ${p.selected ? 'sel' : ''}">
            <p class="pub-title">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title)}</p>
            <p class="pub-auth">${bold(p.authors || '')}</p>
            <p class="pub-venue"><i>${esc(p.venue || '')}</i>${p.details && p.type !== 'submitted' ? `<span>${esc(p.details)}</span>` : ''}
              <span class="badge ${esc(p.type)}">${p.type === 'submitted' ? esc(p.details || 'Under review') : (LBL[p.type] || esc(p.type || ''))}</span>
              ${p.selected ? '<span class="badge star">★ Selected</span>' : ''}
              ${p.doi ? `<a class="doi" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>` : ''}</p>
          </div>`; }).join('')}</div></div>`).join('') : '<p class="pub-empty">No matching publications.</p>';
    }
    draw();
  }

  // ------------------------------------------------------------------ news
  function renderNews(d) {
    const TAGC = { award: '#fb923c', paper: '#38bdf8', grant: '#2dd4bf', talk: '#a78bfa', media: '#f472b6', service: '#94a3b8' };
    const items = list(d && d.news);
    const SHOW = 6;
    const box = $('#news-list');
    const fmt = s => { const [y, m] = String(s).split('-'); const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return m ? `${M[+m - 1] || m} ${y}` : y; };
    box.innerHTML = items.map((n, i) => `<li ${i >= SHOW ? 'hidden' : ''} style="--c:${TAGC[n.tag] || '#38bdf8'}"><time>${esc(fmt(n.date))}<span class="ntag">${esc(n.tag || '')}</span></time><p>${md(n.text)}</p></li>`).join('');
    if (items.length > SHOW) {
      const b = el('button', { class: 'news-more' }, `Show all ${items.length} →`);
      b.addEventListener('click', () => { box.querySelectorAll('li[hidden]').forEach(x => x.hidden = false); b.remove(); });
      box.after(b);
    }
  }

  // ------------------------------------------------------------------ people
  function renderPeople(d) {
    if (!d) return;
    $('#mentoring-intro').innerHTML = md(d.mentoring_intro || '');
    const pc = Object.values(PILLAR);
    const ms = list(d.mentees);
    $('#mentees-current').innerHTML = ms.filter(m => m.current).map((m, i) => `
      <div class="person reveal"><span class="ini" style="--c:${pc[i % pc.length] || '#38bdf8'}">${esc(initials(m.name))}</span>
      <div><b>${esc(m.name)}</b><span class="r">${esc(m.role || '')}</span><span class="t">${esc(m.topic || '')}</span></div></div>`).join('');
    $('#mentees-past').innerHTML = ms.filter(m => !m.current).map(m => `<li><b>${esc(m.name)}</b><span>${esc(m.role || '')} — ${esc(m.topic || '')}</span></li>`).join('');
    $('#collab-intro').textContent = d.collaborators_intro || 'Collaborators';
    $('#collabs').innerHTML = list(d.collaborators).map(g => `<div class="collab-group"><h4 class="h4">${esc(g.group)}</h4><div class="collab-chips">${list(g.names).map(n => `<span>${esc(n)}</span>`).join('')}</div></div>`).join('');
  }

  // ------------------------------------------------------------------ honors
  function renderHonors(d) {
    if (!d) return;
    const dated = (arr, f) => list(arr).map(x => `<li><span>${esc(x.year || '')}</span><span>${f(x)}</span></li>`).join('');
    const lnk = (x, t) => x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${t}</a>` : t;
    $('#awards').innerHTML = dated(d.awards, x => md(x.text));
    $('#talks').innerHTML = dated(d.talks, x => lnk(x, esc(x.text)));
    $('#media').innerHTML = dated(d.media, x => `<span class="outlet">${esc(x.outlet || '')}</span> — ${lnk(x, esc(x.text))}`);
    $('#service').innerHTML = list(d.service).map(s => `<li><b>${esc(s.label)}</b>${esc(s.text)}</li>`).join('')
      + (list(d.memberships).length ? `<li><b>Memberships</b>${list(d.memberships).map(esc).join(' · ')}</li>` : '');
    $('#skills').innerHTML = list(d.skills).map(g => `<div class="skill-g"><b>${esc(g.group)}</b>${list(g.items).map(i => `<span>${esc(i)}</span>`).join('')}</div>`).join('');
  }

  // ------------------------------------------------------------------ UI: nav, lightbox, reveal
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('solid', scrollY > window.innerHeight * 0.75 - 64);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('.nav-toggle').addEventListener('click', () => {
    const o = nav.classList.toggle('open'); $('.nav-toggle').setAttribute('aria-expanded', o);
  });
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  const lb = $('#lightbox');
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-full]');
    if (!t || !t.dataset.full) return;
    $('#lb-img').src = t.dataset.full; $('#lb-cap').textContent = t.dataset.cap || '';
    lb.showModal();
  });
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-close')) lb.close(); });

  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }

  load();
})();
