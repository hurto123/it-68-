const DEFAULT_TIME_LIMIT = 10 * 60; // seconds

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
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normaliseAnswer(value) {
  if (value === undefined || value === null) return "";
  return value.toString().trim().toLowerCase();
}

function fmtSeconds(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60).toString().padStart(2, "0");
  const secs = (s % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`ไม่สามารถโหลดไฟล์ ${path} (status ${res.status})`);
  }
  return res.json();
}

function resolveRelative(baseUrl, relativePath) {
  try {
    const url = new URL(relativePath, baseUrl);
    return url.href;
  } catch (err) {
    return relativePath;
  }
}

function buildPreflightTemplate(labels) {
  return `
    <section class="quiz-preflight" aria-labelledby="preflight-title">
      <header>
        <h2 id="preflight-title">เริ่มทำแบบฝึกหัด</h2>
        <p class="muted" id="preflight-desc"></p>
      </header>
      <div class="preflight-grid">
        <article class="stat-card" aria-live="polite">
          <h3>คลังข้อสอบ</h3>
          <p class="stat" id="stat-question-count">–</p>
          <p class="muted small">ข้อที่พร้อมใช้งาน</p>
        </article>
        <article class="stat-card">
          <h3>โหมด</h3>
          <label class="control">
            <span>เลือกโหมด</span>
            <select id="mode-select">
              <option value="practice">${labels.practice}</option>
              <option value="quiz">${labels.quiz}</option>
            </select>
          </label>
          <label class="control" id="count-wrapper">
            <span>จำนวนข้อที่ต้องการ</span>
            <input id="question-count" type="number" min="1" value="5" />
          </label>
        </article>
        <article class="stat-card" id="config-card">
          <h3>ตั้งค่า Quiz</h3>
          <dl>
            <div>
              <dt>เวลาที่กำหนด</dt>
              <dd id="stat-time-limit">–</dd>
            </div>
            <div>
              <dt>ผ่านเมื่อ</dt>
              <dd id="stat-passing">–</dd>
            </div>
          </dl>
        </article>
      </div>
      <div class="preflight-actions">
        <button class="btn" id="btn-start">เริ่มทำ</button>
        <button class="btn ghost" id="btn-reload">รีเฟรชข้อมูล</button>
      </div>
      <div class="muted small" id="preflight-note"></div>
    </section>
  `;
}

