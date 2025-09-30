const state = {
  locale: localStorage.getItem('stats-locale') || 'th',
  contentIndex: [],
  reviewIndex: [],
  advancedIndex: [],
  toolIndex: [],
  bookmarks: JSON.parse(localStorage.getItem('stats-bookmarks') || '[]'),
};

const selectors = {
  lessonGrid: document.getElementById('lesson-grid'),
  reviewLinks: document.getElementById('review-links'),
  advancedLinks: document.getElementById('advanced-links'),
  toolLinks: document.getElementById('tool-links'),
  printCurrent: document.getElementById('print-current'),
  installPwa: document.getElementById('install-pwa'),
  toggleLang: document.getElementById('i18n-toggle'),
};

async function loadContentIndex() {
  const response = await fetch('content/index.json');
  const index = await response.json();
  state.contentIndex = index.lessons;
  state.reviewIndex = index.review;
  state.advancedIndex = index.advanced;
  state.toolIndex = index.tools;
  renderIndex();
  window.dispatchEvent(new CustomEvent('index:loaded', { detail: index }));
}

function createLessonCard(entry) {
  const article = document.createElement('article');
  article.className = 'card lesson-card';
  article.innerHTML = `
    <header>
      <p class="eyebrow">${entry.number}</p>
      <h3>${entry.title}</h3>
    </header>
    <p>${entry.summary}</p>
    <footer>
      <a class="primary" href="${entry.href}">เปิดบทเรียน</a>
      <button data-action="bookmark" data-href="${entry.href}">
        ${state.bookmarks.includes(entry.href) ? '★' : '☆'}
      </button>
    </footer>
  `;
  article.querySelector('button').addEventListener('click', () => toggleBookmark(entry.href));
  return article;
}

function createListLink(entry) {
  const li = document.createElement('li');
  li.innerHTML = `<a class="card" href="${entry.href}"><strong>${entry.title}</strong><span>${entry.summary}</span></a>`;
  return li;
}

function createToolCard(entry) {
  const card = document.createElement('a');
  card.className = 'card tool-card';
  card.href = entry.href;
  card.innerHTML = `
    <header>
      <h3>${entry.title}</h3>
    </header>
    <p>${entry.summary}</p>
    <p class="tagline">${entry.tags.join(', ')}</p>
  `;
  return card;
}

function renderIndex() {
  if (selectors.lessonGrid) {
    selectors.lessonGrid.innerHTML = '';
    state.contentIndex.forEach(entry => selectors.lessonGrid.appendChild(createLessonCard(entry)));
  }
  if (selectors.reviewLinks) {
    selectors.reviewLinks.innerHTML = '';
    state.reviewIndex.forEach(entry => selectors.reviewLinks.appendChild(createListLink(entry)));
  }
  if (selectors.advancedLinks) {
    selectors.advancedLinks.innerHTML = '';
    state.advancedIndex.forEach(entry => selectors.advancedLinks.appendChild(createListLink(entry)));
  }
  if (selectors.toolLinks) {
    selectors.toolLinks.innerHTML = '';
    state.toolIndex.forEach(entry => selectors.toolLinks.appendChild(createToolCard(entry)));
  }
}

function toggleBookmark(href) {
  if (state.bookmarks.includes(href)) {
    state.bookmarks = state.bookmarks.filter(item => item !== href);
  } else {
    state.bookmarks.push(href);
  }
  localStorage.setItem('stats-bookmarks', JSON.stringify(state.bookmarks));
  renderIndex();
}

function handlePrint() {
  window.print();
}

function setupNavigationButtons() {
  const prev = document.querySelector('[data-prev]');
  const next = document.querySelector('[data-next]');
  const print = document.getElementById('print-current');
  if (prev) {
    prev.addEventListener('click', () => { window.location.href = prev.dataset.prev; });
  }
  if (next) {
    next.addEventListener('click', () => { window.location.href = next.dataset.next; });
  }
  if (print) {
    print.addEventListener('click', handlePrint);
  }
}

function setupPwaInstall() {
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    selectors.installPwa?.classList.add('visible');
  });
  selectors.installPwa?.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome !== 'accepted') {
      console.log('PWA install dismissed');
    }
    deferredPrompt = null;
  });
}

function toggleLanguage() {
  state.locale = state.locale === 'th' ? 'en' : 'th';
  localStorage.setItem('stats-locale', state.locale);
  document.documentElement.lang = state.locale;
  window.dispatchEvent(new CustomEvent('i18n:change', { detail: { locale: state.locale } }));
}

function initLanguage() {
  document.documentElement.lang = state.locale;
  selectors.toggleLang?.addEventListener('click', toggleLanguage);
  window.dispatchEvent(new CustomEvent('i18n:change', { detail: { locale: state.locale } }));
}

document.addEventListener('DOMContentLoaded', () => {
  loadContentIndex();
  setupNavigationButtons();
  setupPwaInstall();
  initLanguage();
});

window.addEventListener('i18n:ready', renderIndex);
