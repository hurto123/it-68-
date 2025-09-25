(function () {
  const body = document.body;
  if (!body || !body.dataset.lesson) return;
  const lessonId = body.dataset.lesson;
  if (!/^(lesson1[1-9]|lesson2[0-2])$/.test(lessonId)) return;

  const summaryFile = `summary-${lessonId}.html`;
  const mount = document.getElementById('lesson-content');
  if (!mount) return;

  fetch(summaryFile)
    .then((response) => {
      if (!response.ok) throw new Error(`โหลด ${summaryFile} ไม่สำเร็จ`);
      return response.text();
    })
    .then((htmlText) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const main = doc.querySelector('main');
      if (!main) return;
      const fragment = document.createDocumentFragment();
      Array.from(main.children).forEach((section) => {
        const cloned = section.cloneNode(true);
        cloned.classList.add('lesson-section');
        fragment.appendChild(cloned);
      });
      mount.replaceChildren(fragment);
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise([mount]).catch((err) => console.warn('MathJax render error', err));
      }
    })
    .catch((error) => {
      console.error('[inference-lesson-loader]', error);
      const errorBox = document.createElement('div');
      errorBox.className = 'lesson-section lesson-callout warn';
      errorBox.textContent = 'ไม่สามารถโหลดเนื้อหาบทสรุปได้ กรุณาลองใหม่อีกครั้ง';
      mount.replaceChildren(errorBox);
    });
})();
