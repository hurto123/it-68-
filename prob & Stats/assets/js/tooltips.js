export function attachTooltips(root = document){
  root.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.textContent = el.getAttribute('data-tooltip');
      document.body.appendChild(tip);
      const rect = el.getBoundingClientRect();
      tip.style.left = rect.left + rect.width / 2 + 'px';
      tip.style.top = rect.top - 8 + window.scrollY + 'px';
      el._tip = tip;
    });
    el.addEventListener('mouseleave', () => {
      if(el._tip){
        el._tip.remove();
        el._tip = null;
      }
    });
  });
}
