const scenarios = [
  {
    id: 'bag-red',
    prompt: 'ในถุงมีลูกบอลสีแดง 3 ลูก สีน้ำเงิน 2 ลูก สุ่มหยิบ 1 ลูกโดยไม่ดู โอกาสหยิบได้สีแดงใกล้เคียงกับข้อใด?',
    options: [
      { label: '20%', value: 0.2 },
      { label: '40%', value: 0.4 },
      { label: '60%', value: 0.6 }
    ],
    answer: 0.6,
    explanation: 'มีผลลัพธ์ทั้งหมด 5 แบบ โดยมีลูกบอลสีแดง 3 ลูก จึงได้ 3/5 = 0.6 หรือ 60%'
  },
  {
    id: 'coin-double-head',
    prompt: 'โยนเหรียญพร้อมกัน 2 เหรียญ ความน่าจะเป็นที่จะออกหัวทั้งสองเหรียญคือเท่าใด?',
    options: [
      { label: '1/2', value: 0.5 },
      { label: '1/3', value: 0.333 },
      { label: '1/4', value: 0.25 }
    ],
    answer: 0.25,
    explanation: 'ผลลัพธ์ทั้งหมด 4 แบบ (หัว-หัว, หัว-ก้อย, ก้อย-หัว, ก้อย-ก้อย) มี 1 แบบที่เป็นหัวทั้งคู่ จึงเป็น 1/4'
  },
  {
    id: 'cards-a',
    prompt: 'มีกองบัตรคำ 12 ใบ มีตัวอักษร A อยู่ 5 ใบ สุ่มหยิบ 1 ใบ โอกาสได้ตัวอักษร A คือเท่าใด?',
    options: [
      { label: '5/12', value: 5 / 12 },
      { label: '1/6', value: 1 / 6 },
      { label: '7/12', value: 7 / 12 }
    ],
    answer: 5 / 12,
    explanation: 'มี A อยู่ 5 ใบจากทั้งหมด 12 ใบ ดังนั้นโอกาสคือ 5/12 ≈ 41.7%'
  },
  {
    id: 'class-absent',
    prompt: 'จากข้อมูลในชั้นเรียน 30 คน มีนักศึกษาขาดเรียน 6 คน หากสุ่มเลือก 1 คน ความน่าจะเป็นที่จะเลือกได้คนที่ขาดเรียนคือ?',
    options: [
      { label: '10%', value: 0.1 },
      { label: '15%', value: 0.15 },
      { label: '20%', value: 0.2 }
    ],
    answer: 0.2,
    explanation: 'นักศึกษาที่ขาดเรียน 6 คนจากทั้งหมด 30 คน ดังนั้น 6/30 = 0.2 หรือ 20%'
  },
  {
    id: 'dice-six',
    prompt: 'ทอยลูกเต๋ามาตรฐาน 1 ลูก โอกาสที่จะได้คะแนนอย่างน้อย 5 คือเท่าใด?',
    options: [
      { label: '1/3', value: 1 / 3 },
      { label: '1/6', value: 1 / 6 },
      { label: '1/2', value: 0.5 }
    ],
    answer: 1 / 3,
    explanation: 'คะแนนอย่างน้อย 5 คือ {5, 6} มี 2 ผลลัพธ์จาก 6 ผลลัพธ์ทั้งหมด จึงเป็น 2/6 = 1/3'
  },
  {
    id: 'two-card',
    prompt: 'มีการ์ดตัวเลขตั้งแต่ 1 ถึง 10 หยิบออกมา 2 ใบโดยไม่ใส่คืน ความน่าจะเป็นที่ผลรวมมากกว่า 12 ใกล้เคียงกับข้อใด?',
    options: [
      { label: '18%', value: 0.18 },
      { label: '27%', value: 0.27 },
      { label: '35%', value: 0.35 }
    ],
    answer: 0.27,
    explanation: 'มีคู่จำนวน 45 คู่ เมื่อไล่นับคู่ที่ผลรวมมากกว่า 12 จะได้ประมาณ 12 คู่ หรือราว 26.7%'
  }
];

const app = document.querySelector('[data-game-app]');
const modeButtons = document.querySelectorAll('[data-mode]');
const resetButton = document.querySelector('[data-action="reset"]');
const modeLabel = document.getElementById('mode-label');
const scoreCorrect = document.getElementById('score-correct');
const scoreTotal = document.getElementById('score-total');
const timerEl = document.getElementById('timer');
const historyList = document.getElementById('history-list');

if (!app) {
  console.warn('[game] not initialised: missing mount element');
}

const state = {
  mode: null,
  current: null,
  score: 0,
  total: 0,
  timeLeft: 0,
  timerId: null,
  locked: false
};

const ui = {
  question: document.createElement('div'),
  options: document.createElement('div'),
  feedback: document.createElement('div'),
  next: document.createElement('button')
};

ui.question.className = 'game-question';
ui.options.className = 'game-options';
ui.feedback.className = 'game-feedback';
ui.feedback.hidden = true;
ui.next.className = 'btn secondary';
ui.next.textContent = 'ไปสถานการณ์ถัดไป';
ui.next.hidden = true;
if (app) {
  app.innerHTML = '';
  app.append(ui.question, ui.options, ui.feedback, ui.next);
  renderEmptyMessage();
}

function renderEmptyMessage() {
  if (!app) return;
  const existing = app.querySelector('.game-placeholder');
  if (existing) existing.remove();
  const placeholder = document.createElement('p');
  placeholder.className = 'muted game-placeholder';
  placeholder.textContent = 'เลือกโหมดเพื่อเริ่มเล่นเกม';
  app.prepend(placeholder);
}

