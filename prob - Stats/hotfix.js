// Auto-hide header on scroll down, show on scroll up
(function(){
  const header = document.querySelector('.site-header');
  if(!header) return;
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll(){
    const y = window.scrollY;
    const goingDown = y > lastY && y > 10;
    header.classList.toggle('is-hidden', goingDown);
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
})();

// Register service worker for PWA with dynamic path based on current page depth
(function(){
  if (!('serviceWorker' in navigator)) return;
  try {
    var path = location.pathname;
    // If page is under /content/, register from parent
    var sw = path.includes('/content/') ? '../pwa/sw.js' : './pwa/sw.js';
    navigator.serviceWorker.register(sw).catch(console.warn);
  } catch(e){ console.warn(e); }
})();