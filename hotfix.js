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

// Register service worker for PWA
(function(){
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./pwa/sw.js').catch(console.warn);
  }
})();