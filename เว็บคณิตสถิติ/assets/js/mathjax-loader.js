(function() {
  const script = document.currentScript;
  const scriptUrl = script ? new URL(script.getAttribute('src'), window.location.href) : new URL('./assets/js/mathjax-loader.js', window.location.href);
  const cdnSrc = script?.dataset.mathjaxCdn || 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  const localSrc = script?.dataset.mathjaxLocal
    ? new URL(script.dataset.mathjaxLocal, window.location.href).href
    : new URL('../vendor/mathjax/tex-mml-chtml.js', scriptUrl).href;
  const timeout = Number(script?.dataset.mathjaxTimeout || 5000);
  let resolved = false;

  if (!document.head) {
    return;
  }

  const markLoaded = (origin) => {
    resolved = true;
    document.documentElement.dataset.mathjaxOrigin = origin;
  };

  const load = (src, extraAttrs = {}) => {
    const el = document.createElement('script');
    el.async = true;
    el.src = src;
    Object.entries(extraAttrs).forEach(([key, value]) => {
      if (value !== undefined) {
        el.setAttribute(key, value);
      }
    });
    document.head.appendChild(el);
    return el;
  };

  const loadFallback = (reason) => {
    if (resolved) return;
    markLoaded(`local:${reason}`);
    load(localSrc, { 'data-mathjax': 'fallback' });
  };

  const cdnScript = load(cdnSrc, { id: 'mathjax-cdn' });
  cdnScript.addEventListener('load', () => markLoaded('cdn'));
  cdnScript.addEventListener('error', () => loadFallback('error'));

  window.setTimeout(() => {
    if (!resolved) {
      loadFallback('timeout');
    }
  }, Number.isFinite(timeout) ? timeout : 5000);
})();
