
(function(){
  function $(s,root=document){ return root.querySelector(s); }
  function $all(s,root=document){ return Array.from(root.querySelectorAll(s)); }

  async function loadData(){
    const cfg = document.body.getAttribute('data-config');
    if(!cfg) throw new Error('ไม่พบ data-config บน <body>');
    const res = await fetch(cfg);
    if(!res.ok) throw new Error('โหลดข้อสอบไม่สำเร็จ: '+res.status);
    return await res.json();
  }

  function shuffle(a){
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function renderControls(root, total){
    const bar = document.createElement('div');
    bar.className = 'quiz-controls';

    const countSel = document.createElement('select');
    [5,10,15,total].forEach(n=>{
      const opt = document.createElement('option');
      opt.value = n; opt.textContent = n===total?`ทั้งหมด (${total})`:n;
      countSel.appendChild(opt);
    });

    const timeSel = document.createElement('select');
    [3,5,10,15,20,30].forEach(min=>{
      const opt = document.createElement('option');
      opt.value = min; opt.textContent = `${min} นาที`;
      timeSel.appendChild(opt);
    });

    const startBtn = document.createElement('button'); startBtn.textContent = 'เริ่มทำแบบสอบ';
    const timer = document.createElement('div'); timer.className = 'quiz-timer'; timer.textContent = '⏱ 00:00';

    bar.append('จำนวนข้อ:', countSel, 'เวลา:', timeSel, startBtn, timer);
    root.appendChild(bar);
    return {bar, countSel, timeSel, startBtn, timer};
  }

  function renderItem(item, idx){
    const wrap = document.createElement('div');
    wrap.className = 'card';
    const q = document.createElement('div');
    q.innerHTML = `<strong>ข้อที่ ${idx+1}.</strong> ${item.q}`;
    wrap.appendChild(q);

    if(item.type==='mcq'){
      const ul = document.createElement('ul');
      ul.style.listStyle='none'; ul.style.padding=0;
      (item.choices||[]).forEach((c,i)=>{
        const li = document.createElement('li');
        const id = `q${idx}_c${i}`;
        li.innerHTML = `<label><input type="radio" name="q${idx}" value="${i}"> ${c}</label>`;
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
    } else if(item.type==='numeric'){
      const input = document.createElement('input');
      input.type='number'; input.step='any'; input.placeholder='คำตอบตัวเลข';
      input.setAttribute('aria-label','คำตอบตัวเลข');
      wrap.appendChild(input);
    }
    const exp = document.createElement('div'); exp.className='explain'; exp.style.display='none';
    exp.innerHTML = item.explain?`<div class="note"><strong>เฉลย:</strong> ${item.explain}</div>`:'';
    wrap.appendChild(exp);
    return wrap;
  }

  function startExam(root, data, count, minutes){
    root.querySelectorAll('.card.exam-item').forEach(e=>e.remove());
    const items = shuffle([...data.items]).slice(0, count);
    const list = document.createElement('div'); list.className='exam-list';
    let tsec = minutes*60;
    let stop=false;

    // render items
    items.forEach((it,i)=>{
      const el = renderItem(it,i);
      el.classList.add('exam-item');
      list.appendChild(el);
    });
    root.appendChild(list);

    // submit bar
    const submit = document.createElement('button'); submit.textContent='ส่งคำตอบ';
    submit.className='btn';
    root.appendChild(submit);

    // timer
    function tick(){
      if(stop) return;
      const m = String(Math.floor(tsec/60)).padStart(2,'0');
      const s = String(tsec%60).padStart(2,'0');
      const tEl = root.querySelector('.quiz-timer');
      if(tEl) tEl.textContent = `⏱ ${m}:${s}`;
      if(tsec<=0){ stop=true; grade(); return; }
      tsec--; setTimeout(tick,1000);
    }
    tick();

    function grade(){
      let correct=0;
      items.forEach((it,i)=>{
        const wrap = list.children[i];
        let ok=false;
        if(it.type==='mcq'){
          const sel = wrap.querySelector('input[type="radio"]:checked');
          const chose = sel? parseInt(sel.value,10) : -1;
          ok = (chose===it.answer);
        } else if(it.type==='numeric'){
          const v = parseFloat(wrap.querySelector('input')?.value||'NaN');
          const tol = it.tolerance ?? 0;
          ok = (Math.abs(v - it.answer) <= tol + 1e-9);
        }
        if(ok){ correct++; wrap.classList.add('ok'); } else { wrap.classList.add('warn'); }
        const exp = wrap.querySelector('.explain'); if(exp) exp.style.display='block';
      });
      const score = Math.round((correct/items.length)*100);
      const panel = document.createElement('div');
      panel.className='card-strong';
      panel.innerHTML = `<strong>คะแนน:</strong> ${correct}/${items.length} (${score}%)`;
      root.appendChild(panel);

      const retry = document.createElement('button'); retry.textContent='ทำใหม่ (สุ่มชุดใหม่)';
      retry.addEventListener('click', ()=>{
        root.querySelectorAll('.exam-list, .card-strong, .ok, .warn').forEach(e=>e.remove());
        startExam(root, data, count, minutes);
      });
      root.appendChild(retry);
    }

    submit.addEventListener('click', ()=>{ stop=true; grade(); });
  }

  async function main(){
    const root = document.getElementById('quiz-root');
    if(!root) return;
    const data = await loadData();
    root.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'quiz-header';
    header.innerHTML = `<div><strong>${data.title||'ควิซ'}</strong></div>`;
    root.appendChild(header);

    const controls = renderControls(root, (data.items||[]).length);
    controls.startBtn.addEventListener('click', ()=>{
      startExam(root, data, parseInt(controls.countSel.value,10), parseInt(controls.timeSel.value,10));
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    // Remove old quiz-page placeholders if they exist
    const old = document.getElementById('quiz');
    if(old) old.remove();
    main().catch(err=>{
      const root = document.getElementById('quiz-root') || document.body;
      const e = document.createElement('div'); e.className='warn';
      e.textContent = 'เกิดข้อผิดพลาดในการโหลดควิซ: '+err.message;
      root.appendChild(e);
    });
  });
})();
