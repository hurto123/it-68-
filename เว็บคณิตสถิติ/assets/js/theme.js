
(function(){
  const THEMES = ['theme-light','theme-dark','theme-ocean','theme-rose'];
  function apply(t){
    const html = document.documentElement;
    THEMES.forEach(x=> html.classList.remove(x));
    html.classList.add(t);
    localStorage.setItem('theme', t);
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
  }
  document.addEventListener('DOMContentLoaded', init);
})();
