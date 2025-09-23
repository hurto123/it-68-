(function () {
  const storageKey = 'reading-tools:v1';
  const defaultState = {
    fontScale: 100,
    lineHeight: 1.75,
    theme: 'default',
    serif: false,
    focus: false
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const loadState = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed };
      }
    } catch (err) {
      console.warn('[reading-tools] ไม่สามารถอ่าน localStorage:', err);
    }
    return { ...defaultState };
  };

  const saveState = (state) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (err) {
      console.warn('[reading-tools] ไม่สามารถบันทึก localStorage:', err);
    }
  };

  const slugify = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0e00-\u0e7f\-]/g, '');

  const createProgressBar = () => {
    const progress = document.createElement('div');
    progress.className = 'reading-progress';
    progress.innerHTML = '<div class="reading-progress__bar" role="presentation"></div>';
    document.body.append(progress);
    const bar = progress.querySelector('.reading-progress__bar');

    const update = () => {
      const main = document.querySelector('main') || document.body;
      const total = main.scrollHeight - window.innerHeight;
      const ratio = total > 0 ? clamp(window.scrollY / total, 0, 1) : 0;
      bar.style.transform = `scaleX(${ratio})`;
      progress.classList.toggle('reading-progress--visible', window.scrollY > 80);
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  };

  const createTOC = () => {
    const container = document.createElement('aside');
    container.className = 'reading-toc';
    container.setAttribute('aria-label', 'สารบัญเนื้อหา');
    container.innerHTML = `
      <div class="reading-toc__inner">
        <header class="reading-toc__header">
          <h2>สารบัญบทเรียน</h2>
          <button type="button" class="reading-toc__close" aria-label="ปิดสารบัญ">×</button>
        </header>
        <nav class="reading-toc__nav" aria-label="สารบัญ">
          <ol class="reading-toc__list"></ol>
        </nav>
      </div>
    `;
    document.body.append(container);

    const list = container.querySelector('.reading-toc__list');
    const closeBtn = container.querySelector('.reading-toc__close');
    const headings = Array.from((document.querySelector('main') || document.body).querySelectorAll('h2, h3'));

    const items = headings
      .filter((heading) => heading.id || heading.textContent.trim().length > 0)
      .map((heading) => {
        if (!heading.id) {
          let candidate = slugify(heading.textContent || 'section');
          if (!candidate) candidate = `section-${Math.random().toString(16).slice(2, 7)}`;
          let unique = candidate;
          let index = 1;
          while (document.getElementById(unique)) {
            unique = `${candidate}-${index++}`;
          }
          heading.id = unique;
        }
        const li = document.createElement('li');
        li.className = `reading-toc__item reading-toc__item--lvl-${heading.tagName === 'H2' ? '2' : '3'}`;
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.trim();
        link.addEventListener('click', () => {
          document.body.classList.remove('reading-toc-open');
          container.setAttribute('aria-hidden', 'true');
        });
        li.append(link);
        list.append(li);
        return { heading, link };
      });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          items.forEach(({ link, heading }) => {
            link.classList.toggle('is-active', heading === visible.target);
          });
        }
      },
      { rootMargin: '-55% 0px -35% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    items.forEach(({ heading }) => observer.observe(heading));

    const api = {
      open: () => {
        document.body.classList.add('reading-toc-open');
        container.setAttribute('aria-hidden', 'false');
        closeBtn.focus({ preventScroll: true });
      },
      close: () => {
        document.body.classList.remove('reading-toc-open');
        container.setAttribute('aria-hidden', 'true');
      },
      toggle: () => {
        if (document.body.classList.contains('reading-toc-open')) {
          api.close();
        } else {
          api.open();
        }
      },
      isEmpty: items.length === 0
    };

    closeBtn.addEventListener('click', api.close);
    container.addEventListener('click', (event) => {
      if (event.target === container) {
        api.close();
      }
    });

    if (items.length === 0) {
      container.classList.add('is-empty');
      container.setAttribute('aria-hidden', 'true');
    }

    return api;
  };

  const createToolbar = (state, onChange, tocApi) => {
    const toolbar = document.createElement('div');
    toolbar.className = 'reading-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'เครื่องมือช่วยอ่าน');

    const makeButton = (label, icon, handler) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'reading-toolbar__btn';
      btn.innerHTML = `<span class="reading-toolbar__icon">${icon}</span><span class="reading-toolbar__label">${label}</span>`;
      btn.addEventListener('click', handler);
      return btn;
    };

    const fontStatus = document.createElement('span');
    fontStatus.className = 'reading-toolbar__status';
    const updateFontStatus = () => {
      fontStatus.textContent = `ขนาด ${state.fontScale}%`;
    };

    const baseFontSize = parseFloat(getComputedStyle(document.body).fontSize) || 16;

    const applyState = () => {
      document.body.style.fontSize = `${(state.fontScale / 100) * baseFontSize}px`;
      document.body.style.lineHeight = state.lineHeight;
      document.body.classList.toggle('reading-serif', state.serif);
      document.body.classList.toggle('reading-high-contrast', state.theme === 'high');
      document.body.classList.toggle('reading-focus', state.focus);
      document.body.dataset.lineHeight = String(state.lineHeight);
      document.body.dataset.fontScale = String(state.fontScale);
      document.documentElement.style.setProperty('color-scheme', state.theme === 'high' ? 'dark light' : 'dark');
      updateFontStatus();
      onChange({ ...state });
    };

    const decreaseFont = makeButton('Aa−', '−', () => {
      state.fontScale = clamp(state.fontScale - 10, 90, 160);
      applyState();
    });

    const increaseFont = makeButton('Aa+', '+', () => {
      state.fontScale = clamp(state.fontScale + 10, 90, 160);
      applyState();
    });

    const toggleSpacing = makeButton('ระยะห่าง', '↕️', () => {
      state.lineHeight = state.lineHeight >= 1.9 ? 1.75 : 1.95;
      applyState();
    });

    const toggleSerif = makeButton('ฟอนต์', '𝓐', () => {
      state.serif = !state.serif;
      applyState();
    });

    const toggleTheme = makeButton('คอนทราสต์', '☀️', () => {
      state.theme = state.theme === 'high' ? 'default' : 'high';
      applyState();
    });

    const toggleFocus = makeButton('โหมดโฟกัส', '🎯', () => {
      state.focus = !state.focus;
      applyState();
    });

    const printBtn = makeButton('พิมพ์ PDF', '🖨️', () => {
      window.print();
    });

    const tocBtn = makeButton('สารบัญ', '📑', () => {
      if (tocApi) tocApi.toggle();
    });

    const toTopBtn = makeButton('ด้านบน', '⤴️', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    toolbar.append(
      decreaseFont,
      increaseFont,
      fontStatus,
      toggleSpacing,
      toggleSerif,
      toggleTheme,
      toggleFocus,
      printBtn,
      tocBtn,
      toTopBtn
    );

    const header = document.querySelector('header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(toolbar, header.nextSibling);
    } else {
      document.body.prepend(toolbar);
    }

    applyState();
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.body) return;
    const state = loadState();
    const tocApi = createTOC();
    createProgressBar();

    const persist = (nextState) => saveState(nextState);
    createToolbar(state, persist, tocApi.isEmpty ? null : tocApi);
  });
})();
