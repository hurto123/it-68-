import { QuizPlayer } from './quiz-player.js';
import ensurePwaLinks from './pwa-helpers.js';

ensurePwaLinks();

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
