const state = {
  locale: localStorage.getItem('stats-locale') || 'th',
  contentIndex: [],
  reviewIndex: [],
  advancedIndex: [],
  toolIndex: [],
  bookmarks: JSON.parse(localStorage.getItem('stats-bookmarks') || '[]'),
};

const selectors = {
  lessonGrid: document.getElementById('lesson-grid'),
  reviewLinks: document.getElementById('review-links'),
  advancedLinks: document.getElementById('advanced-links'),
  toolLinks: document.getElementById('tool-links'),
  printCurrent: document.getElementById('print-current'),
  installPwa: document.getElementById('install-pwa'),
  toggleLang: document.getElementById('i18n-toggle'),
};

async function loadContentIndex() {
  const response = await fetch('content/index.json');
  const index = await response.json();
  state.contentIndex = index.lessons;
  state.reviewIndex = index.review;
  state.advancedIndex = index.advanced;
  state.toolIndex = index.tools;
  renderIndex();
  window.dispatchEvent(new CustomEvent('index:loaded', { detail: index }));
}

function createLessonCard(entry) {
  const article = document.createElement('article');
  article.className = 'card lesson-card';
  article.innerHTML = `
    <header>
      <p class="eyebrow">${entry.number}</p>
      <h3>${entry.title}</h3>
    </header>
    <p>${entry.summary}</p>
    <footer>
      <a class="primary" href="${entry.href}">เปิดบทเรียน</a>
      <button data-action="bookmark" data-href="${entry.href}">
        ${state.bookmarks.includes(entry.href) ? '★' : '☆'}
      </button>
    </footer>
  `;
  article.querySelector('button').addEventListener('click', () => toggleBookmark(entry.href));
  return article;
}

function createListLink(entry) {
  const li = document.createElement('li');
  li.innerHTML = `<a class="card" href="${entry.href}"><strong>${entry.title}</strong><span>${entry.summary}</span></a>`;
  return li;
}

function createToolCard(entry) {
  const card = document.createElement('a');
  card.className = 'card tool-card';
  card.href = entry.href;
  card.innerHTML = `
    <header>
      <h3>${entry.title}</h3>
    </header>
    <p>${entry.summary}</p>
    <p class="tagline">${entry.tags.join(', ')}</p>
  `;
  return card;
}

function renderIndex() {
  if (selectors.lessonGrid) {
    selectors.lessonGrid.innerHTML = '';
    state.contentIndex.forEach(entry => selectors.lessonGrid.appendChild(createLessonCard(entry)));
  }
  if (selectors.reviewLinks) {
    selectors.reviewLinks.innerHTML = '';
    state.reviewIndex.forEach(entry => selectors.reviewLinks.appendChild(createListLink(entry)));
  }
  if (selectors.advancedLinks) {
    selectors.advancedLinks.innerHTML = '';
    state.advancedIndex.forEach(entry => selectors.advancedLinks.appendChild(createListLink(entry)));
  }
  if (selectors.toolLinks) {
    selectors.toolLinks.innerHTML = '';
    state.toolIndex.forEach(entry => selectors.toolLinks.appendChild(createToolCard(entry)));
  }
}

function toggleBookmark(href) {
  if (state.bookmarks.includes(href)) {
    state.bookmarks = state.bookmarks.filter(item => item !== href);
  } else {
    state.bookmarks.push(href);
  }
  localStorage.setItem('stats-bookmarks', JSON.stringify(state.bookmarks));
  renderIndex();
}

function handlePrint() {
  window.print();
}

function setupNavigationButtons() {
  const prev = document.querySelector('[data-prev]');
  const next = document.querySelector('[data-next]');
  const print = document.getElementById('print-current');
  if (prev) {
    prev.addEventListener('click', () => { window.location.href = prev.dataset.prev; });
  }
  if (next) {
    next.addEventListener('click', () => { window.location.href = next.dataset.next; });
  }
  if (print) {
    print.addEventListener('click', handlePrint);
  }
}

function setupPwaInstall() {
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    selectors.installPwa?.classList.add('visible');
  });
  selectors.installPwa?.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome !== 'accepted') {
      console.log('PWA install dismissed');
    }
    deferredPrompt = null;
  });
}

function toggleLanguage() {
  state.locale = state.locale === 'th' ? 'en' : 'th';
  localStorage.setItem('stats-locale', state.locale);
  document.documentElement.lang = state.locale;
  window.dispatchEvent(new CustomEvent('i18n:change', { detail: { locale: state.locale } }));
}

