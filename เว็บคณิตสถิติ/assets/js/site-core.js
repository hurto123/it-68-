(function(){
  const doc = document;
  const body = doc.body;
  if(!body){ return; }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  body.classList.add('page-transition--init');

  requestAnimationFrame(() => {
    body.classList.add('page-transition--ready');
    body.classList.remove('page-transition--init');
  });

  const main = doc.querySelector('main');
  if(main){
    main.setAttribute('tabindex','-1');
  }

  const skipLink = doc.querySelector('.skip-link');
  if(skipLink && main){
    skipLink.addEventListener('click', evt => {
      evt.preventDefault();
      main.focus({ preventScroll: false });
    });
  }

  const bar = doc.createElement('div');
  bar.className = 'page-progress';
  body.prepend(bar);

  function showProgress(){
    if(reduceMotion.matches){ return; }
    bar.classList.add('is-active','is-animating');
  }
  function hideProgress(){
    bar.classList.remove('is-animating');
    bar.style.transform = 'scaleX(1)';
    requestAnimationFrame(() => {
      bar.classList.remove('is-active');
      bar.style.transform = 'scaleX(0)';
    });
  }

  window.addEventListener('pageshow', () => {
    body.classList.remove('page-transition--exit');
    requestAnimationFrame(() => {
      body.classList.add('page-transition--ready');
      body.classList.remove('page-transition--init');
      hideProgress();
    });
  });

  doc.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if(!link){ return; }
    if(link.target && link.target !== '_self'){ return; }
    if(link.hasAttribute('download')){ return; }
    const href = link.getAttribute('href');
    if(!href || href.startsWith('#')){ return; }
    try{
      const url = new URL(link.href, window.location.href);
      if(url.origin !== window.location.origin){ return; }
    }catch(err){
      return;
    }
    body.classList.add('page-transition--exit');
    showProgress();
  }, { capture: true });

  // Prefetch on hover/idle for same-origin links
  const prefetched = new Set();
  function shouldPrefetch(link){
    if(!link || prefetched.has(link.href)){ return false; }
    if(link.target && link.target !== '_self'){ return false; }
    if(link.hasAttribute('download')){ return false; }
    const href = link.getAttribute('href');
    if(!href || href.startsWith('#')){ return false; }
    try{
      const url = new URL(link.href, window.location.href);
      if(url.origin !== window.location.origin){ return false; }
      if(url.pathname === window.location.pathname){ return false; }
    }catch(err){
      return false;
    }
    return true;
  }

  function prefetch(link){
    if(!shouldPrefetch(link)){ return; }
    const el = doc.createElement('link');
    el.rel = 'prefetch';
    el.href = link.href;
    el.as = 'document';
    doc.head.appendChild(el);
    prefetched.add(link.href);
  }

  doc.addEventListener('mouseover', (event) => {
    const link = event.target.closest('a');
    if(link){ prefetch(link); }
  });

  doc.addEventListener('focusin', (event) => {
    const link = event.target.closest('a');
    if(link){ prefetch(link); }
  });

})();
