const probabilityRange = document.getElementById('probability-range');
const probabilityLabel = document.getElementById('probability-label');
const trialRange = document.getElementById('trial-range');
const trialLabel = document.getElementById('trial-label');
const targetMean = document.getElementById('target-mean');
const targetTrials = document.getElementById('target-trials');
const runButton = document.getElementById('btn-run');
const resetButton = document.getElementById('btn-reset');
const resultSuccess = document.getElementById('result-success');
const resultRate = document.getElementById('result-rate');
const resultDiff = document.getElementById('result-diff');
const feedbackBox = document.getElementById('result-feedback');
const chartContainer = document.getElementById('history-chart');

const history = [];
const MAX_HISTORY = 6;
let runCount = 0;

const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;
const formatDiff = (diff) => `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;

const updateTarget = () => {
  const p = Number(probabilityRange.value) / 100;
  const n = Number(trialRange.value);
  probabilityLabel.textContent = `${probabilityRange.value}%`;
  trialLabel.textContent = `${n} ครั้ง`;
  targetTrials.textContent = n.toString();
  targetMean.textContent = Math.round(p * n).toString();
};

const renderHistory = () => {
  chartContainer.innerHTML = '';
  history.slice(-MAX_HISTORY).forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'chart-item';

    const meta = document.createElement('div');
    meta.className = 'chart-item__meta';
    meta.innerHTML = `<span>ครั้งที่ ${item.run}</span><span>${item.success}/${item.n} (${formatPercent(item.rate)})</span>`;

    const bar = document.createElement('div');
    bar.className = 'chart-item__bar';
    bar.style.setProperty('--ratio', `${Math.min(item.rate * 100, 100).toFixed(1)}%`);
    bar.setAttribute('aria-label', `ครั้งที่ ${item.run} สำเร็จ ${item.success} จาก ${item.n} ครั้ง`);

    wrapper.appendChild(meta);
    wrapper.appendChild(bar);
    chartContainer.appendChild(wrapper);
  });
};

const describeDiff = (diff) => {
  if (Math.abs(diff) < 2) {
    return 'เยี่ยม! ผลลัพธ์ใกล้กับความคาดหวังมาก — เห็นภาพกฎจำนวนมากชัดเจน';
  }
  if (Math.abs(diff) < 6) {
    return 'ต่างจากทฤษฎีเล็กน้อย อาจเกิดจากความบังเอิญของการสุ่ม ลองเพิ่มจำนวนการทดลองดู';
  }
  return 'ต่างจากทฤษฎีมาก แสดงถึงความผันผวนสูง ลองเพิ่ม n หรือเปลี่ยนค่า p เพื่อตรวจสอบเพิ่มเติม';
};

const runSimulation = () => {
  const p = Number(probabilityRange.value) / 100;
  const n = Number(trialRange.value);
  let success = 0;
  for (let i = 0; i < n; i += 1) {
    if (Math.random() < p) success += 1;
  }
  const rate = success / n;
  const diff = (rate - p) * 100;

  runCount += 1;
  history.push({ success, rate, diff, n, run: runCount });
  if (history.length > MAX_HISTORY) {
    history.shift();
  }

  resultSuccess.textContent = success.toString();
  resultRate.textContent = formatPercent(rate);
  resultDiff.textContent = formatDiff(diff);
  feedbackBox.textContent = describeDiff(diff);
  renderHistory();
};

const resetHistory = () => {
  history.length = 0;
  runCount = 0;
  chartContainer.innerHTML = '';
  resultSuccess.textContent = '-';
  resultRate.textContent = '-';
  resultDiff.textContent = '-';
  feedbackBox.textContent = '';
};

probabilityRange.addEventListener('input', updateTarget);
trialRange.addEventListener('input', updateTarget);
runButton.addEventListener('click', runSimulation);
resetButton.addEventListener('click', resetHistory);

updateTarget();
renderHistory();
