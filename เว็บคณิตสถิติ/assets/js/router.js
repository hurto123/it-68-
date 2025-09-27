
/* Prefetch + Smooth Transition (non-SPA) */
(function(){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isInternal(href){
    if(!href || href.startsWith('#')) return false;
    if(/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    try {
      const u = new URL(href, location.href);
      return u.origin === location.origin;
    } catch(e){ return false; }
  }

  const prefetched = new Set();
  function prefetch(href){
    if(prefersReduced) return;
    if(!isInternal(href) || prefetched.has(href)) return;
    const l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = href;
    l.as = 'document';
    document.head.appendChild(l);
    prefetched.add(href);
  }

  function onHover(e){
    const a = e.target.closest('a[href]');
    if(!a) return;
    prefetch(a.getAttribute('href'));
  }

  function onClick(e){
    const a = e.target.closest('a[href]');
    if(!a) return;
    const href = a.getAttribute('href');
    if(!isInternal(href)) return;
    // new tab or download or modifier keys
    if(a.target === '_blank' || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button===1) return;
    // anchor to same page
    if(href.startsWith('#')) return;
    // enable soft transition
    if(!prefersReduced){
      e.preventDefault();
      document.documentElement.classList.add('page-leave');
      setTimeout(()=>{ window.location.href = href; }, 160);
    }
  }

  document.addEventListener('mouseover', onHover, {passive:true});
  document.addEventListener('touchstart', onHover, {passive:true});
  document.addEventListener('click', onClick);

  // Enter animation on new page
  if(!prefersReduced){
    document.documentElement.classList.add('page-enter');
    setTimeout(()=>document.documentElement.classList.remove('page-enter'), 220);
  }
})();