function shuffle(array) {
  return array
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function pickScenario(previousId) {
  const pool = scenarios.filter(s => s.id !== previousId);
  const [first] = shuffle(pool.length ? pool : scenarios);
  return first;
}

function formatPercent(value) {
  return `${Math.round(value * 1000) / 10}%`;
}

function updateScoreboard() {
  if (!state.mode) {
    modeLabel.textContent = '—';
    scoreCorrect.textContent = '0';
    scoreTotal.textContent = '0';
    timerEl.textContent = '—';
    return;
  }
  modeLabel.textContent = state.mode === 'timed' ? 'โหมดจับเวลา' : 'โหมดฝึก';
  scoreCorrect.textContent = state.score.toString();
  scoreTotal.textContent = state.total.toString();
  if (state.mode === 'timed') {
    timerEl.textContent = `${state.timeLeft}s`;
  } else {
    timerEl.textContent = 'ไม่จำกัด';
  }
}

function startTimer() {
  clearTimer();
  state.timeLeft = 90;
  timerEl.textContent = `${state.timeLeft}s`;
  state.timerId = window.setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      timerEl.textContent = 'หมดเวลา';
      clearTimer();
      endTimedSession();
      return;
    }
    timerEl.textContent = `${state.timeLeft}s`;
  }, 1000);
}

function clearTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function endTimedSession() {
  lockOptions();
  ui.next.hidden = false;
  ui.next.textContent = 'เริ่มโหมดใหม่';
  ui.next.onclick = () => {
    ui.next.hidden = true;
    startMode(state.mode);
  };
  ui.feedback.hidden = false;
  ui.feedback.dataset.state = 'info';
  ui.feedback.innerHTML = `
    <strong>หมดเวลาแล้ว!</strong>
    คุณตอบถูก ${state.score} จาก ${state.total} ข้อ ลองอีกครั้งเพื่อเพิ่มความเร็ว
  `;
}

function lockOptions() {
  state.locked = true;
  ui.options.querySelectorAll('button').forEach(btn => {
    btn.disabled = true;
  });
}

function unlockOptions() {
  state.locked = false;
  ui.options.querySelectorAll('button').forEach(btn => {
    btn.disabled = false;
  });
}

function handleChoice(option) {
  if (state.locked) return;
  const scenario = state.current;
  if (!scenario) return;
  state.locked = true;
  state.total += 1;
  const isCorrect = Math.abs(option.value - scenario.answer) < 1e-3;
  if (isCorrect) {
    state.score += 1;
  }
  const status = isCorrect ? 'correct' : 'wrong';
  ui.feedback.dataset.state = status;
  ui.feedback.hidden = false;
  ui.feedback.innerHTML = `
    <strong>${isCorrect ? 'ตอบถูกต้อง!' : 'ยังไม่ใช่คำตอบที่ดีที่สุด'}</strong>
    คำตอบที่ถูกคือ ${formatPercent(scenario.answer)} — ${scenario.explanation}
  `;
  updateHistory(scenario, isCorrect, option);
  updateScoreboard();
  lockOptions();
  if (state.mode === 'timed') {
    window.setTimeout(() => {
      if (state.timeLeft > 0) {
        nextScenario();
      }
    }, 1400);
  } else {
    ui.next.hidden = false;
    ui.next.textContent = 'ไปสถานการณ์ถัดไป';
    ui.next.onclick = () => {
      ui.next.hidden = true;
      nextScenario();
    };
  }
}

function updateHistory(scenario, isCorrect, option) {
  if (!historyList) return;
  const item = document.createElement('li');
  const chosenDisplay = /%|\//.test(option.label) ? option.label : `${option.label} (${formatPercent(option.value)})`;
  item.innerHTML = `
    <strong>${scenario.prompt}</strong><br />
    คุณเลือก: ${chosenDisplay} • คำตอบที่ถูก: ${formatPercent(scenario.answer)}
  `;
  item.dataset.state = isCorrect ? 'correct' : 'wrong';
  historyList.prepend(item);
  const items = Array.from(historyList.children);
  if (items.length > 6) {
    items.slice(6).forEach(el => el.remove());
  }
}

function renderScenario() {
  if (!state.current) return;
  ui.question.textContent = state.current.prompt;
  ui.options.innerHTML = '';
  const buttons = state.current.options.map(option => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const showValue = /%|\//.test(option.label) ? option.label : `${option.label} (${formatPercent(option.value)})`;
    btn.textContent = showValue;
    btn.addEventListener('click', () => handleChoice(option));
    return btn;
  });
  buttons.forEach(btn => ui.options.appendChild(btn));
  ui.feedback.hidden = true;
  ui.feedback.textContent = '';
  unlockOptions();
}

function nextScenario() {
  ui.feedback.hidden = true;
  const next = pickScenario(state.current ? state.current.id : null);
  state.current = next;
  renderScenario();
}

function resetHistory() {
  if (historyList) {
    historyList.innerHTML = '';
  }
}

function startMode(mode) {
  state.mode = mode;
  state.score = 0;
  state.total = 0;
  state.current = null;
  state.locked = false;
  if (app) {
    const placeholder = app.querySelector('.game-placeholder');
    if (placeholder) placeholder.remove();
  }
  ui.next.hidden = true;
  ui.next.onclick = null;
  resetHistory();
  if (mode === 'timed') {
    startTimer();
  } else {
    clearTimer();
  }
  updateScoreboard();
  nextScenario();
  if (resetButton) {
    resetButton.hidden = false;
  }
}

modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    modeButtons.forEach(btn => btn.classList.remove('is-active'));
    button.classList.add('is-active');
    startMode(button.dataset.mode);
  });
});

if (resetButton) {
  resetButton.addEventListener('click', () => {
    if (!state.mode) {
      updateScoreboard();
      return;
    }
    startMode(state.mode);
  });
}

updateScoreboard();
