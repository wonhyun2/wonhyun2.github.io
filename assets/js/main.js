/* =====================================================================
   main.js — content/*.yml 을 읽어 페이지를 채웁니다.
   보통은 이 파일을 수정할 필요가 없습니다. 내용은 content/ 폴더에서!
   ===================================================================== */
(() => {
  'use strict';
  const FILES = ['profile', 'research', 'publications', 'projects', 'news', 'people', 'honors', 'gallery'];
  // optional files: missing = section simply stays hidden (no error banner)
  const OPTIONAL = ['features', 'media', 'sites', 'software', 'explorer', 'stories', 'teaching', 'join'];
  const PREVIEW = new URLSearchParams(location.search).has('preview');
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

  // ------------------------------------------------------------------ language (EN / 한국어)
  //  ▸ 내용 번역: YAML 항목 이름 뒤에 _ko 를 붙인 값 (예: title_ko) — 없으면 영어 사용
  //  ▸ 화면 글자(메뉴·제목·버튼) 번역: 아래 UI.ko
  const LANGS = ['en', 'ko'];
  const LANG = (() => {
    const q = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(q)) { try { localStorage.setItem('lang', q); } catch (e) {} return q; }
    try { const s = localStorage.getItem('lang'); if (LANGS.includes(s)) return s; } catch (e) {}
    return 'en';
  })();
  const UI = { ko: {
    'nav.research': '연구', 'nav.projects': '연구과제', 'nav.pubs': '논문', 'nav.news': '소식', 'nav.team': '구성원', 'nav.gallery': '갤러리', 'nav.contact': '연락처',
    'hero.watch': '연구 소개 영상 보기', 'hero.explore': '연구 둘러보기',
    'about.kicker': '소개', 'about.h2': '홍수는 한 가지 원인으로 오지 않습니다.<br><em>예측도 그래야 합니다.</em>', 'about.appts': '경력', 'about.edu': '학력',
    'ov.kicker': '연구 소개 영상',
    'res.kicker': '연구', 'res.h2': '관측 <span class="arrow">→</span> 모의 <span class="arrow">→</span> 학습 <span class="arrow">→</span> 실행', 'res.also': '홍수, 그 너머의 연구',
    'proj.kicker': '연구비 과제', 'proj.h2': '연구 과제', 'proj.past': '지난 과제', 'proj.pending': '심사 중',
    'pub.kicker': '논문', 'pub.h2': '논문 및 프리프린트', 'pub.search': '제목, 저자, 저널 검색…',
    'pub.note': '지도 학생들이 여러 논문의 공저자로 참여했습니다. 전체 목록은 <a data-bind="cv" href="assets/cv/Wonhyun_Lee_CV.pdf" target="_blank" rel="noopener">CV</a>에 있습니다.',
    'pub.all': '전체', 'pub.selected': '대표 논문', 'pub.journal': '저널', 'pub.conference': '프로시딩', 'pub.submitted': '심사 중', 'pub.report': '보고서 · 학위논문',
    'pub.b.journal': '저널', 'pub.b.conference': '프로시딩', 'pub.b.report': '보고서', 'pub.b.thesis': '학위논문', 'pub.b.star': '★ 대표',
    'pub.inreview': '심사 중', 'pub.empty': '검색 결과가 없습니다.', 'st.under review': '심사 중', 'st.in preparation': '준비 중', 'st.in revision': '수정 중', 'st.in press': '게재 예정', 'st.submitted': '투고 완료',
    'pub.inpress': '게재 예정', 'pub.review': '심사 · 수정 중', 'pub.prep': '준비 중',
    'news.kicker': '소식', 'news.h2': '최근 소식', 'news.all': '전체 {n}개 보기 →',
    'tag.award': '수상', 'tag.paper': '논문', 'tag.grant': '연구비', 'tag.talk': '발표', 'tag.media': '언론', 'tag.service': '봉사',
    'team.kicker': '팀', 'team.h2': '구성원', 'team.alumni': '이전 멤버', 'team.with': '공동지도',
    'gal.kicker': '갤러리', 'gal.all': '전체', 'gal.more': '사진 더 보기',
    'rec.kicker': '수상 및 학술 활동', 'rec.h2': '수상 · 초청강연 · 학술봉사', 'rec.awards': '수상', 'rec.talks': '초청 강연', 'rec.service': '학술 봉사', 'rec.media': '언론 보도', 'rec.toolbox': '도구', 'rec.members': '학회 회원',
    'contact.kicker': '연락처', 'contact.h2': '다음 홍수가 닥치기 전에,<br><em>함께 준비합시다.</em>', 'contact.sub': '학생, 공동연구자, 기관, 언론 관계자 모두 편하게 연락 주세요.',
    'nav.software': '도구 · 데이터', 'nav.teaching': '강의', 'nav.join': '합류',
    'sites.kicker': '물이 있는 곳', 'sites.tour': '홍수 투어', 'map.stop': '정지', 'map.texas': '텍사스', 'map.gulf': '멕시코만', 'map.world': '세계', 'map.close': '닫기',
    'k.physics': '물리', 'k.probability': '빠른 확률 모의', 'k.ai': 'AI', 'k.people': '사람 · 적응',
    'exp.kicker': '인터랙티브', 'exp.empty': '아직 프레임이 없습니다 — explorer.yml 에 이미지를 추가하세요.', 'st.kicker': '연구 이야기',
    'sw.kicker': '오픈 사이언스', 'sw.site': '홈페이지', 'sw.code': '코드', 'sw.docs': '문서', 'sw.paper': '논문', 'sw.materials': '자료',
    'media.play': '영상 재생', 'media.read': '기사 보기', 'preview.tag': '미리보기 — 실제 사이트에서는 숨김 (features.yml)',
    'teach.kicker': '강의', 'teach.courses': '과목', 'teach.exp': '경험', 'teach.new': '신설',
    'join.kicker': '예비 학생', 'join.who': '이런 분을 찾습니다', 'join.projects': '가능한 연구 주제', 'join.culture': '일하는 방식', 'join.email': '이메일 보내기',
    'visits': '방문 {n}회',
    'ideas.ex': '적용 예', 'cv.download': 'CV 다운로드', 'copy': '복사', 'copied': '복사됨', 'foot.top': '맨 위로 ↑'
  } };
  const t = (k, en) => (UI[LANG] && UI[LANG][k] != null) ? UI[LANG][k] : en;
  // YAML: replace X with X_ko (when present) everywhere in the data
  function localize(o) {
    if (Array.isArray(o)) { o.forEach(localize); return o; }
    if (o && typeof o === 'object') {
      for (const k of Object.keys(o)) {
        const m = k.match(/^(.*)_(en|ko)$/);
        if (m) { if (m[2] === LANG && o[k] != null && o[k] !== '') o[m[1]] = o[k]; delete o[k]; }
      }
      Object.values(o).forEach(localize);
    }
    return o;
  }
  function applyLang() {
    document.documentElement.lang = LANG;
    document.querySelectorAll('.lang-switch button').forEach(b => {
      b.setAttribute('aria-pressed', b.dataset.lang === LANG);
      b.addEventListener('click', () => {
        if (b.dataset.lang === LANG) return;
        try { localStorage.setItem('lang', b.dataset.lang); } catch (e) {}
        const u = new URL(location.href); u.searchParams.set('lang', b.dataset.lang); location.replace(u.toString());
      });
    });
    if (LANG === 'en') return;
    const f = document.createElement('link'); f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&family=Noto+Serif+KR:wght@500;600&display=swap';
    document.head.append(f);
    document.querySelectorAll('[data-i18n]').forEach(e => { const v = t(e.dataset.i18n, null); if (v != null) e.innerHTML = v; });
    document.querySelectorAll('[data-i18n-ph]').forEach(e => { const v = t(e.dataset.i18nPh, null); if (v != null) e.placeholder = v; });
  }

  let PILLAR = {};
  const colorOf = name => PILLAR[(name || '').toLowerCase()] || '#38bdf8';
  const initials = n => n.split(/[\s·]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  // ------------------------------------------------------------------ load
  async function load() {
    applyLang();
    if (location.protocol === 'file:') {
      showError('이 페이지는 파일을 직접 열면(file://) 내용을 불러올 수 없습니다.\n폴더에서 터미널을 열고 <code>python -m http.server</code> 실행 후 <code>http://localhost:8000</code> 으로 여세요.\n(Opened as a local file — run a local server; see README.)');
      return;
    }
    if (!window.jsyaml) { showError('js-yaml 라이브러리를 불러오지 못했습니다 (인터넷 연결 확인).'); return; }
    const data = {}, errs = [];
    await Promise.all([...FILES, ...OPTIONAL].map(async f => {
      try {
        const r = await fetch(`content/${f}.yml?v=${Date.now()}`);
        if (!r.ok && OPTIONAL.includes(f)) { data[f] = {}; return; }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        data[f] = localize(jsyaml.load(await r.text()) || {});
      } catch (e) {
        errs.push(`<b>content/${f}.yml</b>: ${esc(e.reason || e.message)}${e.mark ? ` — line ${e.mark.line + 1}, column ${e.mark.column + 1}` : ''}`);
        data[f] = {};
      }
    }));
    if (errs.length) showError('YAML 파일에 오류가 있습니다 (YAML error):\n' + errs.join('\n') + '\n흔한 원인: 들여쓰기(스페이스 2칸), 콜론(:)이 들어간 문장을 따옴표로 감싸지 않음.');
    const safe = (fn, d, name) => { try { fn(d); } catch (e) { console.error(name, e); } };
    safe(renderProfile, data.profile, 'profile');
    safe(renderResearch, data.research, 'research');
    safe(renderIdeas, data.research && data.research.approach, 'ideas');
    safe(renderProjects, data.projects, 'projects');
    safe(renderPubs, data.publications, 'publications');
    safe(renderNews, data.news, 'news');
    safe(renderPeople, data.people, 'people');
    safe(renderHonors, data.honors, 'honors');
    safe(renderGallery, data.gallery, 'gallery');
    const on = applyFeatures(data.features);
    if (on.sites) safe(renderSites, data.sites, 'sites');
    if (on.explorer) safe(renderExplorer, data.explorer, 'explorer');
    if (on.stories) safe(renderStories, data.stories, 'stories');
    if (on.software) safe(renderSoftware, data.software, 'software');
    if (on.media_video) safe(renderMedia, data.media, 'media');
    if (on.teaching) safe(renderTeaching, data.teaching, 'teaching');
    if (on.join) safe(renderJoin, data.join, 'join');
    safe(setupAnalytics, data.features && data.features.analytics, 'analytics');
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
    if (c.cv) ar.append(el('a', { class: 'btn btn-out', href: c.cv, target: '_blank', rel: 'noopener' }, `${icon('doc')}${t('cv.download', 'Download CV')}`));
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
    if (c.email) lines.push(`<div class="cline">${icon('mail')}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a><button class="copy" data-copy="${esc(c.email)}">${t('copy', 'copy')}</button></div>`);
    if (c.email2) lines.push(`<div class="cline">${icon('mail')}<a href="mailto:${esc(c.email2)}">${esc(c.email2)}</a><button class="copy" data-copy="${esc(c.email2)}">${t('copy', 'copy')}</button></div>`);
    if (c.address) lines.push(`<div class="cline">${icon('pin')}<span>${esc(c.address)}</span></div>`);
    const btns = [];
    if (c.cv) btns.push(`<a class="btn btn-light" href="${esc(c.cv)}" target="_blank" rel="noopener">${icon('doc')}CV (PDF${c.cv_updated ? ', ' + esc(c.cv_updated) : ''})</a>`);
    links.forEach(l => btns.push(`<a class="btn btn-ghost" href="${esc(l.url)}" target="_blank" rel="noopener">${icon(l.icon)}${esc(l.label)}</a>`));
    $('#contact-lines').innerHTML = lines.join('') + `<div class="c-btns">${btns.join('')}</div>`;
    document.querySelectorAll('.copy').forEach(b => b.addEventListener('click', () => {
      navigator.clipboard?.writeText(b.dataset.copy).then(() => { b.textContent = t('copied', 'copied'); setTimeout(() => b.textContent = t('copy', 'copy'), 1400); });
    }));
  }

  // ------------------------------------------------------------------ research
  function mediaHTML(m, alt) {
    if (!m) return '';
    if (m.type === 'video') return `<video autoplay muted loop playsinline preload="metadata" poster="${esc(m.poster || '')}" aria-label="${esc(alt)}"><source src="${esc(m.src)}" type="video/mp4"></video>`;
    return `<img src="${esc(m.src)}" alt="${esc(alt)}" loading="lazy">`;
  }
  // DOI links: accepts "10.xxxx/yyy", "doi:10.xxxx/yyy" or "https://doi.org/10.xxxx/yyy"
  function paperLinks(arr) {
    return list(arr).map(x => String(x).trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '')).filter(Boolean)
      .map(d => `<a href="https://doi.org/${esc(d)}" target="_blank" rel="noopener">${icon('doc')} ${esc(d.split('/')[0] === '10.48550' ? 'arXiv' : 'doi')}: ${esc(d.replace(/^10\.\d+\//, ''))}</a>`).join('');
  }
  function renderResearch(r) {
    if (!r) return;
    $('#research-intro').innerHTML = md(r.intro || '');
    const box = $('#themes'); box.innerHTML = '';
    list(r.themes).forEach(t => {
      const c = colorOf(t.pillar);
      const art = el('article', { class: 'theme reveal', id: `theme-${t.id || ''}`, style: { '--accent': c } });
      const gal = list(t.gallery);
      const papers = paperLinks(t.papers);
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
        ${g.length ? `<div class="thumbs">${g.map(x => `<button data-full="${esc(x.src)}" data-cap="${esc(x.caption || '')}" aria-label="Enlarge figure"><img src="${esc(x.src)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
        ${list(a.papers).length ? `<div class="paper-links" style="margin-top:12px;font-size:13px">${paperLinks(a.papers)}</div>` : ''}</div>`;
      also.append(card);
    });
  }

  // ------------------------------------------------------------------ IDEAS (research motto, research.yml → approach)
  function renderIdeas(a) {
    const sec = $('#ideas');
    if (!a || !list(a.steps).length) { sec.remove(); return; }
    if (a.kicker) $('#ideas-kicker').textContent = a.kicker;
    $('#ideas-title').innerHTML = esc(a.title || 'IDEAS').replace('IDEAS', '<span class="ideas-word">IDEAS</span>');
    $('#ideas-intro').innerHTML = md(a.intro || '');
    $('#ideas-credit').innerHTML = md(a.credit || '');
    $('#ideas-steps').innerHTML = list(a.steps).map(s => `
      <li class="reveal" style="--c:${esc(s.color || '#38bdf8')}">
        <span class="L">${esc(s.letter || '')}</span>
        <h3>${esc(s.name || '')}</h3>
        <p>${md(s.text || '')}</p>
        ${s.example ? `<p class="ex"><b>${esc(t('ideas.ex', 'In practice'))}</b>${md(s.example)}</p>` : ''}
      </li>`).join('');
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
      `<div class="pending"><span class="pill">${t('proj.pending', 'Pending')}</span><b>${esc(p.title)}</b> — ${esc(p.sponsor || '')} · ${esc(p.role || '')}${p.amount ? ' · ' + esc(p.amount) : ''}</div>`).join('');
    $('#proj-past').innerHTML = ps.filter(p => p.status === 'past').map(p =>
      `<li><b>${esc(p.title)}</b><span>${esc(p.sponsor || '')} · ${esc(p.role || '')} · ${esc(p.period || '')}</span></li>`).join('');
  }

  // ------------------------------------------------------------------ publications
  function renderPubs(d) {
    const papers = list(d && d.papers).map((p, i) => ({ ...p, _i: i }));
    const me = list(d && d.me);
    // pipeline status: type "inpress" (accepted) or type "submitted" + details: in revision | under review | submitted | in preparation
    const ST = ['in press', 'in revision', 'under review', 'submitted', 'in preparation'];
    const STL = { 'in press': 'In press', 'in revision': 'In revision', 'under review': 'Under review', submitted: 'Submitted', 'in preparation': 'In preparation' };
    const status = p => {
      const ty = String(p.type || '').toLowerCase().replace(/[\s_-]/g, '');
      if (ty === 'inpress' || ty === 'accepted') return 'in press';
      if (ty !== 'submitted') return '';
      const s = String(p.status || p.details || 'under review').toLowerCase().trim();
      if (/press|accept/.test(s)) return 'in press';
      if (/revis|revision/.test(s)) return 'in revision';
      if (/prep/.test(s)) return 'in preparation';
      if (/^submitted/.test(s)) return 'submitted';
      return 'under review';
    };
    papers.forEach(p => { p._st = status(p); });
    const inGroup = (p, k) => k === 'all' ? true : k === 'selected' ? !!p.selected
      : k === 'report' ? (p.type === 'report' || p.type === 'thesis')
      : k === 'inpress' ? p._st === 'in press'
      : k === 'review' ? ['in revision', 'under review', 'submitted'].includes(p._st)
      : k === 'prep' ? p._st === 'in preparation'
      : (!p._st && p.type === k);
    const TYPES = [['all', 'All'], ['selected', 'Selected'], ['journal', 'Journal'], ['conference', 'Proceedings'], ['inpress', 'In press'], ['review', 'In review'], ['prep', 'In preparation'], ['report', 'Reports & thesis']].map(([k, l]) => [k, t('pub.' + k, l)]);
    const count = k => papers.filter(p => inGroup(p, k)).length;
    let filt = 'all', q = '';
    const fbox = $('#pub-filters');
    fbox.innerHTML = TYPES.filter(([k]) => count(k) > 0).map(([k, l]) => `<button class="chip" role="tab" data-k="${k}" aria-selected="${k === filt}">${l}<small>${count(k)}</small></button>`).join('');
    fbox.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      filt = b.dataset.k; fbox.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-selected', x === b)); draw();
    });
    $('#pub-search').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); draw(); });
    const bold = a => { let s = esc(a); me.forEach(n => { s = s.split(esc(n)).join(`<b>${esc(n)}</b>`); }); return s; };
    const LBL = { journal: t('pub.b.journal', 'Journal'), conference: t('pub.b.conference', 'Proceedings'), report: t('pub.b.report', 'Report'), thesis: t('pub.b.thesis', 'Thesis') };
    const stLabel = st => t('st.' + st, STL[st]);
    const stCls = st => 'st-' + st.replace(/\s/g, '');
    function draw() {
      let ps = papers.filter(p => inGroup(p, filt));
      if (q) ps = ps.filter(p => [p.title, p.authors, p.venue, p.year, p._st].join(' ').toLowerCase().includes(q));
      // order: in press → in revision → under review → submitted → in preparation → published by year (desc), file order within each
      const rank = p => p._st ? ST.indexOf(p._st) : 99;
      ps.sort((a, b) => rank(a) - rank(b) || (b.year || 0) - (a.year || 0) || a._i - b._i);
      const groups = [];
      ps.forEach(p => {
        const key = p._st ? stLabel(p._st) : String(p.year || '');
        let g = groups.find(x => x.k === key); if (!g) groups.push(g = { k: key, st: p._st, items: [] }); g.items.push(p);
      });
      $('#pub-list').innerHTML = groups.length ? groups.map(g => `
        <div class="year-group${g.st ? ' st-group ' + stCls(g.st) : ''}"><div class="yr">${esc(g.k)}</div><div>${g.items.map(p => {
          const url = p.url || (p.doi ? `https://doi.org/${p.doi}` : '');
          const showDetails = p.details && (!p._st || p.type === 'inpress');
          return `<div class="pub ${p.selected ? 'sel' : ''}">
            <p class="pub-title">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title)}</p>
            <p class="pub-auth">${bold(p.authors || '')}</p>
            <p class="pub-venue"><i>${esc(p.venue || '')}</i>${showDetails ? `<span>${esc(p.details)}</span>` : ''}
              <span class="badge ${p._st ? stCls(p._st) : esc(p.type)}">${p._st ? esc(stLabel(p._st)) : (LBL[p.type] || esc(p.type || ''))}</span>
              ${p.selected ? `<span class="badge star">${t('pub.b.star', '★ Selected')}</span>` : ''}
              ${p.doi ? `<a class="doi" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>` : ''}</p>
          </div>`; }).join('')}</div></div>`).join('') : `<p class="pub-empty">${t('pub.empty', 'No matching publications.')}</p>`;
    }
    draw();
  }

  // ------------------------------------------------------------------ news
  function renderNews(d) {
    const TAGC = { award: '#fb923c', paper: '#38bdf8', grant: '#2dd4bf', talk: '#a78bfa', media: '#f472b6', service: '#94a3b8' };
    const items = list(d && d.news);
    const SHOW = 6;
    const box = $('#news-list');
    const fmt = s => { const [y, m] = String(s).split('-'); const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; if (LANG === 'ko') return m ? `${y}년 ${+m}월` : `${y}년`; return m ? `${M[+m - 1] || m} ${y}` : y; };
    box.innerHTML = items.map((n, i) => `<li ${i >= SHOW ? 'hidden' : ''} style="--c:${TAGC[n.tag] || '#38bdf8'}"><time>${esc(fmt(n.date))}<span class="ntag">${esc(t('tag.' + n.tag, n.tag || ''))}</span></time><p>${md(n.text)}</p></li>`).join('');
    if (items.length > SHOW) {
      const b = el('button', { class: 'news-more' }, t('news.all', 'Show all {n} →').replace('{n}', items.length));
      b.addEventListener('click', () => { box.querySelectorAll('li[hidden]').forEach(x => x.hidden = false); b.remove(); });
      box.after(b);
    }
  }

  // ------------------------------------------------------------------ people
  function renderPeople(d) {
    if (!d) return;
    $('#mentoring-intro').innerHTML = md(d.mentoring_intro || '');
    // ---- PI card
    const pi = d.pi, card = $('#pi-card');
    if (pi && pi.name) {
      const btns = list(pi.links).map(l => `<a class="btn btn-out" href="${esc(l.url)}" ${/^https?:/.test(l.url) ? 'target="_blank" rel="noopener"' : ''}>${icon(l.icon)}${esc(l.label)}</a>`).join('');
      card.innerHTML = `
        <figure class="pi-photo"><img src="${esc(pi.photo || 'assets/img/profile-portrait.jpg')}" alt="${esc(pi.name)}" loading="lazy"><div class="pillar-bar">${Object.values(PILLAR).map(c => `<span style="--c:${c}"></span>`).join('')}</div></figure>
        <div class="pi-body">
          <span class="pi-kicker">${esc(pi.role || 'Principal Investigator')}</span>
          <h3>${esc(pi.name)}</h3>
          ${list(pi.positions).map(x => `<p class="pi-pos">${md(x)}</p>`).join('')}
          ${pi.bio ? `<p class="pi-bio">${md(pi.bio)}</p>` : ''}
          ${list(pi.background).length ? `<ul class="pi-bg">${list(pi.background).map(b => `<li><span>${esc(b.years || '')}</span><div><b>${esc(b.title || '')}</b>${b.org ? ` — ${esc(b.org)}` : ''}</div></li>`).join('')}</ul>` : ''}
          ${btns ? `<div class="link-row">${btns}</div>` : ''}
        </div>`;
    } else card.remove();
    // ---- groups (Co-advising / Technical advising / Mentees ...)
    let groups = list(d.groups);
    if (!groups.length && list(d.mentees).length) groups = [{ title: 'Mentees', members: d.mentees }];  // old format
    groups = groups.filter(g => list(g.members).length);
    const pal = Object.values(PILLAR);
    $('#people-groups').innerHTML = groups.map((g, gi) => {
      const col = g.color || pal[gi % pal.length] || '#38bdf8';
      const mem = list(g.members);
      const cur = mem.filter(m => m.current !== false), past = mem.filter(m => m.current === false);
      const cardOf = m => `
        <div class="person reveal ${m.current === false ? 'alum' : ''}" style="--c:${esc(col)}">
          ${m.photo ? `<img class="ini" src="${esc(m.photo)}" alt="">` : `<span class="ini">${esc(initials(m.name))}</span>`}
          <div><b>${m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.name)}</a>` : esc(m.name)}</b>
          <span class="r">${esc(m.role || '')}</span>
          ${m.topic ? `<span class="t">${md(m.topic)}</span>` : ''}
          ${(m.years || m.with || m.current === false) ? `<span class="pmeta">${m.current === false ? `<i>${t('team.alumni', 'Alumni')}</i>` : ''}${esc([m.years, m.with ? t('team.with', 'with') + ' ' + m.with : ''].filter(Boolean).join(' · '))}</span>` : ''}</div>
        </div>`;
      return `<section class="pgroup" style="--c:${esc(col)}">
        <div class="pgroup-head"><h3><i></i>${esc(g.title || '')}<small>${mem.length}</small></h3>${g.note ? `<p>${md(g.note)}</p>` : ''}</div>
        <div class="people-grid">${cur.map(cardOf).join('')}${past.map(cardOf).join('')}</div>
      </section>`;
    }).join('');
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
      + (list(d.memberships).length ? `<li><b>${t('rec.members', 'Memberships')}</b>${list(d.memberships).map(esc).join(' · ')}</li>` : '');
    $('#skills').innerHTML = list(d.skills).map(g => `<div class="skill-g"><b>${esc(g.group)}</b>${list(g.items).map(i => `<span>${esc(i)}</span>`).join('')}</div>`).join('');
  }

  // ------------------------------------------------------------------ gallery
  let GAL = [], galView = [], galIdx = -1;
  function renderGallery(d) {
    const sec = $('#gallery');
    const photos = list(d && d.photos).filter(p => p && p.src);
    if (!photos.length) { sec.remove(); $('#nav-gallery')?.remove(); return; }
    if (d.title) $('#gal-title').textContent = d.title;
    $('#gal-intro').innerHTML = md(d.intro || '');
    const catColor = {}; list(d.categories).forEach(c => { if (c && c.name) catColor[c.name] = c.color; });
    const pal = ['#a78bfa', '#38bdf8', '#2dd4bf', '#fb923c', '#f472b6', '#facc15'];
    const order = list(d.categories).map(c => c.name);
    photos.forEach((p, i) => p._i = i);
    // newest first (date "YYYY", "YYYY-MM" or "YYYY-MM-DD"); undated keep file order at end
    photos.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || a._i - b._i);
    const cats = [...new Set(photos.map(p => p.category).filter(Boolean))].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
    cats.forEach((c, i) => { if (!catColor[c]) catColor[c] = pal[i % pal.length]; });
    const PAGE = Number(d.show || 12);
    let filt = 'All', shown = PAGE;
    const fbox = $('#gal-filters');
    const chips = ['All', ...cats];
    fbox.innerHTML = chips.length > 2 || cats.length > 1 ? chips.map(c => `<button class="chip" role="tab" data-c="${esc(c)}" aria-selected="${c === filt}" ${c !== 'All' ? `style="--c:${esc(catColor[c])}"` : ''}>${esc(c === 'All' ? t('gal.all', 'All') : c)}<small>${c === 'All' ? photos.length : photos.filter(p => p.category === c).length}</small></button>`).join('') : '';
    fbox.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      filt = b.dataset.c; shown = PAGE; fbox.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-selected', x === b)); draw();
    });
    const more = $('#gal-more');
    more.addEventListener('click', () => { shown += PAGE; draw(); });
    const fmt = s => { if (!s) return ''; const [y, m] = String(s).split('-'); const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; if (LANG === 'ko') return m ? `${y}년 ${+m}월` : `${y}년`; return m ? `${M[+m - 1] || m} ${y}` : y; };
    GAL = photos.map(p => ({ src: p.src, cap: [p.title, p.caption, [fmt(p.date), p.place].filter(Boolean).join(' · ')].filter(Boolean).join(' — ') }));
    function draw() {
      const list_ = photos.filter(p => filt === 'All' || p.category === filt);
      galView = list_.map(p => photos.indexOf(p));
      $('#gal-grid').innerHTML = list_.slice(0, shown).map((p, k) => `
        <figure class="gal-item" data-gal="${k}" tabindex="0" style="--c:${esc(catColor[p.category] || '#38bdf8')}">
          <img src="${esc(p.src)}" alt="${esc(p.title || p.caption || '')}" loading="lazy">
          <figcaption>
            ${p.category ? `<span class="gal-cat">${esc(p.category)}</span>` : ''}
            ${p.title ? `<b>${esc(p.title)}</b>` : ''}
            <span class="gal-meta">${esc([fmt(p.date), p.place].filter(Boolean).join(' · '))}</span>
          </figcaption>
        </figure>`).join('');
      more.hidden = list_.length <= shown;
    }
    draw();
    $('#gal-grid').addEventListener('click', e => { const f = e.target.closest('.gal-item'); if (f) openGal(+f.dataset.gal); });
    $('#gal-grid').addEventListener('keydown', e => { const f = e.target.closest('.gal-item'); if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openGal(+f.dataset.gal); } });
  }
  function showGal(k) {
    const n = galView.length; galIdx = (k + n) % n;
    const p = GAL[galView[galIdx]];
    $('#lb-img').src = p.src; $('#lb-cap').textContent = `${p.cap}${n > 1 ? `   (${galIdx + 1}/${n})` : ''}`;
  }
  function openGal(k) {
    showGal(k);
    const multi = galView.length > 1;
    document.querySelectorAll('.lb-nav').forEach(b => b.hidden = !multi);
    $('#lightbox').classList.add('photo'); $('#lightbox').showModal();
  }

  // ------------------------------------------------------------------ features (show / hide / preview)
  const doiUrl = d => !d ? '' : /^https?:/.test(d) ? d : `https://doi.org/${d}`;
  const KCOL = { physics: '#38bdf8', probability: '#2dd4bf', ai: '#a78bfa', people: '#fb923c' };
  function applyFeatures(f) {
    const sec = (f && f.sections) || {};
    const on = {};
    document.querySelectorAll('[data-feature]').forEach(e => {
      const k = e.dataset.feature, live = sec[k] === true;
      on[k] = live || PREVIEW;
      e.hidden = !on[k];
      if (!live && PREVIEW && e.tagName === 'SECTION') {
        e.classList.add('is-preview');
        e.prepend(el('div', { class: 'preview-tag' }, esc(t('preview.tag', 'Preview — hidden on the live site (features.yml)'))));
      }
      if (!live && PREVIEW && e.id === 'media-feature') e.classList.add('is-preview');
    });
    return on;
  }

  // ------------------------------------------------------------------ study-sites map
  function renderSites(d) {
    $('#sites-title').textContent = d.title || 'From the ocean to the hills';
    $('#sites-intro').innerHTML = md(d.intro || '');
    const box = $('#site-map');
    if (!window.L) { box.innerHTML = '<p class="map-fallback">Map library failed to load.</p>'; return; }
    const views = d.views || { texas: { center: [29.3, -97.4], zoom: 6 } };
    const startKey = d.start && views[d.start] ? d.start : Object.keys(views)[0];
    const map = L.map(box, { scrollWheelZoom: false, worldCopyJump: true, zoomSnap: 0.25, attributionControl: true })
      .setView(views[startKey].center, views[startKey].zoom);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
    }).addTo(map);
    box.addEventListener('click', () => map.scrollWheelZoom.enable(), { once: true });

    // flowing water lines (coast, rivers)
    list(d.paths).forEach(pth => {
      const c = KCOL[pth.kind] || '#38bdf8';
      L.polyline(pth.points, { color: c, weight: 9, opacity: .16, interactive: false }).addTo(map);
      L.polyline(pth.points, { color: c, weight: 2.6, opacity: .95, dashArray: '3 13', lineCap: 'round', className: 'flow-line' })
        .bindTooltip(esc(pth.name || ''), { sticky: true, className: 'map-tip' }).addTo(map);
    });

    // ripple markers
    const card = $('#map-card');
    const sites = list(d.sites);
    const markers = sites.map((st, i) => {
      const c = KCOL[st.kind] || '#38bdf8', sz = Math.max(1, Math.min(3, +st.size || 2));
      const px = 14 + sz * 8;
      const icon = L.divIcon({
        className: 'rp-wrap', iconSize: [px * 3, px * 3], iconAnchor: [px * 1.5, px * 1.5],
        html: `<span class="rp dry" style="--c:${c};--px:${px}px;--d:${(i % 5) * .45}s"><i></i><i></i><i></i><b></b></span>`
      });
      const m = L.marker([st.lat, st.lon], { icon, title: st.name, keyboard: true, riseOnHover: true }).addTo(map);
      m.bindTooltip(`<b>${esc(st.name)}</b> · ${esc(st.year || '')}`, { direction: 'top', offset: [0, -px * .6], className: 'map-tip' });
      m.on('click', () => { stopTour(); show(st, true); });
      return m;
    });
    function show(st, fly) {
      const c = KCOL[st.kind] || '#38bdf8', url = st.url || doiUrl(st.doi);
      card.style.setProperty('--c', c);
      card.innerHTML = `<button class="mc-x" type="button" aria-label="${esc(t('map.close', 'Close'))}">×</button>
        ${st.image ? `<div class="mc-img" data-full="${esc(st.image)}" data-cap="${esc(st.title || '')}"><img src="${esc(st.image)}" alt="" loading="lazy"></div>` : ''}
        <div class="mc-body"><p class="mc-k"><span>${esc(st.year || '')}</span> ${esc(st.name || '')}</p>
        <h3>${esc(st.title || '')}</h3><p>${md(st.text || '')}</p>
        ${st.stat ? `<p class="mc-stat">${esc(st.stat)}</p>` : ''}
        ${url ? `<a class="mc-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(t('sw.paper', 'Paper'))} ↗</a>` : ''}</div>`;
      card.hidden = false;
      card.querySelector('.mc-x').onclick = () => { card.hidden = true; stopTour(); };
      if (fly) {
        const far = Math.abs(st.lon + 95) > 25 || Math.abs(st.lat - 29) > 12;
        map.flyTo([st.lat, st.lon], far ? 5 : (st.size >= 3 ? 7.5 : 8), { duration: 1.6 });
      }
    }

    // view buttons
    const vb = $('#map-views');
    vb.innerHTML = Object.keys(views).map(k => `<button type="button" data-v="${esc(k)}" aria-pressed="${k === startKey}">${esc(t('map.' + k, k[0].toUpperCase() + k.slice(1)))}</button>`).join('');
    vb.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      stopTour(); card.hidden = true;
      vb.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      const v = views[b.dataset.v]; map.flyTo(v.center, v.zoom, { duration: 1.4 });
    });

    // legend
    const used = [...new Set(sites.map(s => s.kind))];
    $('#map-legend').innerHTML = used.map(k => `<span style="--c:${KCOL[k] || '#38bdf8'}">${esc(t('k.' + k, { physics: 'Physics', probability: 'Fast & probabilistic', ai: 'AI', people: 'People & adaptation' }[k] || k))}</span>`).join('');

    // flood tour: ocean → hills
    const order = sites.map((s, i) => ({ s, i })).sort((a, b) => (+a.s.order || 99) - (+b.s.order || 99));
    let tour = null, step = 0;
    const tb = $('#map-tour');
    function stopTour() { if (tour) { clearTimeout(tour); tour = null; } tb.classList.remove('on'); tb.querySelector('.tour-ic').textContent = '▶'; }
    function next() {
      if (step >= order.length) { stopTour(); const v = views[startKey]; map.flyTo(v.center, v.zoom, { duration: 1.6 }); return; }
      const { s, i } = order[step++]; show(s, true);
      const ic = markers[i].getElement(); if (ic) { const r = ic.querySelector('.rp'); r.classList.remove('hit'); void r.offsetWidth; r.classList.add('hit'); }
      tour = setTimeout(next, 5200);
    }
    tb.addEventListener('click', () => {
      if (tour) return stopTour();
      tb.classList.add('on'); tb.querySelector('.tour-ic').textContent = '■'; step = 0;
      vb.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', false));
      if (map.getZoom() > 3) { map.flyTo([24, -20], 2, { duration: 1.2 }); tour = setTimeout(next, 1300); } else next();
    });

    // "rising water": ripples fill in one by one when the map scrolls into view
    const wet = () => markers.forEach((m, i) => setTimeout(() => { const e = m.getElement(); e && e.querySelector('.rp').classList.replace('dry', 'wet'); }, 140 * i));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { wet(); io.disconnect(); } }, { threshold: .35 });
      io.observe(box);
    } else wet();
    setTimeout(() => map.invalidateSize(), 300);
  }

  // ------------------------------------------------------------------ flood explorer (scrub through time)
  function renderExplorer(d) {
    $('#exp-title').textContent = d.title || 'Flood explorer';
    $('#exp-intro').innerHTML = md(d.intro || '');
    const sc = list(d.scenarios); if (!sc.length) return;
    const tabs = $('#exp-tabs'), stage = $('#exp-stage'), rng = $('#exp-range'), play = $('#exp-play');
    let cur = null, timer = null;
    tabs.innerHTML = sc.map((s, i) => `<button class="chip" role="tab" data-i="${i}" aria-selected="${i === 0}">${esc(s.name)}</button>`).join('');
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } if (cur && cur.v) cur.v.pause(); play.textContent = '▶'; };
    function loadSc(i) {
      stop(); const s = sc[i]; rng.value = 0;
      $('#exp-start').textContent = s.start_label || ''; $('#exp-end').textContent = s.end_label || '';
      $('#exp-cap').innerHTML = md(s.caption || '') + (s.legend ? ` <span class="exp-legend">${esc(s.legend)}</span>` : '');
      if (s.type === 'video') {
        stage.innerHTML = `<video muted playsinline preload="metadata" src="${esc(s.src)}"></video>`;
        const v = stage.querySelector('video');
        v.addEventListener('timeupdate', () => { if (v.duration) rng.value = Math.round(1000 * v.currentTime / v.duration); });
        v.addEventListener('ended', () => { play.textContent = '▶'; });
        cur = { v };
      } else {
        const fr = list(s.frames);
        if (!fr.length) { stage.innerHTML = `<div class="exp-empty">${esc(t('exp.empty', 'No frames yet — add images in explorer.yml.'))}</div>`; cur = { fr: [] }; return; }
        stage.innerHTML = fr.map((f, k) => `<img src="${esc(f.src)}" alt="" ${k ? 'loading="lazy"' : ''} class="${k ? '' : 'on'}">`).join('') + `<span class="exp-t" id="exp-t">${esc(fr[0].label || '')}</span>`;
        cur = { fr };
      }
    }
    function seek(val) {
      if (!cur) return;
      if (cur.v) { if (cur.v.duration) cur.v.currentTime = cur.v.duration * val / 1000; return; }
      if (!cur.fr.length) return;
      const k = Math.min(cur.fr.length - 1, Math.floor(val / 1000 * cur.fr.length));
      stage.querySelectorAll('img').forEach((im, j) => im.classList.toggle('on', j === k));
      const lab = $('#exp-t'); if (lab) lab.textContent = cur.fr[k].label || '';
    }
    rng.addEventListener('input', () => { stop(); seek(+rng.value); });
    play.addEventListener('click', () => {
      if (!cur) return;
      if (cur.v) { if (cur.v.paused) { if (+rng.value >= 999) cur.v.currentTime = 0; cur.v.play(); play.textContent = '❚❚'; } else stop(); return; }
      if (timer) return stop();
      if (!cur.fr.length) return;
      play.textContent = '❚❚';
      timer = setInterval(() => { let v = +rng.value + Math.ceil(1000 / cur.fr.length); if (v > 1000) v = 0; rng.value = v; seek(v); }, 700);
    });
    tabs.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      tabs.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-selected', x === b)); loadSc(+b.dataset.i);
    });
    loadSc(0);
  }

  // ------------------------------------------------------------------ research stories
  function renderStories(d) {
    $('#stories-title').textContent = d.title || 'Research stories';
    $('#stories-intro').innerHTML = md(d.intro || '');
    $('#story-grid').innerHTML = list(d.stories).map(s => {
      const url = s.url || doiUrl(s.doi);
      return `<article class="story reveal" style="--c:${esc(s.color || '#38bdf8')}">
        ${s.image ? `<div class="story-img" data-full="${esc(s.image)}" data-cap="${esc(s.title)}"><img src="${esc(s.image)}" alt="" loading="lazy"></div>` : '<div class="story-band"></div>'}
        <div class="story-body"><p class="story-num">${esc(s.number || '')}</p><p class="story-lab">${esc(s.label || '')}</p>
        <h3>${esc(s.title || '')}</h3><p>${md(s.text || '')}</p>
        <p class="story-venue">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(s.venue || 'Paper')} ↗</a>` : esc(s.venue || '')}</p></div></article>`;
    }).join('');
  }

  // ------------------------------------------------------------------ software & data
  function renderSoftware(d) {
    $('#sw-title').textContent = d.title || 'Software & data';
    $('#sw-intro').innerHTML = md(d.intro || '');
    const btn = (href, label, ic) => href ? `<a class="sw-btn" href="${esc(href)}" target="_blank" rel="noopener">${ic ? icon(ic) : ''}${esc(label)}</a>` : '';
    const mo = d.models || {};
    $('#sw-models-title').textContent = mo.title || '';
    $('#sw-models').innerHTML = list(mo.items).map(m => `<article class="sw-card reveal">
        <header><h4>${esc(m.name)}</h4><span class="sw-by">${esc(m.by || '')}</span></header>
        <p class="sw-tag">${esc(m.tag || '')}</p>${m.use ? `<p class="sw-use">${md(m.use)}</p>` : ''}
        <div class="sw-links">${btn(m.site, t('sw.site', 'Website'), 'link')}${btn(m.code, t('sw.code', 'Code'), 'github')}${btn(m.docs, t('sw.docs', 'Docs'), 'doc')}${m.doi ? btn(doiUrl(m.doi), 'DOI', '') : ''}</div></article>`).join('');
    const tr = d.training || {};
    $('#sw-train-title').textContent = tr.title || '';
    $('#sw-train').innerHTML = list(tr.items).map(x => `<li><b>${esc(x.title)}</b><span class="sw-where">${esc(x.where || '')}</span><p>${md(x.text || '')}</p>${x.materials ? btn(x.materials, t('sw.materials', 'Materials'), 'doc') : ''}</li>`).join('');
    const da = d.data || {};
    $('#sw-data-title').textContent = da.title || '';
    $('#sw-data').innerHTML = list(da.items).map(x => `<li><span class="sw-type">${esc(x.type || '')}</span><b>${esc(x.title)}</b><span class="sw-where">${esc(x.authors || '')}</span>
      <div class="sw-links">${x.doi ? btn(doiUrl(x.doi), /zenodo/.test(x.doi) ? 'Zenodo' : 'DOI', '') : ''}${x.paper ? btn(doiUrl(x.paper), x.paper_label || t('sw.paper', 'Paper'), 'doc') : ''}</div></li>`).join('');
  }

  // ------------------------------------------------------------------ featured media (click-to-load video)
  function renderMedia(d) {
    const items = list(d && d.featured); const box = $('#media-feature');
    if (!items.length) { box.hidden = true; return; }
    box.innerHTML = items.map((m, i) => `<article class="media-card reveal">
      <div class="media-vid" data-i="${i}">
        <button class="media-poster" type="button" style="background-image:url('${esc(m.poster || '')}')" aria-label="${esc(t('media.play', 'Play video'))}">
          <span class="media-play">▶</span><span class="media-brand">${esc((m.kicker || '').split('·').pop().trim())}</span></button></div>
      <div class="media-body"><p class="kicker">${esc(m.kicker || '')}</p><h3>${esc(m.title || '')}</h3>
        <p>${md(m.text || '')}</p>${m.quote ? `<blockquote>“${esc(m.quote)}”</blockquote>` : ''}
        <p class="media-links">${m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(t('media.read', 'Read the story'))} ↗</a>` : ''}${m.also ? `<span>${esc(m.also)}</span>` : ''}</p></div></article>`).join('');
    box.addEventListener('click', e => {
      const b = e.target.closest('.media-poster'); if (!b) return;
      const w = b.parentElement, m = items[+w.dataset.i];
      w.innerHTML = `<iframe src="${esc(m.embed)}" title="${esc(m.title || 'video')}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    });
  }

  // ------------------------------------------------------------------ teaching
  function renderTeaching(d) {
    $('#teach-title').textContent = d.title || 'Teaching';
    $('#teach-phil').innerHTML = md(d.philosophy || '');
    $('#teach-principles').innerHTML = list(d.principles).map((p, i) => `<div class="tp reveal" style="--c:${['#38bdf8', '#2dd4bf', '#a78bfa', '#fb923c'][i % 4]}"><h4>${esc(p.title)}</h4><p>${md(p.text || '')}</p></div>`).join('');
    const lv = [...new Set(list(d.courses).map(c => c.level))];
    $('#teach-courses').innerHTML = lv.map(l => `<p class="course-lv">${esc(l)}</p>` + list(d.courses).filter(c => c.level === l).map(c =>
      `<div class="course"><b>${esc(c.name)}${c.new ? ` <span class="badge st-inpress">${esc(t('teach.new', 'New'))}</span>` : ''}</b><span>${md(c.text || '')}</span>${c.syllabus ? `<a href="${esc(c.syllabus)}" target="_blank" rel="noopener">Syllabus ↗</a>` : ''}</div>`).join('')).join('');
    $('#teach-exp').innerHTML = list(d.experience).map(x => `<li>${md(x)}</li>`).join('');
  }

  // ------------------------------------------------------------------ join the lab
  function renderJoin(d) {
    $('#join-title').textContent = d.title || 'Join the lab';
    $('#join-status').textContent = d.status || ''; $('#join-status').hidden = !d.status;
    $('#join-intro').innerHTML = md(d.intro || '');
    $('#join-who').innerHTML = list(d.looking_for).map(x => `<div class="jw"><h4>${esc(x.title)}</h4><p>${md(x.text || '')}</p></div>`).join('');
    $('#join-proj').innerHTML = list(d.projects).map(x => `<li>${md(x)}</li>`).join('');
    $('#join-culture').innerHTML = list(d.culture).map(x => `<p><b>${esc(x.title)}</b> — ${md(x.text || '')}</p>`).join('');
    const a = d.apply || {};
    $('#join-apply').innerHTML = `<p>${md(a.text || '')}</p>${a.email ? `<a class="btn btn-sm" href="mailto:${esc(a.email)}?subject=${encodeURIComponent(a.subject || '')}">${icon('mail')} ${esc(t('join.email', 'Email me'))}</a>` : ''}`;
  }

  // ------------------------------------------------------------------ visit statistics (GoatCounter, cookie-free)
  function setupAnalytics(a) {
    const code = a && String(a.goatcounter || '').trim();
    if (!code || PREVIEW || /^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname)) return;
    const base = `https://${encodeURIComponent(code)}.goatcounter.com`;
    const sc = document.createElement('script');
    sc.async = true; sc.src = 'https://gc.zgo.at/count.js'; sc.dataset.goatcounter = `${base}/count`;
    document.body.append(sc);
    if (a.show_counter) {
      fetch(`${base}/counter/TOTAL.json`).then(r => r.ok ? r.json() : null).then(j => {
        if (!j || j.count == null) return;
        const e = $('#visit-count'); e.textContent = t('visits', '{n} visits').replace('{n}', String(j.count).trim()); e.hidden = false;
      }).catch(() => {});
    }
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
    galIdx = -1; document.querySelectorAll('.lb-nav').forEach(b => b.hidden = true); lb.classList.remove('photo');
    lb.showModal();
  });
  lb.addEventListener('click', e => {
    if (e.target.classList.contains('lb-prev')) return showGal(galIdx - 1);
    if (e.target.classList.contains('lb-next')) return showGal(galIdx + 1);
    if (e.target === lb || e.target.classList.contains('lb-close')) lb.close();
  });
  lb.addEventListener('keydown', e => {
    if (galIdx < 0) return;
    if (e.key === 'ArrowLeft') showGal(galIdx - 1);
    if (e.key === 'ArrowRight') showGal(galIdx + 1);
  });
  let tx = null;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (galIdx < 0 || tx === null) return;
    const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) showGal(galIdx + (dx < 0 ? 1 : -1));
  });

  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }

  load();
})();
