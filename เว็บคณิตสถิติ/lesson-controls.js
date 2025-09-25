(function () {
  const summaryChapters = [
    { file: 'summary-lesson11.html', label: 'บทที่ 11', title: 'รู้จักการประมาณค่า' },
    { file: 'summary-lesson12.html', label: 'บทที่ 12', title: 'หัวใจของการประมาณค่าแบบช่วง' },
    { file: 'summary-lesson13.html', label: 'บทที่ 13', title: 'การประมาณค่าเฉลี่ย 1 กลุ่ม' },
    { file: 'summary-lesson14.html', label: 'บทที่ 14', title: 'การประมาณค่าสัดส่วนประชากรเดียว' },
    { file: 'summary-lesson15.html', label: 'บทที่ 15', title: 'การประมาณค่าผลต่างของสองประชากร' },
    { file: 'summary-lesson16.html', label: 'บทที่ 16', title: 'การคำนวณขนาดตัวอย่าง' },
    { file: 'summary-lesson17.html', label: 'บทที่ 17', title: 'พื้นฐานการทดสอบสมมติฐาน' },
    { file: 'summary-lesson18.html', label: 'บทที่ 18', title: 'ประเภทของการทดสอบตามทิศทาง' },
    { file: 'summary-lesson19.html', label: 'บทที่ 19', title: 'การทดสอบค่าเฉลี่ย 1 กลุ่ม' },
    { file: 'summary-lesson20.html', label: 'บทที่ 20', title: 'การทดสอบสัดส่วน 1 กลุ่ม' },
    { file: 'summary-lesson21.html', label: 'บทที่ 21', title: 'การทดสอบเพื่อเปรียบเทียบ 2 ประชากร' },
    { file: 'summary-lesson22.html', label: 'บทที่ 22', title: 'การทดสอบเกี่ยวกับความแปรปรวน' }
  ];

  const lessonChapters = [
    {
      file: 'lesson11.html',
      label: 'บทที่ 11',
      title: 'รู้จักการประมาณค่า',
      summary: 'summary-lesson11.html',
      quiz: 'quiz-lesson11.html'
    },
    {
      file: 'lesson12.html',
      label: 'บทที่ 12',
      title: 'หัวใจของการประมาณค่าแบบช่วง',
      summary: 'summary-lesson12.html',
      quiz: 'quiz-lesson12.html'
    },
    {
      file: 'lesson13.html',
      label: 'บทที่ 13',
      title: 'การประมาณค่าเฉลี่ย 1 กลุ่ม',
      summary: 'summary-lesson13.html',
      quiz: 'quiz-lesson13.html'
    },
    {
      file: 'lesson14.html',
      label: 'บทที่ 14',
      title: 'การประมาณค่าสัดส่วนประชากรเดียว',
      summary: 'summary-lesson14.html',
      quiz: 'quiz-lesson14.html'
    },
    {
      file: 'lesson15.html',
      label: 'บทที่ 15',
      title: 'การประมาณค่าผลต่างของสองประชากร',
      summary: 'summary-lesson15.html',
      quiz: 'quiz-lesson15.html'
    },
    {
      file: 'lesson16.html',
      label: 'บทที่ 16',
      title: 'การคำนวณขนาดตัวอย่าง',
      summary: 'summary-lesson16.html',
      quiz: 'quiz-lesson16.html'
    },
    {
      file: 'lesson17.html',
      label: 'บทที่ 17',
      title: 'พื้นฐานการทดสอบสมมติฐาน',
      summary: 'summary-lesson17.html',
      quiz: 'quiz-lesson17.html'
    },
    {
      file: 'lesson18.html',
      label: 'บทที่ 18',
      title: 'ประเภทของการทดสอบตามทิศทาง',
      summary: 'summary-lesson18.html',
      quiz: 'quiz-lesson18.html'
    },
    {
      file: 'lesson19.html',
      label: 'บทที่ 19',
      title: 'การทดสอบค่าเฉลี่ย 1 กลุ่ม',
      summary: 'summary-lesson19.html',
      quiz: 'quiz-lesson19.html'
    },
    {
      file: 'lesson20.html',
      label: 'บทที่ 20',
      title: 'การทดสอบสัดส่วน 1 กลุ่ม',
      summary: 'summary-lesson20.html',
      quiz: 'quiz-lesson20.html'
    },
    {
      file: 'lesson21.html',
      label: 'บทที่ 21',
      title: 'การทดสอบผลต่างสองกลุ่ม',
      summary: 'summary-lesson21.html',
      quiz: 'quiz-lesson21.html'
    },
    {
      file: 'lesson22.html',
      label: 'บทที่ 22',
      title: 'การทดสอบเกี่ยวกับความแปรปรวน',
      summary: 'summary-lesson22.html',
      quiz: 'quiz-lesson22.html'
    }
  ];

  const filename = (() => {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || 'index.html';
  })();

  const currentSummaryIndex = summaryChapters.findIndex((chapter) => chapter.file === filename);
  const bodyLessonId = document.body?.dataset?.lesson || null;
  const currentLessonIndex = lessonChapters.findIndex((chapter) => chapter.file === filename || chapter.file === `${bodyLessonId || ''}.html`);

  if (currentSummaryIndex === -1 && currentLessonIndex === -1) return;

  const createSummaryNavLink = (chapter, label, extraClass) => {
    const element = document.createElement(chapter ? 'a' : 'span');
    element.className = `summary-footnav__link ${extraClass || ''}`.trim();

    const labelEl = document.createElement('span');
    labelEl.className = 'summary-footnav__label';
    labelEl.textContent = label;

    const titleEl = document.createElement('span');
    titleEl.className = 'summary-footnav__title';

    if (chapter) {
      element.href = chapter.file;
      titleEl.textContent = `${chapter.label} — ${chapter.title}`;
    } else {
      element.classList.add('summary-footnav__link--disabled');
      element.setAttribute('aria-disabled', 'true');
      titleEl.textContent = '—';
    }

    element.append(labelEl, titleEl);
    return element;
  };

  const buildNavigation = () => {
    if (currentSummaryIndex === -1) return;
    const chapters = summaryChapters;
    const current = chapters[currentSummaryIndex];
    const prev = chapters[currentSummaryIndex - 1] || null;
    const next = chapters[currentSummaryIndex + 1] || null;
    const main = document.querySelector('main') || document.body;
    if (!main) return;

    const nav = document.createElement('nav');
    nav.className = 'summary-footnav';
    nav.setAttribute('aria-label', 'นำทางระหว่างบทสรุปบทที่ 11–22');

    const grid = document.createElement('div');
    grid.className = 'summary-footnav__grid';
    grid.append(
      createSummaryNavLink(prev, 'บทก่อนหน้า', 'is-prev'),
      createSummaryNavLink(next, 'บทถัดไป', 'is-next')
    );

    const extras = document.createElement('div');
    extras.className = 'summary-footnav__extras';

    const selectId = 'summary-footnav-select';
    const selectLabel = document.createElement('label');
    selectLabel.className = 'summary-footnav__label';
    selectLabel.setAttribute('for', selectId);
    selectLabel.textContent = 'ไปบทอื่น:';

    const select = document.createElement('select');
    select.className = 'summary-footnav__select';
    select.id = selectId;
    chapters.forEach((chapter) => {
      const option = document.createElement('option');
      option.value = chapter.file;
      option.textContent = `${chapter.label} — ${chapter.title}`;
      if (chapter.file === current.file) option.selected = true;
      select.append(option);
    });

    select.addEventListener('change', (event) => {
      const value = event.target.value;
      if (value && value !== current.file) {
        window.location.href = value;
      }
    });

    const backLink = document.createElement('a');
    backLink.className = 'summary-footnav__back';
    backLink.href = 'summaries-all.html#inference';
    backLink.textContent = 'กลับหน้ารวมสรุป Inference';

    extras.append(selectLabel, select, backLink);
    nav.append(grid, extras);

    main.append(nav);
  };

  document.addEventListener('DOMContentLoaded', buildNavigation);

  const buildLessonNavigation = () => {
    if (currentLessonIndex === -1) return;
    const chapters = lessonChapters;
    const current = chapters[currentLessonIndex];
    const prev = chapters[currentLessonIndex - 1] || null;
    const next = chapters[currentLessonIndex + 1] || null;

    const main = document.querySelector('main');
    if (!main) return;

    const container = document.createElement('aside');
    container.className = 'lesson-navigation';

    const grid = document.createElement('div');
    grid.className = 'lesson-nav-grid';

    const createCard = (chapter, label) => {
      const card = document.createElement(chapter ? 'a' : 'span');
      card.className = 'lesson-nav-card';
      if (!chapter) {
        card.classList.add('is-disabled');
        card.innerHTML = `<span class="label">${label}</span><span class="title">—</span>`;
        return card;
      }
      card.href = chapter.file;
      card.innerHTML = `<span class="label">${label}</span><span class="title">${chapter.label} — ${chapter.title}</span>`;
      return card;
    };

    grid.append(
      createCard(prev, 'บทก่อนหน้า'),
      createCard(next, 'บทถัดไป')
    );

    const extras = document.createElement('div');
    extras.className = 'lesson-nav-extra';

    const select = document.createElement('select');
    select.className = 'lesson-select';
    lessonChapters.forEach((chapter) => {
      const option = document.createElement('option');
      option.value = chapter.file;
      option.textContent = `${chapter.label} — ${chapter.title}`;
      if (chapter.file === current.file) option.selected = true;
      select.append(option);
    });
    select.addEventListener('change', (event) => {
      const target = event.target.value;
      if (target && target !== current.file) {
        window.location.href = target;
      }
    });

    const summaryLink = document.createElement('a');
    summaryLink.className = 'btn secondary';
    summaryLink.href = current.summary;
    summaryLink.textContent = 'ดูสรุปบทนี้';

    const quizLink = document.createElement('a');
    quizLink.className = 'btn ghost';
    quizLink.href = current.quiz;
    quizLink.textContent = 'ทำ Quiz บทนี้';

    extras.append(select, summaryLink, quizLink);

    container.append(grid, extras);
    main.append(container);
  };

  document.addEventListener('DOMContentLoaded', buildLessonNavigation);
})();
