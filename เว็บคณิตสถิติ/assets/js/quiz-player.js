const DEFAULT_TIME_LIMIT = 10 * 60; // seconds
const HISTORY_LIMIT = 20;
const HISTORY_KEY_PREFIX = 'quiz-history:';

function $(root, selector) {
  const el = root.querySelector(selector);
  if (!el) {
    throw new Error(`Element not found for selector: ${selector}`);
  }
  return el;
}

function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.html !== undefined) el.innerHTML = options.html;
  if (options.text !== undefined) el.textContent = options.text;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        el.setAttribute(k, v);
      }
    });
  }
  return el;
}

function shuffle(array) {
@@ -131,50 +133,58 @@ function buildSessionTemplate() {
          <button class="btn" id="btn-check">ตรวจคำตอบ</button>
        </div>
        <div class="right">
          <button class="btn secondary" id="btn-prev">ก่อนหน้า</button>
          <button class="btn secondary" id="btn-next">ถัดไป</button>
          <button class="btn" id="btn-submit">ส่งคำตอบ</button>
          <button class="btn" id="btn-finish-practice">สรุปผล</button>
        </div>
      </footer>
    </section>
  `;
}

function buildSummaryTemplate() {
  return `
    <section class="quiz-summary" id="quiz-summary" hidden>
      <header>
        <h2>ผลการทำแบบฝึกหัด</h2>
        <p class="muted" id="summary-meta"></p>
      </header>
      <div class="summary-score" id="summary-score"></div>
      <div class="summary-actions">
        <button class="btn" id="btn-retry">ทำซ้ำอีกครั้ง</button>
        <button class="btn secondary" id="btn-back-to-preflight">กลับไปตั้งค่า</button>
      </div>
      <section class="summary-history" id="summary-history" aria-live="polite">
        <header class="summary-history__header">
          <h3 id="summary-history-title">ประวัติคะแนนล่าสุด</h3>
          <button class="btn tertiary" type="button" id="btn-clear-history">ล้างประวัติ</button>
        </header>
        <p class="muted small" id="summary-history-empty">ยังไม่มีบันทึก ลองทำแบบฝึกหัดเพื่อเก็บสถิติ</p>
        <ol class="summary-history__list" id="summary-history-list" aria-labelledby="summary-history-title"></ol>
      </section>
      <details class="summary-details" id="summary-details">
        <summary>ดูรายละเอียดคำตอบ</summary>
        <div id="summary-list"></div>
      </details>
    </section>
  `;
}

function buildErrorTemplate(message) {
  return `
    <section class="quiz-error" role="alert">
      <h2>เกิดข้อผิดพลาด</h2>
      <p>${message}</p>
      <button class="btn" id="btn-error-retry">ลองโหลดใหม่</button>
    </section>
  `;
}

function evaluateQuestion(question, rawAnswer) {
  if (!question) return false;
  if (rawAnswer === undefined || rawAnswer === null || rawAnswer === "") return false;
  if (question.type === "mcq") {
    return question.answer === rawAnswer;
  }
  if (question.type === "short_answer") {
@@ -182,116 +192,131 @@ function evaluateQuestion(question, rawAnswer) {
  }
  return false;
}

export class QuizPlayer {
  constructor(options) {
    this.mount = options.mount;
    this.configPath = options.configPath;
    this.links = options.links || {};
    this.labels = {
      practice: options.practiceLabel || "โหมดฝึก (เฉลยทันที)",
      quiz: options.quizLabel || "โหมด Quiz (จับเวลา)"
    };
    this.state = {
      mode: "practice",
      questions: [],
      solutions: new Map(),
      order: [],
      currentIndex: 0,
      answers: {},
      checked: new Set(),
      timerId: null,
      remainingSeconds: 0,
      attemptStartedAt: null,
      attemptFinished: null,
      results: []
      results: [],
      history: []
    };
  }

  async init() {
    this.mount.innerHTML = `
      ${buildPreflightTemplate(this.labels)}
      ${buildSessionTemplate()}
      ${buildSummaryTemplate()}
    `;
    this.cacheElements();
    this.bindPreflightEvents();
    try {
      await this.loadConfig();
    } catch (error) {
      this.showError(error.message);
    }
  }

  cacheElements() {
    this.preflightSection = $(this.mount, ".quiz-preflight");
    this.sessionSection = $(this.mount, "#quiz-session");
    this.summarySection = $(this.mount, "#quiz-summary");

    this.statQuestionCount = $(this.mount, "#stat-question-count");
    this.statTimeLimit = $(this.mount, "#stat-time-limit");
    this.statPassing = $(this.mount, "#stat-passing");
    this.preflightDesc = $(this.mount, "#preflight-desc");
    this.preflightNote = $(this.mount, "#preflight-note");
    this.modeSelect = $(this.mount, "#mode-select");
    this.countInput = $(this.mount, "#question-count");
    this.startButton = $(this.mount, "#btn-start");
    this.reloadButton = $(this.mount, "#btn-reload");
    this.configCard = $(this.mount, "#config-card");
    this.preflightTitle = $(this.mount, '#preflight-title');
    if (this.preflightTitle) {
      this.preflightTitle.setAttribute('tabindex', '-1');
    }

    this.timerEl = $(this.mount, "#timer");
    this.progressLabel = $(this.mount, "#progress-label");
    this.questionShell = $(this.mount, "#question-shell");
    this.feedbackEl = $(this.mount, "#feedback");

    this.btnCheck = $(this.mount, "#btn-check");
    this.btnPrev = $(this.mount, "#btn-prev");
    this.btnNext = $(this.mount, "#btn-next");
    this.btnSubmit = $(this.mount, "#btn-submit");
    this.btnFinishPractice = $(this.mount, "#btn-finish-practice");

    this.summaryMeta = $(this.mount, "#summary-meta");
    this.summaryScore = $(this.mount, "#summary-score");
    this.summaryDetails = $(this.mount, "#summary-details");
    this.summaryList = $(this.mount, "#summary-list");
    this.summaryRetry = $(this.mount, "#btn-retry");
    this.summaryBack = $(this.mount, "#btn-back-to-preflight");
    this.summaryHeading = this.summarySection.querySelector('h2');
    if (this.summaryHeading) {
      this.summaryHeading.setAttribute('tabindex', '-1');
    }
    this.summaryHistorySection = $(this.mount, '#summary-history');
    this.summaryHistorySection.setAttribute('tabindex', '-1');
    this.summaryHistoryEmpty = $(this.mount, '#summary-history-empty');
    this.summaryHistoryList = $(this.mount, '#summary-history-list');
    this.summaryHistoryClear = $(this.mount, '#btn-clear-history');
  }

  bindPreflightEvents() {
    this.modeSelect.addEventListener("change", () => this.updateModeUI());
    this.startButton.addEventListener("click", () => this.startAttempt());
    this.reloadButton.addEventListener("click", () => this.reloadData());

    this.btnCheck.addEventListener("click", () => this.checkCurrentQuestion());
    this.btnPrev.addEventListener("click", () => this.gotoQuestion(this.state.currentIndex - 1));
    this.btnNext.addEventListener("click", () => this.gotoQuestion(this.state.currentIndex + 1));
    this.btnSubmit.addEventListener("click", () => this.finishQuiz());
    this.btnFinishPractice.addEventListener("click", () => this.finishPractice());
    this.summaryRetry.addEventListener("click", () => this.retryAttempt());
    this.summaryBack.addEventListener("click", () => this.backToPreflight());
    this.summaryHistoryClear.addEventListener('click', () => this.clearHistory());
  }

  async reloadData() {
    this.startButton.disabled = true;
    this.preflightNote.textContent = "กำลังโหลดข้อมูลล่าสุด…";
    try {
      await this.loadConfig(true);
    } catch (error) {
      this.showError(error.message);
    }
  }

  showError(message) {
    this.mount.innerHTML = buildErrorTemplate(message);
    const retryBtn = this.mount.querySelector("#btn-error-retry");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        this.init();
      });
    }
  }

  async loadConfig(force = false) {
    if (this.loadingPromise && !force) {
      return this.loadingPromise;
@@ -372,50 +397,52 @@ export class QuizPlayer {

    const updatedAt = this.meta?.updated_at ? `อัปเดตล่าสุด ${this.meta.updated_at}` : "";
    const version = this.meta?.version ? `เวอร์ชัน ${this.meta.version}` : "";
    this.preflightDesc.textContent = [this.meta?.title, version, updatedAt].filter(Boolean).join(" • ");

    if (!total) {
      this.startButton.disabled = true;
      this.preflightNote.textContent = "ยังไม่มีข้อสอบในบทนี้ โปรดกลับมาใหม่อีกครั้ง";
    } else {
      this.startButton.disabled = false;
      let note = "พร้อมเริ่มทำเมื่อไรก็ได้ เลือกโหมดและจำนวนข้อก่อนกดเริ่ม";
      if (this.state.unsupportedCount) {
        note += ` • ตัดคำถามที่ยังไม่รองรับออก ${this.state.unsupportedCount} ข้อ`;
      }
      this.preflightNote.textContent = note;
    }
    this.mount.dispatchEvent(new CustomEvent("quiz:data-ready", {
      detail: {
        meta: this.meta,
        config: this.config,
        totalQuestions: total,
        unsupported: this.state.unsupportedCount
      }
    }));
    this.updateModeUI();
    this.state.history = this.loadHistory();
    this.updateHistoryUI();
  }

  updateModeUI() {
    const mode = this.modeSelect.value;
    const total = this.state.questions.length;
    if (mode === "practice") {
      this.countInput.value = Math.min(total || 1, Math.max(1, parseInt(this.countInput.value || "5", 10)));
      this.countInput.removeAttribute("max");
      this.configCard.classList.add("practice-only");
    } else {
      const max = Math.max(1, Math.min(total || 1, this.config?.config?.items_per_quiz || total));
      this.countInput.max = max;
      this.countInput.value = Math.min(max, Math.max(1, parseInt(this.countInput.value || String(max), 10)));
      this.configCard.classList.remove("practice-only");
    }
  }

  startAttempt() {
    if (!this.state.questions.length) return;
    const mode = this.modeSelect.value;
    const desired = parseInt(this.countInput.value, 10) || 1;
    const available = this.state.questions.slice();
    if (!available.length) return;

    const config = this.config.config || {};
@@ -467,72 +494,83 @@ export class QuizPlayer {
        mode,
        total: count
      }
    }));
  }

  retryAttempt() {
    if (this.state.mode === "quiz") {
      this.backToPreflight(false);
      this.startAttempt();
    } else {
      this.backToPreflight(false);
      this.startAttempt();
    }
  }

  backToPreflight(resetSelection = true) {
    this.clearTimer();
    this.sessionSection.hidden = true;
    this.summarySection.hidden = true;
    this.preflightSection.hidden = false;
    if (resetSelection) {
      this.modeSelect.value = "practice";
      this.updateModeUI();
    }
    if (this.preflightTitle) {
      requestAnimationFrame(() => {
        this.preflightTitle.focus({ preventScroll: true });
      });
    }
  }

  renderCurrentQuestion() {
    const index = this.state.currentIndex;
    const total = this.state.order.length;
    const question = this.state.order[index];
    if (!question) {
      this.questionShell.innerHTML = "<p>ไม่พบคำถาม</p>";
      return;
    }

    this.progressLabel.textContent = `ข้อที่ ${index + 1} / ${total}`;

    const container = createElement("article", { className: "question-card" });
    container.setAttribute("data-question-id", question.id || "");

    const metaChips = [];
    if (question.lessonTitle) metaChips.push(question.lessonTitle);
    if (question.topic) metaChips.push(`หัวข้อ: ${question.topic}`);
    if (typeof question.difficulty === "number") metaChips.push(`ระดับ: ${question.difficulty}`);

    container.appendChild(createElement("h3", { text: question.prompt || "(ไม่มีคำถาม)" }));
    const heading = createElement("h3", { text: question.prompt || "(ไม่มีคำถาม)" });
    const headingId = `question-${question.id || index}`;
    heading.id = headingId;
    container.appendChild(heading);
    container.setAttribute('tabindex', '-1');
    container.setAttribute('role', 'group');
    container.setAttribute('aria-labelledby', headingId);
    if (metaChips.length) {
      container.appendChild(createElement("p", { className: "question-meta", text: metaChips.join(" • ") }));
    }

    const body = createElement("div", { className: "question-body" });
    if (question.type === "mcq" && Array.isArray(question.choices)) {
      const list = createElement("ul", { className: "options" });
      question.choices.forEach((choice) => {
        const item = createElement("li");
        const id = `${question.id}-${choice.key}`;
        const label = createElement("label", { className: "option" });
        const input = createElement("input", {
          attrs: { type: "radio", name: question.id, value: choice.key, id }
        });
        input.addEventListener("change", () => {
          this.state.answers[question.id] = choice.key;
          if (this.state.mode === "practice") {
            this.btnCheck.disabled = false;
          }
        });
        if (this.state.answers[question.id] === choice.key) {
          input.checked = true;
        }
        const span = createElement("span", { html: `<strong>${choice.key}.</strong> ${choice.text}` });
        label.appendChild(input);
@@ -545,50 +583,53 @@ export class QuizPlayer {
      const input = createElement("input", {
        className: "short-answer",
        attrs: {
          type: "text",
          value: this.state.answers[question.id] || "",
          placeholder: "พิมพ์คำตอบของคุณ"
        }
      });
      input.addEventListener("input", (event) => {
        this.state.answers[question.id] = event.target.value;
        if (this.state.mode === "practice") {
          this.btnCheck.disabled = !event.target.value.trim();
        }
      });
      body.appendChild(input);
    } else {
      body.appendChild(createElement("p", {
        className: "muted",
        text: "คำถามประเภทนี้ยังไม่รองรับในระบบทดลอง"
      }));
    }

    container.appendChild(body);
    this.questionShell.innerHTML = "";
    this.questionShell.appendChild(container);
    requestAnimationFrame(() => {
      container.focus({ preventScroll: true });
    });

    if (this.state.mode === "practice") {
      const answer = this.state.answers[question.id];
      this.btnCheck.disabled = !answer;
      this.btnNext.disabled = true;
      this.feedbackEl.innerHTML = "";
      this.btnFinishPractice.disabled = this.state.checked.size !== this.state.order.length;
    } else {
      this.btnNext.disabled = index >= total - 1;
      this.btnPrev.disabled = index <= 0;
      this.feedbackEl.innerHTML = "";
    }
  }

  gotoQuestion(targetIndex) {
    const clamped = clamp(targetIndex, 0, this.state.order.length - 1);
    if (clamped === this.state.currentIndex) return;
    this.state.currentIndex = clamped;
    this.renderCurrentQuestion();
  }

  checkCurrentQuestion() {
    const question = this.state.order[this.state.currentIndex];
    if (!question) return;
    const answer = this.state.answers[question.id];
@@ -673,100 +714,212 @@ export class QuizPlayer {
    let correct = 0;
    const details = this.state.order.map((question) => {
      const answer = this.state.answers[question.id];
      const isCorrect = evaluateQuestion(question, answer);
      if (isCorrect) correct += 1;
      return { question, answer, correct: isCorrect };
    });
    this.state.attemptFinished = new Date();
    const passingScore = this.config.config?.passing_score ?? Math.ceil(total * 0.6);
    const passed = correct >= Math.min(passingScore, total);
    this.showSummary({
      mode: "quiz",
      total,
      correct,
      passed,
      reason,
      duration: this.getAttemptDuration(),
      details
    });
  }

  showSummary(result) {
    this.sessionSection.hidden = true;
    this.summarySection.hidden = false;

    this.recordHistory(result);
    this.updateHistoryUI();

    const { mode, total, correct, duration, passed, reason, details } = result;
    const ratio = total ? Math.round((correct / total) * 100) : 0;
    const durationText = duration ? `${fmtSeconds(duration)} นาที:วินาที` : "–";
    const metaParts = [
      mode === "quiz" ? "โหมด Quiz" : "โหมดฝึก",
      `ทำไปทั้งหมด ${total} ข้อ`,
      `ใช้เวลา ${durationText}`
    ];
    if (mode === "quiz" && reason === "timeout") {
      metaParts.push("หมดเวลา");
    }
    this.summaryMeta.textContent = metaParts.join(" • ");

    let headline = `ได้ ${correct} / ${total} ข้อ (${ratio}%)`;
    if (mode === "quiz") {
      headline += passed ? " — ผ่านเกณฑ์ 🎉" : " — ยังไม่ผ่าน ลองใหม่อีกครั้ง";
    }
    this.summaryScore.innerHTML = `<p>${headline}</p>`;

    this.summaryList.innerHTML = "";
    details.forEach(({ question, answer, correct: isCorrect }) => {
      const row = createElement("article", { className: `summary-item ${isCorrect ? "correct" : "incorrect"}` });
      row.appendChild(createElement("h3", { text: question.prompt }));
      row.appendChild(createElement("p", { className: "muted", text: `คำตอบของคุณ: ${answer ?? "–"}` }));
      const solution = this.state.solutions.get(question.id);
      if (solution) {
        row.appendChild(createElement("p", { text: `เฉลย: ${solution.final_answer ?? question.answer ?? "–"}` }));
      }
      this.summaryList.appendChild(row);
    });
    this.mount.dispatchEvent(new CustomEvent("quiz:finished", {
      detail: {
        mode,
        total,
        correct,
        passed: mode === "quiz" ? passed : undefined,
        duration,
        reason
      }
    }));

    if (this.summaryHeading) {
      requestAnimationFrame(() => {
        this.summaryHeading.focus({ preventScroll: true });
      });
    }
  }

  startTimer() {
    this.clearTimer();
    this.timerEl.dataset.state = "running";
    this.timerEl.textContent = fmtSeconds(this.state.remainingSeconds);
    this.state.timerId = window.setInterval(() => {
      this.state.remainingSeconds -= 1;
      if (this.state.remainingSeconds <= 0) {
        this.timerEl.textContent = "00:00";
        this.clearTimer();
        this.finishQuiz("timeout");
      } else {
        this.updateTimerDisplay();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    this.timerEl.textContent = fmtSeconds(this.state.remainingSeconds);
  }

  clearTimer() {
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
      this.state.timerId = null;
    }
  }

  getAttemptDuration() {
    if (!this.state.attemptStartedAt) return 0;
    const end = this.state.attemptFinished || new Date();
    return Math.round((end - this.state.attemptStartedAt) / 1000);
  }

  getHistoryKey() {
    const lessonId = this.meta?.lesson || this.config?.meta?.lesson;
    const identifier = lessonId || this.meta?.title || this.configPath;
    return `${HISTORY_KEY_PREFIX}${identifier}`;
  }

  loadHistory() {
    const key = this.getHistoryKey();
    if (!key) return [];
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((entry) => entry && typeof entry.total === 'number' && typeof entry.correct === 'number')
        .slice(0, HISTORY_LIMIT);
    } catch (error) {
      console.warn('[quiz] ไม่สามารถอ่านประวัติจาก localStorage', error);
      return [];
    }
  }

  persistHistory(history) {
    const key = this.getHistoryKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
    } catch (error) {
      console.warn('[quiz] ไม่สามารถบันทึกประวัติลง localStorage', error);
    }
  }

  recordHistory(result) {
    if (!result) return;
    const entry = {
      ts: new Date().toISOString(),
      mode: result.mode,
      total: result.total,
      correct: result.correct,
      duration: result.duration,
      passed: result.mode === 'quiz' ? Boolean(result.passed) : undefined,
      reason: result.reason
    };
    const history = [entry, ...this.state.history].slice(0, HISTORY_LIMIT);
    this.state.history = history;
    this.persistHistory(history);
  }

  updateHistoryUI() {
    if (!this.summaryHistorySection || !this.summaryHistoryList || !this.summaryHistoryEmpty) {
      return;
    }
    const history = this.state.history || [];
    this.summaryHistoryEmpty.hidden = history.length > 0;
    if (this.summaryHistoryClear) {
      this.summaryHistoryClear.disabled = history.length === 0;
    }
    this.summaryHistoryList.innerHTML = '';
    history.forEach((entry, index) => {
      const item = createElement('li', { className: 'summary-history__item' });
      if (index === 0) {
        item.classList.add('summary-history__item--latest');
      }
      const timestamp = entry.ts ? new Date(entry.ts) : null;
      const timeText = timestamp
        ? timestamp.toLocaleString('th-TH', {
            dateStyle: 'medium',
            timeStyle: 'short'
          })
        : '—';
      const modeLabel = entry.mode === 'quiz' ? 'โหมด Quiz' : 'โหมดฝึก';
      const scoreText = `ได้ ${entry.correct}/${entry.total} ข้อ (${entry.total ? Math.round((entry.correct / entry.total) * 100) : 0}%)`;
      const metaBits = [modeLabel, timeText];
      if (entry.mode === 'quiz') {
        metaBits.push(entry.passed ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่าน');
        if (entry.reason === 'timeout') metaBits.push('หมดเวลา');
      }
      if (entry.duration) {
        metaBits.push(`ใช้เวลา ${fmtSeconds(entry.duration)}`);
      }
      item.appendChild(createElement('p', { className: 'summary-history__score', text: scoreText }));
      item.appendChild(createElement('p', { className: 'summary-history__meta muted small', text: metaBits.join(' • ') }));
      this.summaryHistoryList.appendChild(item);
    });
  }

  clearHistory() {
    this.state.history = [];
    const key = this.getHistoryKey();
    if (key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('[quiz] ไม่สามารถลบประวัติ', error);
      }
    }
    this.updateHistoryUI();
    if (this.summaryHistorySection && typeof this.summaryHistorySection.focus === 'function') {
      this.summaryHistorySection.focus({ preventScroll: true });
    }
  }
}