function initLanguage() {
  document.documentElement.lang = state.locale;
  selectors.toggleLang?.addEventListener('click', toggleLanguage);
  window.dispatchEvent(new CustomEvent('i18n:change', { detail: { locale: state.locale } }));
}

document.addEventListener('DOMContentLoaded', () => {
  loadContentIndex();
  setupNavigationButtons();
  setupPwaInstall();
  initLanguage();
});

window.addEventListener('i18n:ready', renderIndex);


// === UX Enhancements ===
(function(){
  const themeLink = document.getElementById('theme-link') || document.querySelector('link[href*="light.css"]');
  function toggleTheme(){
    if(!themeLink) return;
    const href = themeLink.getAttribute('href');
    if(href.includes('light.css')){
      themeLink.setAttribute('href', href.replace('light.css','theme-high-contrast.css'));
      localStorage.setItem('stats-theme','hc');
    } else {
      themeLink.setAttribute('href', href.replace('theme-high-contrast.css','light.css'));
      localStorage.setItem('stats-theme','light');
    }
  }
  // restore theme
  (function(){
    try{
      const pref = localStorage.getItem('stats-theme');
      if(themeLink && pref==='hc' && themeLink.getAttribute('href').includes('light.css')){
        themeLink.setAttribute('href', themeLink.getAttribute('href').replace('light.css','theme-high-contrast.css'));
      }
    }catch(e){}
  })();

  function buildTOC(){
    const toc = document.getElementById('auto-toc');
    if(!toc) return;
    const main = document.querySelector('main') || document.getElementById('main');
    if(!main) return;
    const heads = Array.from(main.querySelectorAll('h2, h3'));
    toc.innerHTML = '';
    heads.forEach((h,i)=>{
      if(!h.id){
        h.id = (h.textContent||'sec-'+i).trim().toLowerCase().replace(/[^a-z0-9ก-๙]+/g,'-');
      }
      const a = document.createElement('a');
      a.href = '#'+h.id;
      a.textContent = h.textContent;
      if(h.tagName.toLowerCase()==='h3'){ a.style.paddingLeft = '1rem'; }
      toc.appendChild(a);
    });
    // Active highlight on scroll
    const links = Array.from(toc.querySelectorAll('a'));
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          links.forEach(l=>l.classList.toggle('active', l.getAttribute('href')==='#'+e.target.id));
        }
      });
    }, {rootMargin: '0px 0px -70% 0px', threshold: .1});
    heads.forEach(h=>obs.observe(h));
  }

  function initProgress(){
    const bar = document.querySelector('#progressbar>span');
    if(!bar) return;
    const onScroll = ()=>{
      const el = document.scrollingElement || document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const pct = max>0 ? (el.scrollTop/max)*100 : 0;
      bar.style.width = pct.toFixed(2)+'%';
    };
    document.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  function initShortcuts(){
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'p' || e.key === 'P'){ const btn = document.getElementById('print-current'); btn && btn.click(); }
      if(e.key === 't' || e.key === 'T'){ const btn = document.getElementById('theme-toggle'); btn && btn.click(); }
      if(e.key === '['){ const prev = document.querySelector('.prev-next a.prev'); if(prev) { e.preventDefault(); location.href = prev.getAttribute('href'); } }
      if(e.key === ']'){ const next = document.querySelector('.prev-next a.next'); if(next) { e.preventDefault(); location.href = next.getAttribute('href'); } }
      if(e.key === '/'){ const srch = document.getElementById('search-input'); if(srch){ e.preventDefault(); srch.focus(); } }
    });
  }

  function initHeaderActions(){
    const themeBtn = document.getElementById('theme-toggle');
    if(themeBtn) themeBtn.addEventListener('click', toggleTheme);
    const printBtn = document.getElementById('print-current');
    if(printBtn) printBtn.addEventListener('click', ()=>window.print());
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    buildTOC();
    initProgress();
    initShortcuts();
    initHeaderActions();
  });
})();



// Mark this lesson as visited when loaded
(function(){
  try{
    var key = 'stats-visited';
    var href = location.pathname.split('/').slice(-2).join('/'); // content/NN-xxx.html
    var set = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
    set.add(href);
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  }catch(e){}
})();



