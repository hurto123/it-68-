(() => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) {
    console.info('[sw] Skipping service worker registration because reduced motion is enabled.');
    return;
  }

  const currentScript = document.currentScript;
  const scriptUrl = currentScript ? currentScript.src : new URL('./assets/js/sw-register.js', window.location.href).href;
  const swUrl = new URL('../../service-worker.js', scriptUrl);
  const scopePathname = new URL('./', swUrl).pathname;

  navigator.serviceWorker
    .register(swUrl, { scope: scopePathname })
    .then((registration) => {
      console.info('[sw] Service worker registered.', registration.scope);
    })
    .catch((error) => {
      console.error('[sw] Failed to register service worker.', error);
    });
})();