function buildSessionTemplate() {
  return `
    <section class="quiz-session" id="quiz-session" hidden>
      <header class="session-header">
        <div class="progress" aria-live="polite">
          <span id="progress-label">ข้อที่ 0</span>
        </div>
        <div class="timer" id="timer" role="timer">--:--</div>
      </header>
      <div class="question-shell" id="question-shell"></div>
      <div class="feedback" id="feedback" aria-live="polite"></div>
      <footer class="session-controls">
        <div class="left">
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
    return normaliseAnswer(question.answer) === normaliseAnswer(rawAnswer);
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
    this.allowedModes = Array.isArray(options.allowedModes) && options.allowedModes.length
      ? options.allowedModes
      : ["practice", "quiz"];
    this.defaultMode = this.allowedModes.includes(options.defaultMode)
      ? options.defaultMode
      : (this.allowedModes[0] || "practice");
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

    this.applyModeConstraints();
  }

  applyModeConstraints() {
    const select = this.modeSelect;
    if (!select) return;
    const allowed = this.allowedModes;
    const options = Array.from(select.options);
    options.forEach((opt) => {
      if (!allowed.includes(opt.value)) {
        opt.remove();
      }
    });
    if (!allowed.length) {
      const fallback = document.createElement("option");
      fallback.value = "practice";
      fallback.textContent = this.labels.practice;
      select.appendChild(fallback);
      allowed.push("practice");
    }
    if (!allowed.includes(this.defaultMode)) {
      this.defaultMode = allowed[0];
    }
    select.value = this.defaultMode;
    if (allowed.length === 1) {
      select.disabled = true;
      select.classList.add("quiz-single-mode");
    }
    if (allowed.length === 1 && allowed[0] === "practice") {
      this.configCard.hidden = true;
    }
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
    }
    const baseUrl = new URL(this.configPath, window.location.href).href;
    this.loadingPromise = (async () => {
      const config = await fetchJSON(this.configPath);
      this.config = config;
      const meta = config.meta || {};
      this.meta = meta;
      const rawSources = Array.isArray(config.sources)
        ? config.sources
        : (config.sources ? [config.sources] : []);
      this.sources = rawSources.map((source) => ({
        lesson: source.lesson || meta.lesson || "",
        title: source.title || meta.title || "",
        questions: resolveRelative(baseUrl, source.questions || source.question || ""),
        solutions: resolveRelative(baseUrl, source.solutions || ""),
        weight: source.weight || 1
      }));

      const results = await Promise.all(this.sources.map(async (source) => {
        const [questionData, solutionData] = await Promise.all([
          source.questions ? fetchJSON(source.questions) : Promise.resolve(null),
          source.solutions ? fetchJSON(source.solutions).catch(() => ({ items: [] })) : Promise.resolve({ items: [] })
        ]);
        return { source, questionData, solutionData };
      }));

      const questions = [];
      const solutionMap = new Map();

      results.forEach(({ source, questionData, solutionData }) => {
        if (!questionData || !Array.isArray(questionData.items)) return;
        questionData.items.forEach((item) => {
          const question = {
            ...item,
            lesson: source.lesson || questionData.meta?.lesson,
            lessonTitle: questionData.meta?.title || source.title || this.meta?.title || "",
          };
          questions.push(question);
        });
        if (solutionData && Array.isArray(solutionData.items)) {
          solutionData.items.forEach((sol) => {
            solutionMap.set(sol.question_id || sol.id, sol);
          });
        }
      });

      const supportedTypes = new Set(["mcq", "short_answer"]);
      const supportedQuestions = questions.filter((item) => supportedTypes.has(item.type));
      this.state.unsupportedCount = questions.length - supportedQuestions.length;
      this.state.questions = supportedQuestions;
      this.state.solutions = solutionMap;
      this.onDataLoaded();
    })();

    return this.loadingPromise;
  }

  onDataLoaded() {
    const total = this.state.questions.length;
    this.statQuestionCount.textContent = total.toString();
    this.countInput.max = Math.max(1, total);
    this.countInput.value = Math.min(parseInt(this.countInput.value || "5", 10), Math.max(1, total));

    const config = this.config.config || {};
    const timeLimit = config.time_limit_seconds ?? DEFAULT_TIME_LIMIT;
    const configuredItems = config.items_per_quiz ?? total;
    const itemsPerQuiz = total ? Math.min(configuredItems, total) : configuredItems;
    const basePassing = config.passing_score ?? Math.ceil((configuredItems || total || 1) * 0.6);
    const effectivePassing = total ? Math.min(basePassing, itemsPerQuiz) : basePassing;

    this.statTimeLimit.textContent = timeLimit ? `${Math.round(timeLimit / 60)} นาที` : "–";
    this.statPassing.textContent = total
      ? `${effectivePassing} ข้อ (จาก ${itemsPerQuiz} ข้อ)`
      : `${basePassing} ข้อ`;

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
    const shuffleEnabled = config.shuffle !== false;
    const ordered = shuffleEnabled ? shuffle(available) : available;
    const count = mode === "practice"
      ? Math.min(desired, ordered.length)
      : Math.min(desired, ordered.length, config.items_per_quiz || ordered.length);

    this.state.mode = mode;
    this.state.order = ordered.slice(0, count);
    this.state.currentIndex = 0;
    this.state.answers = {};
    this.state.checked = new Set();
    this.state.results = [];
    this.state.attemptStartedAt = new Date();
    this.state.attemptFinished = null;
    this.feedbackEl.innerHTML = "";
    this.summarySection.hidden = true;

    this.preflightSection.hidden = true;
    this.sessionSection.hidden = false;
    this.sessionSection.dataset.mode = mode;

    if (mode === "quiz") {
      const timeLimit = this.config.config?.time_limit_seconds ?? DEFAULT_TIME_LIMIT;
      this.state.remainingSeconds = timeLimit;
      this.updateTimerDisplay();
      this.startTimer();
      this.btnCheck.hidden = true;
      this.btnFinishPractice.hidden = true;
      this.btnSubmit.hidden = false;
      this.btnPrev.hidden = false;
      this.btnNext.hidden = false;
    } else {
      this.clearTimer();
      this.timerEl.textContent = "โหมดฝึก (ไม่มีจับเวลา)";
      this.btnCheck.hidden = false;
      this.btnFinishPractice.hidden = false;
      this.btnSubmit.hidden = true;
      this.btnPrev.hidden = true;
      this.btnNext.hidden = false;
      this.btnFinishPractice.disabled = true;
    }

    this.renderCurrentQuestion();
    this.mount.dispatchEvent(new CustomEvent("quiz:started", {
      detail: {
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
        label.appendChild(span);
        item.appendChild(label);
        list.appendChild(item);
      });
      body.appendChild(list);
    } else if (question.type === "short_answer") {
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
    if (answer === undefined || answer === "") {
      this.feedbackEl.textContent = "โปรดเลือกหรือกรอกคำตอบก่อน";
      return;
    }
    const correct = evaluateQuestion(question, answer);
    this.state.checked.add(question.id);
    if (correct) {
      this.feedbackEl.innerHTML = `<div class="callout success">ตอบถูกต้อง! ✅</div>`;
    } else {
      this.feedbackEl.innerHTML = `<div class="callout danger">ตอบยังไม่ถูก ลองอ่านเฉลยด้านล่าง 👇</div>`;
    }
    this.renderSolution(question, correct);
    this.btnNext.disabled = this.state.currentIndex >= this.state.order.length - 1;
    const allChecked = this.state.order.every((item) => this.state.checked.has(item.id));
    this.btnFinishPractice.disabled = !allChecked;
  }

  renderSolution(question, correct) {
    const solution = this.state.solutions.get(question.id);
    const wrapper = createElement("div", { className: "solution" });
    const answerText = solution?.final_answer ?? question.answer ?? "–";
    wrapper.appendChild(createElement("p", {
      className: "solution-answer",
      html: `คำตอบที่ถูกต้อง: <strong>${answerText}</strong>`
    }));
    if (solution?.why) {
      wrapper.appendChild(createElement("p", {
        className: "solution-why",
        text: solution.why
      }));
    }
    if (Array.isArray(solution?.steps) && solution.steps.length) {
      const list = createElement("ol", { className: "solution-steps" });
      solution.steps.forEach((step) => {
        list.appendChild(createElement("li", { text: step }));
      });
      wrapper.appendChild(list);
    }
    if (!correct && !solution) {
      wrapper.appendChild(createElement("p", {
        className: "muted",
        text: "ยังไม่มีคำอธิบายละเอียดสำหรับคำถามนี้"
      }));
    }
    this.feedbackEl.appendChild(wrapper);
  }

  finishPractice() {
    const total = this.state.order.length;
    const checkedCount = this.state.checked.size;
    if (checkedCount < total) {
      this.feedbackEl.innerHTML = `<div class="callout warn">คุณยังตรวจคำตอบไม่ครบทุกข้อ (${checkedCount}/${total})</div>`;
      return;
    }
    let correct = 0;
    this.state.order.forEach((question) => {
      const answer = this.state.answers[question.id];
      if (evaluateQuestion(question, answer)) {
        correct += 1;
      }
    });
    this.state.attemptFinished = new Date();
    this.showSummary({
      mode: "practice",
      total,
      correct,
      duration: this.getAttemptDuration(),
      details: this.state.order.map((question) => ({
        question,
        answer: this.state.answers[question.id],
        correct: evaluateQuestion(question, this.state.answers[question.id])
      }))
    });
  }

  finishQuiz(reason = "submit") {
    this.clearTimer();
    const total = this.state.order.length;
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
}
