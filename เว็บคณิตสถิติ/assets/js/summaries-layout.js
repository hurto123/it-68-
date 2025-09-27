
(function(){
  function onReady(){
    if(!document.querySelector('.summary-page')) return;
    const main = document.querySelector('main');
    // Build columns container if not exists
    if(!main.querySelector('.summary-cols')){
      const wrap = document.createElement('div');
      wrap.className = 'summary-cols';
      const left = document.createElement('div'); left.className = 'col-left';
      const right = document.createElement('div'); right.className = 'col-right';
      // Move existing sections/cards into left by default
      const kids = Array.from(main.querySelectorAll('section, .card, article, .summary-card, .note, .ok, .warn'));
      if(kids.length){
        kids[0].before(wrap);
        kids.forEach(k=> left.appendChild(k));
      } else {
        wrap.innerHTML = '<div class="col-left"></div><div class="col-right"></div>';
        main.appendChild(wrap);
      }
      wrap.appendChild(left);
      wrap.appendChild(right);

      // Heuristics: move formula/graph/table content to right
      const moveToRightIf = (el)=>{
        const txt = (el.textContent||'').toLowerCase();
        if(txt.includes('สูตร') || txt.includes('formula') || txt.includes('กราฟ') || txt.includes('graph') || txt.includes('ตาราง') || txt.includes('empirical') || txt.includes('z-score')){
          right.appendChild(el);
          return true;
        }
        return false;
      };
      Array.from(left.children).slice().forEach(child=>{
        // If child has heading h2/h3 matching keywords, move
        const h = child.querySelector('h2,h3');
        if(h && moveToRightIf(child)) return;
        // If contains MathJax/latex or <canvas>, move
        if(child.querySelector('.MathJax, mjx-container, canvas, svg')) { right.appendChild(child); return; }
      });

      // If right is empty, clone a key summary card or leave empty
      if(!right.children.length){
        const clone = left.querySelector('.card, .summary-card');
        if(clone) right.appendChild(clone.cloneNode(true));
      }
    }
  }
  document.addEventListener('DOMContentLoaded', onReady);
})();
