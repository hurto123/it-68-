
(function(){
  const THEMES = ['theme-light','theme-dark','theme-ocean','theme-rose'];

  function apply(t){
    const html = document.documentElement;
    THEMES.forEach(x=> html.classList.remove(x));
    html.classList.add(t);
    localStorage.setItem('theme', t);
  }

  function setupAnimations(){
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const selectors = [
      '[data-animate]',
      '.ps-animate',
      'main > section',
      'main > article',
      'main > div',
      'main > *:not(script):not(style)',
      '.card',
      '.summary-card',
      '.hero',
      '.timeline-item',
      '.accordion',
      '.quiz-controls',
      '.summary-page .summary-cols > *'
    ];

    const visited = new Set();
    const targets = [];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.isConnected || visited.has(el)) return;
        if (el.closest('[data-no-animate]')) return;
        visited.add(el);
        targets.push(el);
      });
    });

    if (!targets.length) return;

    if (reduceMotion.matches) {
      targets.forEach((el) => {
        el.classList.add('ps-animate--visible');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('ps-animate--visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10%' });

    targets.forEach((el) => {
      if (!el.classList.contains('ps-animate')) {
        el.classList.add('ps-animate');
      }

      if (el.dataset.animate && !el.dataset.psVariant) {
        el.dataset.psVariant = el.dataset.animate;
      }

      if (el.dataset.animateDelay && !el.style.getPropertyValue('--ps-animation-delay')) {
        el.style.setProperty('--ps-animation-delay', el.dataset.animateDelay);
      }

      observer.observe(el);
    });

    const handleMotionChange = (event) => {
      if (!event.matches) return;
      observer.disconnect();
      targets.forEach((el) => {
        el.classList.add('ps-animate--visible');
      });
    };

    if (typeof reduceMotion.addEventListener === 'function') {
      reduceMotion.addEventListener('change', handleMotionChange);
    } else if (typeof reduceMotion.addListener === 'function') {
      reduceMotion.addListener(handleMotionChange);
    }
  }

  function init(){
    let t = localStorage.getItem('theme') || 'theme-light';
    if(!THEMES.includes(t)) t = 'theme-light';
    apply(t);

    // small palette FAB
    const fab = document.createElement('div');
    fab.className = 'theme-palette';
    fab.setAttribute('role','group');
    fab.setAttribute('aria-label','สลับธีมสี');
    fab.innerHTML = THEMES.map(t=>`<button data-t="${t}" title="${t.replace('theme-','')}"></button>`).join('');
    document.body.appendChild(fab);
    fab.addEventListener('click', (e)=>{
      const b = e.target.closest('button[data-t]');
      if(!b) return;
      apply(b.dataset.t);
    });

    setupAnimations();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
