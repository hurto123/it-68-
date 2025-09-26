import { lessons, quizzes, summaries, formulas } from '../subjects.js';
import ensurePwaLinks from './pwa-helpers.js';

ensurePwaLinks();

const dataMap = {
  lessons,
  quizzes,
  summaries,
  formulas
};

const createCard = (item, kind) => {
  const anchor = document.createElement('a');
  anchor.className = 'card';
  anchor.href = item.link;
  anchor.dataset.card = kind;
  if (item.tags) anchor.dataset.tags = item.tags;
  anchor.dataset.search = [item.title, item.desc || '', item.tags || ''].join(' ');

  const title = document.createElement('h3');
  title.textContent = item.title;

  const descText = (item.desc || '').trim();
  anchor.setAttribute('aria-label', descText ? `${item.title} — ${descText}` : item.title);
  if (descText) {
    const desc = document.createElement('p');
    desc.className = 'muted';
    desc.textContent = descText;
@@ -46,111 +49,136 @@ const createCard = (item, kind) => {
    if (item.meta.version) {
      metaParts.push(`v${item.meta.version}`);
    }
    if (metaParts.length) {
      const meta = document.createElement('p');
      meta.className = 'card-meta muted';
      meta.textContent = metaParts.join(' • ');
      anchor.appendChild(meta);
    }
  }

  anchor.prepend(title);
  return anchor;
};

const renderCards = () => {
  document.querySelectorAll('[data-source]').forEach(container => {
    const source = container.dataset.source;
    const items = dataMap[source] || [];
    const fragment = document.createDocumentFragment();
    items.forEach(item => fragment.appendChild(createCard(item, source)));
    container.replaceChildren(fragment);
  });
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const setupFadeIn = () => {
  const fades = document.querySelectorAll('.fade-in');
  if (prefersReducedMotion.matches) {
    fades.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.animate(
            [
              { opacity: 0, transform: 'translateY(8px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 450, easing: 'ease-out', fill: 'forwards' }
          );
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  fades.forEach(el => observer.observe(el));

  const handleChange = (event) => {
    if (event.matches) {
      observer.disconnect();
      fades.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  };
  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', handleChange);
  } else if (typeof prefersReducedMotion.addListener === 'function') {
    prefersReducedMotion.addListener(handleChange);
  }
};

const normalize = (value) => (value || '').toString().toLowerCase().trim();

const setupSearch = () => {
  const qInput = document.getElementById('site-search');
  const btnSearch = document.getElementById('btn-search');
  const btnClear = document.getElementById('btn-clear');
  const statusEl = document.getElementById('search-status');

  const cards = () => Array.from(document.querySelectorAll('[data-card]'));
  const sections = () => Array.from(document.querySelectorAll('main section'));

  const applySearch = (term, { scroll } = { scroll: false }) => {
    const displayTerm = term ?? qInput?.value ?? '';
    const keyword = normalize(displayTerm);
    let hits = 0;
    let firstMatch = null;

    cards().forEach(card => {
      const text = normalize(card.dataset.search);
      const matched = keyword ? text.includes(keyword) : true;
      card.toggleAttribute('hidden', !matched);
      card.classList.toggle('match', matched && Boolean(keyword));
      if (matched && keyword && !firstMatch) {
        firstMatch = card;
      }
      if (matched && keyword) hits += 1;
    });

    sections().forEach(section => {
      const visible = section.querySelector('[data-card]:not([hidden])');
      section.toggleAttribute('hidden', Boolean(keyword) && !visible);
    });

    if (keyword) {
      if (statusEl) {
        statusEl.textContent = `พบ ${hits} รายการสำหรับ “${displayTerm}”`;
      }
      if (scroll && firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const behavior = prefersReducedMotion.matches ? 'auto' : 'smooth';
        firstMatch.scrollIntoView({ behavior, block: 'center' });
      }
    } else {
      if (statusEl) {
        statusEl.textContent = '';
      }
      sections().forEach(section => section.removeAttribute('hidden'));
    }
  };

  const clearSearch = () => {
    qInput.value = '';
    applySearch('', { scroll: false });
    if (location.hash.toLowerCase().startsWith('#search=')) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  };

  btnSearch?.addEventListener('click', () => applySearch(undefined, { scroll: true }));
  btnClear?.addEventListener('click', clearSearch);
  qInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applySearch(undefined, { scroll: true });
    }
  });
