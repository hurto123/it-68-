/* assets/js/main.js */
(() => {
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hash Search (#search=) ---------- */
  function getHashQuery() {
    const m = (location.hash || '').match(/#search=(.*)/i);
    return m ? decodeURIComponent(m[1]).trim() : '';
  }

  function filterByQuery(root) {
    const scope = root?.querySelector?.('[data-search-scope]') || document.querySelector('[data-search-scope]');
    if (!scope) return;
    const q = getHashQuery().toLowerCase();
    const items = scope.querySelectorAll('[data-search-text]');
    let shown = 0;
    items.forEach(el => {
      const text = (el.getAttribute('data-search-text') || '').toLowerCase();
      const ok = !q || text.includes(q);
      el.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });
    const empty = root?.querySelector?.('[data-search-empty]') || document.querySelector('[data-search-empty]');
    if (empty) empty.hidden = (q === '' ? true : shown > 0);
  }

  function handleHashSearch() { filterByQuery(); }

  /* ---------- Prefetch ลิงก์เบา ๆ ---------- */
  const prefetchCache = new Map(); // url -> Promise<Response|null>
  function prefetch(url) {
    if (!url || prefetchCache.has(url)) return prefetchCache.get(url);
    const p = fetch(url, { credentials: 'same-origin' }).catch(() => null);
    prefetchCache.set(url, p);
    return p;
  }

  function setupPrefetch() {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || /^https?:\/\//i.test(href)) return;
      a.addEventListener('mouseenter', () => prefetch(href), { passive: true });
      a.addEventListener('focus', () => prefetch(href), { passive: true });
    });
  }

  /* ---------- Page Transition (PE) ---------- */
  let swapping = false;

  async function softNavigate(url, push = true) {
    if (swapping) return; swapping = true;

    const mainOld = document.querySelector('main');
    if (!mainOld) { location.href = url; return; }

    if (!prefersReduce) mainOld.classList.add('page-exit');

    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();

      const tmp = document.createElement('html');
      tmp.innerHTML = html;
      const mainNew = tmp.querySelector('main');
      const newTitle = tmp.querySelector('title');
      if (!mainNew) throw new Error('No <main>');

      // teardown components เก่า
      if (window.teardownComponents) { try { window.teardownComponents(); } catch {} }

      if (push) history.pushState({ url }, '', url);

      mainOld.replaceWith(mainNew);

      if (newTitle) document.title = newTitle.textContent.trim();

      if (!prefersReduce) {
        mainNew.classList.add('page-enter');
        requestAnimationFrame(() => {
          mainNew.classList.add('page-enter-active');
          setTimeout(() => mainNew.classList.remove('page-enter','page-enter-active'), 240);
        });
      }

      // focus first heading
      const h1 = mainNew.querySelector('h1,[role="heading"]');
      if (h1) { h1.setAttribute('tabindex','-1'); h1.focus({ preventScroll:true }); }

      // init ส่วนประกอบใหม่
      if (window.initComponents) { try { window.initComponents(); } catch {} }

      // re-run search บนหน้าใหม่ (ถ้ามี)
      filterByQuery(mainNew);

      // re-bind prefetch สำหรับลิงก์ใหม่
      setupPrefetch();

    } catch (e) {
      // fallback
      location.href = url;
    } finally {
      swapping = false;
    }
  }

  function interceptLinks() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || a.target === '_blank') return;

      // allow new tab
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // same-origin & html-ish
      const isSameOrigin = a.origin === location.origin;
      const isHtml = /\.html?(\?|#|$)/i.test(href) || href.startsWith('.') || href.startsWith('/');
      if (!isSameOrigin || !isHtml) return;

      e.preventDefault();
      softNavigate(href, true);
    });

    window.addEventListener('popstate', (ev) => {
      const url = ev.state?.url || (location.pathname + location.search + location.hash);
      softNavigate(url, false);
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    handleHashSearch();
    window.addEventListener('hashchange', handleHashSearch);

    if (window.initComponents) { try { window.initComponents(); } catch {} }

    setupPrefetch();
    interceptLinks();
  });
})();
