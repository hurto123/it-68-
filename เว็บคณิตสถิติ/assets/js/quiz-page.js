import { QuizPlayer } from './quiz-player.js';

function setText(el, text) {
  if (!el) return;
  el.textContent = text;
}

function formatMeta(meta, totalQuestions) {
  const bits = [];
  if (meta?.version) bits.push(`เวอร์ชัน ${meta.version}`);
  if (meta?.updated_at) bits.push(`อัปเดต ${meta.updated_at}`);
  if (typeof totalQuestions === 'number') {
    bits.push(`${totalQuestions} ข้อ`);
  }
  return bits.join(' • ');
}

export async function initQuizPage(customOptions = {}) {
  const body = document.body;
  const mount = document.getElementById('quiz-app');
  if (!mount) {
    throw new Error('ไม่พบพื้นที่สำหรับฝังระบบ Quiz (#quiz-app)');
  }
  const configPath = customOptions.configPath || body.dataset.config;
  if (!configPath) {
    throw new Error('ยังไม่ได้ระบุพาธ config ของ Quiz (data-config)');
  }

  const titleEl = document.getElementById('quiz-title');
  const subtitleEl = document.getElementById('quiz-subtitle');
  const metaEl = document.getElementById('quiz-meta');
  const statusEl = document.getElementById('quiz-status');
  const lessonLinkEl = document.getElementById('link-lesson');
  const summaryLinkEl = document.getElementById('link-summary');

  const fallbackTitle = body.dataset.pageTitle || 'Quiz แบบจับเวลา';
  setText(titleEl, fallbackTitle);
  if (body.dataset.pageSubtitle) {
    setText(subtitleEl, body.dataset.pageSubtitle);
  }
  if (lessonLinkEl && body.dataset.lessonLink) {
    lessonLinkEl.href = body.dataset.lessonLink;
  }
  if (summaryLinkEl && body.dataset.summaryLink) {
    summaryLinkEl.href = body.dataset.summaryLink;
  }

  const allowedModes = body.dataset.allowedModes
    ? body.dataset.allowedModes.split(',').map((m) => m.trim()).filter(Boolean)
    : undefined;
  const defaultMode = body.dataset.defaultMode?.trim();

  const player = new QuizPlayer({
    mount,
    configPath,
    practiceLabel: body.dataset.practiceLabel,
    quizLabel: body.dataset.quizLabel,
    allowedModes,
    defaultMode,
  });
  await player.init();

  mount.addEventListener('quiz:data-ready', (event) => {
    const { meta, totalQuestions } = event.detail || {};
    if (meta?.title) {
      setText(titleEl, meta.title);
      document.title = `${meta.title} — Quiz`; 
    }
    const subtitleParts = [];
    if (body.dataset.pageSubtitle) subtitleParts.push(body.dataset.pageSubtitle);
    if (meta?.lesson && body.dataset.lessonLabel) {
      subtitleParts.push(body.dataset.lessonLabel);
    }
    setText(subtitleEl, subtitleParts.filter(Boolean).join(' • '));
    setText(metaEl, formatMeta(meta, totalQuestions));
    if (statusEl) {
      const unsupported = event.detail?.unsupported || 0;
      statusEl.textContent = unsupported
        ? `ข้ามคำถามที่ยังไม่รองรับ ${unsupported} ข้อ`
        : '';
    }
  });

  mount.addEventListener('quiz:started', (event) => {
    if (!statusEl) return;
    const { mode, total } = event.detail || {};
    const modeLabel = mode === 'quiz' ? 'โหมด Quiz (จับเวลา)' : 'โหมดฝึก';
    statusEl.textContent = `เริ่มทำ ${modeLabel} จำนวน ${total} ข้อ`;
  });

  mount.addEventListener('quiz:finished', (event) => {
    if (!statusEl) return;
    const { mode, total, correct, passed, duration, reason } = event.detail || {};
    const parts = [];
    parts.push(`สรุป: ${correct}/${total} ข้อ`);
    if (mode === 'quiz') {
      parts.push(passed ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่าน');
    }
    if (duration) {
      parts.push(`ใช้เวลา ${Math.round(duration / 60)} นาที`);
    }
    if (reason === 'timeout') {
      parts.push('หมดเวลา');
    }
    statusEl.textContent = parts.join(' • ');
  });
}

export default initQuizPage;
