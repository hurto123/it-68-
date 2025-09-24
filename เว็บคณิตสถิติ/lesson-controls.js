(function () {
  const chapters = [
    { file: 'summary-lesson11.html', label: 'บทที่ 11', title: 'รู้จักการประมาณค่า' },
    { file: 'summary-lesson12.html', label: 'บทที่ 12', title: 'หัวใจของการประมาณค่าแบบช่วง' },
    { file: 'summary-lesson13.html', label: 'บทที่ 13', title: 'การประมาณค่าเฉลี่ย 1 กลุ่ม' },
    { file: 'summary-lesson14.html', label: 'บทที่ 14', title: 'การประมาณค่าสัดส่วนประชากรเดียว' },
    { file: 'summary-lesson15.html', label: 'บทที่ 15', title: 'การประมาณค่าผลต่างของสองประชากร' },
    { file: 'summary-lesson16.html', label: 'บทที่ 16', title: 'การคำนวณขนาดตัวอย่าง' },
    { file: 'summary-lesson17.html', label: 'บทที่ 17', title: 'พื้นฐานการทดสอบสมมติฐาน' },
    { file: 'summary-lesson18.html', label: 'บทที่ 18', title: 'ประเภทของการทดสอบ (ทิศทาง)' },
    { file: 'summary-lesson19.html', label: 'บทที่ 19', title: 'การทดสอบค่าเฉลี่ย 1 กลุ่ม' },
    { file: 'summary-lesson20.html', label: 'บทที่ 20', title: 'การทดสอบสัดส่วน 1 กลุ่ม' },
    { file: 'summary-lesson21.html', label: 'บทที่ 21', title: 'การทดสอบเพื่อเปรียบเทียบ 2 ประชากร' },
    { file: 'summary-lesson22.html', label: 'บทที่ 22', title: 'การทดสอบเกี่ยวกับความแปรปรวน' }
  ];

  const filename = (() => {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || 'index.html';
  })();

  const currentIndex = chapters.findIndex((chapter) => chapter.file === filename);
  if (currentIndex === -1) return;

  const current = chapters[currentIndex];
  const prev = chapters[currentIndex - 1] || null;
  const next = chapters[currentIndex + 1] || null;

  const createNavLink = (chapter, label, extraClass) => {
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
    const main = document.querySelector('main') || document.body;
    if (!main) return;

    const nav = document.createElement('nav');
    nav.className = 'summary-footnav';
    nav.setAttribute('aria-label', 'นำทางระหว่างบทสรุปบทที่ 11–22');

    const grid = document.createElement('div');
    grid.className = 'summary-footnav__grid';
    grid.append(
      createNavLink(prev, 'บทก่อนหน้า', 'is-prev'),
      createNavLink(next, 'บทถัดไป', 'is-next')
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
})();
