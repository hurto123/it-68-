(function(){
  const navToggle = document.querySelector('[data-nav-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');
  if(navToggle && siteNav){
    navToggle.addEventListener('click', () => {
      siteNav.classList.toggle('is-open');
    });
  }

  const sections = document.querySelectorAll('[data-section]');
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.15 }) : null;

  sections.forEach(sec => {
    sec.classList.add('ps-animate');
    if(observer){ observer.observe(sec); }
  });
})();
