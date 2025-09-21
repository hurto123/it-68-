
(() => {
  const themeBtn = document.getElementById('toggleTheme');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('light');
    });
  }

  // Splash drawing on home
  const splash = document.getElementById('splashCanvas');
  if (splash) {
    const ctx = splash.getContext('2d');
    const w = splash.width, h = splash.height;
    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0,0,w,h);
    // axes
    ctx.strokeStyle = '#2a3345'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
    ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
    ctx.stroke();
    // plot f(x) = sin(x) + 0.3x scaled
    ctx.strokeStyle = '#7bdfff'; ctx.lineWidth = 2;
    ctx.beginPath();
    const sx = 30, sy = 40;
    for (let px=0; px<w; px++) {
      const x = (px - w/2)/sx;
      const y = Math.sin(x) + 0.3*x;
      const py = h/2 - y*sy;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // area under curve (approx)
    ctx.fillStyle = 'rgba(123,223,255,0.12)';
    for (let px=0; px<w; px+=10) {
      const x = (px - w/2)/sx;
      const y = Math.sin(x) + 0.3*x;
      const py = h/2 - y*sy;
      ctx.fillRect(px, Math.min(h/2, py), 10, Math.abs(h/2 - py));
    }
  }

  // Problem bank page
  const topicFilter = document.getElementById('topicFilter');
  const levelFilter = document.getElementById('levelFilter');
  const problemsContainer = document.getElementById('problemsContainer');
  const btnRandom = document.getElementById('btnRandom');
  const btnSubmit = document.getElementById('btnSubmit');
  const submitMsg = document.getElementById('submitMsg');

  async function loadProblems() {
    if (!problemsContainer) return;
    try {
      const resp = await fetch('api/get_problems.php');
      const data = await resp.json();
      window.ALL_PROBLEMS = data;
      const topics = Array.from(new Set(data.map(p => p.topic)));
      topics.sort();
      topics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t; opt.textContent = t;
        topicFilter.appendChild(opt);
      });
      renderProblems(data.slice(0, 20)); // show first 20 by default
    } catch (e) {
      problemsContainer.innerHTML = '<p style="color:#ff9">ไม่สามารถโหลดโจทย์ได้ — ต้องรันผ่านเซิร์ฟเวอร์ที่มี PHP</p>';
    }
  }

  function renderProblems(list) {
    problemsContainer.innerHTML = '';
    list.forEach(p => {
      const div = document.createElement('div');
      div.className = 'problem';
      div.dataset.id = p.id;
      div.innerHTML = `
        <header>
          <strong>#${p.id}</strong>
          <span class="meta">${p.topic} • ระดับ ${p.level}</span>
        </header>
        <div class="q">${p.question_html}</div>
        ${p.type === 'mcq' ? renderMCQ(p) : p.type === 'numeric' ? renderNumeric(p) : renderFree(p)}
        <details class="solution"><summary>ดูเฉลย</summary><div>${p.solution_html}</div></details>
      `;
      problemsContainer.appendChild(div);
    });
    if (window.MathJax) window.MathJax.typesetPromise();
  }

  function renderMCQ(p) {
    return `<div class="choices">` + p.choices.map((c,i)=>`
      <label><input type="radio" name="ans_${p.id}" value="${i}"> <span>${c}</span></label>
    `).join('') + `</div>`;
  }
  function renderNumeric(p) {
    return `<input class="answer-input" placeholder="พิมพ์คำตอบ เช่น 2.5 หรือ 3x^2" name="ans_${p.id}">`;
  }
  function renderFree(p) {
    return `<textarea class="answer-input" rows="3" placeholder="อธิบายวิธีทำ/ให้คำตอบ" name="ans_${p.id}"></textarea>`;
  }

  function currentFiltered() {
    let arr = window.ALL_PROBLEMS || [];
    const t = topicFilter?.value || 'all';
    const lv = levelFilter?.value || 'all';
    if (t !== 'all') arr = arr.filter(p => p.topic === t);
    if (lv !== 'all') arr = arr.filter(p => String(p.level) === lv);
    return arr;
  }

  topicFilter?.addEventListener('change', () => renderProblems(currentFiltered().slice(0, 20)));
  levelFilter?.addEventListener('change', () => renderProblems(currentFiltered().slice(0, 20)));
  btnRandom?.addEventListener('click', () => {
    const arr = currentFiltered();
    const chosen = [];
    const used = new Set();
    let cnt = Math.min(arr.length, 10);
    while (chosen.length < cnt) {
      const i = Math.floor(Math.random()*arr.length);
      if (!used.has(i)) { used.add(i); chosen.push(arr[i]); }
    }
    renderProblems(chosen);
  });

  btnSubmit?.addEventListener('click', async () => {
    const container = problemsContainer;
    const answers = [];
    container.querySelectorAll('.problem').forEach(div => {
      const id = div.dataset.id;
      const inputRadio = div.querySelector('input[type=radio]:checked');
      const inputTxt = div.querySelector('.answer-input');
      const val = inputRadio ? inputRadio.value : (inputTxt ? inputTxt.value.trim() : '');
      answers.push({ id, answer: val });
    });
    try {
      const resp = await fetch('api/save_submission.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ answers, ts: Date.now() })
      });
      const data = await resp.json();
      submitMsg.textContent = data.message || 'บันทึกผลแล้ว';
    } catch (e) {
      submitMsg.textContent = 'บันทึกไม่สำเร็จ (ต้องรันผ่าน PHP)';
    }
  });

  loadProblems();
})();
