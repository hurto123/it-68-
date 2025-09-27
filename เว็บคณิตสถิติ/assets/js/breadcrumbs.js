
/* Breadcrumbs + Prev/Next + Quick Map */
(function(){
  function el(tag, cls, html){
    const e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html != null) e.innerHTML = html;
    return e;
  }

  function build(){
    const path = location.pathname;
    const crumbs = [];
    crumbs.push({name:'หน้าแรก', href:'index.html'});

    let type='', title='', lessonId=null;

    // Identify page kind
    let m;
    if(m = path.match(/lesson(\d{2})\.html$/i)){
      type='lesson'; lessonId=m[1]; title=`บทที่ ${parseInt(lessonId,10)}`;
      crumbs.push({name:'บทเรียน', href:'index.html#search=lesson'});
      crumbs.push({name:title, href:`lesson${lessonId}.html`});
    } else if(m = path.match(/summary-lesson(\d{2})\.html$/i)){
      type='summary'; lessonId=m[1]; title=`สรุปบทที่ ${parseInt(lessonId,10)}`;
      crumbs.push({name:'สรุป', href:'summaries-all.html'});
      crumbs.push({name:title, href:`summary-lesson${lessonId}.html`});
    } else if(m = path.match(/quiz-lesson(\d{2})\.html$/i)){
      type='quiz'; lessonId=m[1]; title=`ควิซบทที่ ${parseInt(lessonId,10)}`;
      crumbs.push({name:'ควิซ', href:'quiz-mixed.html'});
      crumbs.push({name:title, href:`quiz-lesson${lessonId}.html`});
    } else if(/summaries-all\.html$/.test(path)){
      type='summaries';
      crumbs.push({name:'สรุปรวม', href:'summaries-all.html'});
    } else if(m = path.match(/formula\/([a-z0-9\-]+)\.html$/i)){
      type='formula'; const slug=m[1];
      crumbs.push({name:'สูตร', href:getPrefix()+'formula/index.html'});
      crumbs.push({name:mapFormulaName(slug), href: getPrefix()+`formula/${slug}.html`});
    } else if(/formula\/index\.html$/.test(path)){
      type='formula-index';
      crumbs.push({name:'สูตร', href:getPrefix()+'formula/index.html'});
    } else {
      // index or others
    }

    // Render
    const nav = el('nav','breadcrumb','');
    nav.setAttribute('aria-label','breadcrumb');
    const ol = el('ol', null, '');
    crumbs.forEach((c,i)=>{
      const li = el('li', i===crumbs.length-1?'current':'', '');
      if(i===crumbs.length-1){ li.textContent = c.name; }
      else { const a = el('a', null, c.name); a.href = c.href; li.appendChild(a); }
      ol.appendChild(li);
    });
    nav.appendChild(ol);

    // Prev/Next for lessons
    if(type==='lesson' && lessonId){
      const pn = el('div','prev-next','');
      const n = parseInt(lessonId,10);
      if(n>1){
        const a = el('a','prev','← บทที่ '+(n-1));
        a.href = `lesson${String(n-1).padStart(2,'0')}.html`;
        pn.appendChild(a);
      }
      if(n<99){
        const a = el('a','next','บทที่ '+(n+1)+' →');
        a.href = `lesson${String(n+1).padStart(2,'0')}.html`;
        pn.appendChild(a);
      }
      nav.appendChild(pn);

      // Quick links to summary/quiz for same lesson
      const quick = el('div','quick-links',`
        <a href="summary-lesson${lessonId}.html">📝 สรุป 1 หน้า</a>
        <a href="quiz-lesson${lessonId}.html">🧪 ควิซท้ายบท</a>
      `);
      nav.appendChild(quick);
    }

    // Mount nav
    const container = document.querySelector('main, .container, body');
    container.insertBefore(nav, container.firstChild);
  }

  function getPrefix(){
    // for formula pages under formula/, need ../
    return location.pathname.includes('/formula/') ? '../' : '';
  }

  function mapFormulaName(slug){
    const names = {
      'bernoulli':'Bernoulli',
      'binomial':'Binomial',
      'poisson':'Poisson',
      'hypergeometric':'Hypergeometric',
      'normal':'Normal',
      'z-score':'Z-Score',
      't-distribution':'t-distribution',
      'chi-square':'Chi-square',
      'f-distribution':'F-distribution',
      'clt-xbar-phat':'CLT (x̄ & p̂)'
    };
    return names[slug] || slug;
  }

  document.addEventListener('DOMContentLoaded', build);
})();
