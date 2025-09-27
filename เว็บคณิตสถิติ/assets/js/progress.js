
/* Progress Tracker (localStorage) */
(function(){
  const store = {
    get(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch(e){ return null; } },
    set(k,v){ localStorage.setItem(k, JSON.stringify(v)); },
    del(k){ localStorage.removeItem(k); }
  };

  function getLessonIdFromPath(pathname){
    const m = pathname.match(/lesson(\d{2})\.html$/i);
    return m ? m[1] : null;
  }
  function getQuizIdFromConfig(){
    const cfg = document.body?.getAttribute('data-config') || '';
    const m = cfg.match(/quiz-lesson(\d{2})\.json/i);
    return m ? m[1] : null;
  }

  function makeFab(label, active){
    const btn = document.createElement('button');
    btn.className = 'progress-fab';
    btn.type = 'button';
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    btn.innerHTML = active ? '✅ ทำแล้ว' : '⏳ ยังไม่เสร็จ';
    return btn;
  }

  function attachLessonFab(lessonId){
    const key = `progress:lesson:${lessonId}`;
    const state = !!store.get(key);
    const btn = makeFab('done', state);
    btn.addEventListener('click', ()=>{
      const cur = !!store.get(key);
      if(cur){ store.del(key); btn.innerHTML = '⏳ ยังไม่เสร็จ'; btn.setAttribute('aria-pressed','false'); }
      else { store.set(key, {done:true, ts: Date.now()}); btn.innerHTML = '✅ ทำแล้ว'; btn.setAttribute('aria-pressed','true'); }
      // also update badges on index if opened
    });
    document.body.appendChild(btn);
  }

  function attachQuizFab(quizId){
    const key = `progress:quiz:${quizId}`;
    // only add if not present in page UI
    const btn = makeFab('quiz', !!store.get(key));
    btn.classList.add('is-quiz');
    btn.style.bottom = '5.5rem';
    btn.addEventListener('click', ()=>{
      const cur = !!store.get(key);
      if(cur){ store.del(key); btn.innerHTML = '⏳ ยังไม่เสร็จ'; btn.setAttribute('aria-pressed','false'); }
      else { store.set(key, {done:true, ts: Date.now()}); btn.innerHTML = '✅ ทำแล้ว'; btn.setAttribute('aria-pressed','true'); }
    });
    document.body.appendChild(btn);
  }

  function decorateIndexProgress(){
    // add a small summary bar at top if not exists
    const cards = Array.from(document.querySelectorAll('a[href^="lesson"][href$=".html"]'));
    if(cards.length === 0) return;
    let done = 0;
    const total = cards.length;
    cards.forEach(a=>{
      const m = a.getAttribute('href').match(/lesson(\d{2})\.html/i);
      if(!m) return;
      const id = m[1];
      const key = `progress:lesson:${id}`;
      const isDone = !!store.get(key);
      if(isDone) done++;
      // badge
      const badge = document.createElement('span');
      badge.className = 'progress-badge';
      badge.textContent = isDone ? 'เสร็จแล้ว' : 'ยัง';
      a.appendChild(badge);
    });
    // top bar
    const bar = document.createElement('div');
    bar.className = 'progress-summary';
    const pct = Math.round((done/total)*100);
    bar.innerHTML = `<div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
                     <div class="progress-label">ความคืบหน้า: ${done}/${total} บท (${pct}%)</div>`;
    const container = document.querySelector('main, .container, body');
    container.insertBefore(bar, container.firstChild);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const lessonId = getLessonIdFromPath(location.pathname);
    if(lessonId) attachLessonFab(lessonId);

    const quizId = getQuizIdFromConfig();
    if(quizId) attachQuizFab(quizId);

    // on index page (heuristic)
    if(/index\.html$/.test(location.pathname)) decorateIndexProgress();
  });
})();