// === Visited log + Continue Learning support ===
(function(){
  try{
    var isLesson = location.pathname.includes('/content/');
    if(isLesson){
      var hrefParts = location.pathname.split('/');
      var href = hrefParts.slice(-2).join('/'); // content/NN-xxx.html
      var title = document.title || href;
      var now = Date.now();

      // Set 'visited' set
      var key = 'stats-visited';
      var set = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
      set.add(href);
      localStorage.setItem(key, JSON.stringify(Array.from(set)));

      // Append to 'visited-log' (keep last 100)
      var logKey = 'stats-visited-log';
      var log = JSON.parse(localStorage.getItem(logKey) || '[]');
      log.push({ href: href, title: title, ts: now });
      if (log.length > 100) log = log.slice(-100);
      localStorage.setItem(logKey, JSON.stringify(log));

      // Save last lesson shortcut
      localStorage.setItem('stats-last-lesson', JSON.stringify({ href: href, title: title, ts: now }));
    }
  }catch(e){}
})();

// === Index-only enhancements ===
(function(){
  if(!location.pathname.endsWith('/index.html') && !location.pathname.match(/\/$/)) return;
  const q = document.getElementById('q');
  const grid = document.getElementById('lesson-grid');
  if(!grid) return;
  const cards = Array.from(grid.querySelectorAll('.lesson.card'));
  const stat = document.getElementById('stat-count');
  const readCount = document.getElementById('read-count');
  const unreadCount = document.getElementById('unread-count');
  const filters = Array.from(document.querySelectorAll('.filter-btn'));
  const sortSel = document.getElementById('sort');
  const visitedKey = 'stats-visited';
  const logKey = 'stats-visited-log';
  const lastKey = 'stats-last-lesson';

  // Restore search term
  try {
    const qSaved = localStorage.getItem('stats-q');
    if(qSaved && q) q.value = qSaved;
  } catch(e){}

  function getVisitedSet(){ try { return new Set(JSON.parse(localStorage.getItem(visitedKey) || '[]')); } catch(e){ return new Set(); } }
  function getVisitedLog(){ try { return JSON.parse(localStorage.getItem(logKey) || '[]'); } catch(e){ return []; } }
  function getLast(){ try { return JSON.parse(localStorage.getItem(lastKey) || 'null'); } catch(e){ return null; } }

  function markVisited(){
    const visited = getVisitedSet();
    cards.forEach(card => {
      const href = card.getAttribute('href');
      const pill = card.querySelector('.visited-pill');
      if (visited.has(href)) { pill && (pill.hidden = false); } else { pill && (pill.hidden = true); }
    });
    if (readCount && unreadCount){
      readCount.textContent = visited.size;
      unreadCount.textContent = Math.max(0, cards.length - visited.size);
    }
  }

  function highlight(term, el){
    function unmark(node){
      node.querySelectorAll('mark.search-hit').forEach(m=>{
        const t = document.createTextNode(m.textContent);
        m.replaceWith(t);
      });
    }
    unmark(el);
    if(!term) return;
    const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
    el.childNodes.forEach(n=>{
      if(n.nodeType===3){
        const frag = document.createDocumentFragment();
        let last = 0, m;
        const text = n.nodeValue;
        while((m = rx.exec(text))){
          const prev = text.slice(last, m.index);
          if(prev) frag.appendChild(document.createTextNode(prev));
          const mark = document.createElement('mark');
          mark.className = 'search-hit';
          mark.textContent = m[0];
          frag.appendChild(mark);
          last = m.index + m[0].length;
        }
        frag.appendChild(document.createTextNode(text.slice(last)));
        n.replaceWith(frag);
      } else if(n.nodeType===1){
        highlight(term, n);
      }
    });
  }

  function applyFilter(){
    const term = (q && q.value ? q.value.trim().toLowerCase() : '');
    try { localStorage.setItem('stats-q', term); } catch(e){}
    const activeTags = new Set(filters.filter(b => b.getAttribute('aria-pressed')==='true').map(b => b.dataset.filter));
    let shown = 0;
    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const tags = (card.dataset.tags || '').toLowerCase();
      const file = card.textContent.toLowerCase();
      const matchText = !term || title.includes(term) || tags.includes(term) || file.includes(term);
      const matchTag = activeTags.size===0 || Array.from(activeTags).some(t => tags.includes(t) || title.includes(t));
      const show = matchText && matchTag;
      card.style.display = show ? '' : 'none';
      if(show){
        shown++;
        // highlight
        const titleEl = card.querySelector('.lesson-title');
        if(titleEl) highlight(term, titleEl);
        // tags row
        const tagRow = card.querySelector('.tag-row');
        if(tagRow && tagRow.childElementCount===0){
          (card.dataset.tags || '').split(/\s+/).filter(Boolean).slice(0,3).forEach(t=>{
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = t;
            tagRow.appendChild(span);
          });
        }
      }
    });
    if (stat) stat.textContent = shown;
  }

  // Sorting
  function sortCards(mode){
    const visited = getVisitedSet();
    const log = getVisitedLog();
    const lastTs = {}; log.forEach(x => { lastTs[x.href] = x.ts; });

    function parseNum(fn){
      const m = fn.match(/^(\d+)/);
      return m ? parseInt(m[1],10) : 1e9;
    }
    const items = cards.map(c => ({
      el: c,
      file: (c.textContent.match(/\\d+[^\\s]*/)||[''])[0],
      href: c.getAttribute('href'),
      title: (c.dataset.title||''),
      num: parseNum(c.textContent),
      ts: lastTs[c.getAttribute('href')] || 0,
      read: visited.has(c.getAttribute('href'))
    }));
    if(mode==='title'){
      items.sort((a,b)=>a.title.localeCompare(b.title,'th'));
    } else if(mode==='recent'){
      items.sort((a,b)=>b.ts - a.ts);
    } else if(mode==='unread'){
      items.sort((a,b)=> (a.read===b.read? a.num-b.num : (a.read?1:-1)));
    } else {
      items.sort((a,b)=>a.num-b.num);
    }
    items.forEach(x => grid.appendChild(x.el));
  }

  // Keyboard nav on grid
  let focusIdx = -1;
  function visibleCards(){ return cards.filter(c=>c.style.display !== 'none'); }
  document.addEventListener('keydown', (e)=>{
    if(document.activeElement === q) return;
    const vis = visibleCards();
    if(e.key === 'ArrowDown'){
      e.preventDefault();
      focusIdx = (focusIdx+1) % vis.length;
      vis[focusIdx].focus({preventScroll:false});
      vis[focusIdx].scrollIntoView({block:'nearest'});
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      focusIdx = (focusIdx-1+vis.length) % vis.length;
      vis[focusIdx].focus({preventScroll:false});
      vis[focusIdx].scrollIntoView({block:'nearest'});
    } else if(e.key === 'Enter' && document.activeElement && document.activeElement.classList.contains('lesson')){
      window.location.href = document.activeElement.getAttribute('href');
    }
  });

  // Filter counts on buttons
  function updateFilterCounts(){
    const counts = {};
    cards.forEach(c=>{
      (c.dataset.tags || '').split(/\\s+/).filter(Boolean).forEach(t=>{
        counts[t] = (counts[t]||0) + 1;
      });
    });
    filters.forEach(btn=>{
      const tag = btn.dataset.filter;
      const n = counts[tag] || 0;
      btn.textContent = tag + (n?` (${n})`:' (0)');
    });
  }

  // Continue Learning card
  function updateContinue(){
    const sec = document.getElementById('continue-sec');
    const a = document.getElementById('continue-link');
    const titleEl = document.getElementById('continue-title');
    const sub = document.getElementById('continue-sub');
    if(!sec || !a) return;
    const last = getLast();
    if(last && last.href){
      sec.hidden = false;
      a.href = last.href;
      titleEl.textContent = 'เรียนต่อ: ' + (last.title || last.href);
      const d = new Date(last.ts||Date.now());
      sub.textContent = 'ล่าสุด: ' + d.toLocaleString();
    } else {
      sec.hidden = true;
    }
  }

  // Events
  if(q) q.addEventListener('input', ()=>{ applyFilter(); sortCards(sortSel ? sortSel.value : 'num'); });
  filters.forEach(btn => btn.addEventListener('click', ()=>{ applyFilter(); sortCards(sortSel ? sortSel.value : 'num'); }));
  if(sortSel) sortSel.addEventListener('change', ()=> sortCards(sortSel.value));

  // Init
  updateFilterCounts();
  applyFilter();
  markVisited();
  sortCards(sortSel ? sortSel.value : 'num');
  updateContinue();
})();

