import { lessons, quizzes, summaries, formulas } from '../subjects.js';

const cloneItem = (item) => ({
  ...item,
  meta: item.meta ? { ...item.meta } : undefined
});

const dataMap = {
  lessons: lessons.map(cloneItem),
  quizzes: quizzes.map(cloneItem),
  summaries: summaries.map(cloneItem),
  formulas: formulas.map(cloneItem)
};

const manifestMetaByAsset = new Map();

const addManifestMeta = (asset, meta) => {
  if (!asset) return;
  const existing = manifestMetaByAsset.get(asset) || {};
  manifestMetaByAsset.set(asset, { ...existing, ...meta });
};

const ingestManifest = (manifest) => {
  if (!manifest) return;
  const { lessons: lessonEntries = [], formulas: formulaEntries = [], supplements = [] } = manifest;

  lessonEntries.forEach((entry) => {
    const baseMeta = {
      version: entry.version,
      updated_at: entry.updated_at
    };
    const assets = entry.assets || {};
    addManifestMeta(assets.page, baseMeta);
    addManifestMeta(assets.summary, baseMeta);
    addManifestMeta(assets.quiz_config, baseMeta);
    addManifestMeta(assets.questions, baseMeta);
    addManifestMeta(assets.solutions, baseMeta);
  });

  formulaEntries.forEach((entry) => {
    const baseMeta = {
      version: entry.version,
      updated_at: entry.updated_at
    };
    const assets = entry.assets || {};
    addManifestMeta(assets.page, baseMeta);
  });

  supplements.forEach((entry) => {
    const baseMeta = {
      version: entry.version,
      updated_at: entry.updated_at
    };
    addManifestMeta(entry.id, baseMeta);
    const dependents = Array.isArray(entry.depends_on) ? entry.depends_on : [];
    dependents
      .filter((asset) => typeof asset === 'string' && asset.endsWith('.html'))
      .forEach((asset) => addManifestMeta(asset, baseMeta));
  });
};

const applyManifestMeta = () => {
  Object.keys(dataMap).forEach((key) => {
    dataMap[key] = dataMap[key].map((item) => {
      const manifestMeta = manifestMetaByAsset.get(item.link) || manifestMetaByAsset.get(item.id);
      if (manifestMeta) {
        item.meta = { ...(item.meta || {}), ...manifestMeta };
      }
      return item;
    });
  });
};

const formatThaiDate = (isoDate) => {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return null;
  const monthNames = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม'
  ];
  const monthIndex = Number(month) - 1;
  const dayNumber = Number(day);
  if (Number.isNaN(monthIndex) || Number.isNaN(dayNumber) || !monthNames[monthIndex]) return null;
  return `${dayNumber} ${monthNames[monthIndex]} ${year}`;
};

const updateHeroAnnouncement = (manifest) => {
  const dateTarget = document.querySelector('[data-hero-latest-date]');
  const versionTarget = document.querySelector('[data-hero-latest-version]');
  if (!dateTarget && !versionTarget) return;

  const inferenceIds = new Set([
    'summary-lesson11',
    'summary-lesson12',
    'summary-lesson13',
    'summary-lesson14',
    'summary-lesson15',
    'summary-lesson16',
    'summary-lesson17',
    'summary-lesson18',
    'summary-lesson19',
    'summary-lesson20',
    'summary-lesson21',
    'summary-lesson22'
  ]);

  const supplements = manifest?.supplements || [];
  const latest = supplements
    .filter((entry) => inferenceIds.has(entry.id) && entry.updated_at)
    .map((entry) => ({
      date: entry.updated_at,
      version: entry.version
    }))
    .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))[0];

  if (latest?.date) {
    const thaiDate = formatThaiDate(latest.date);
    if (thaiDate && dateTarget) {
      dateTarget.textContent = `อัปเดตล่าสุด ${thaiDate}`;
    }
  } else if (dateTarget) {
    dateTarget.textContent = 'กำลังติดตามการอัปเดตล่าสุด';
  }

  if (latest?.version && versionTarget) {
    versionTarget.textContent = `เวอร์ชัน ${latest.version}`;
    versionTarget.hidden = false;
  }
};

const loadManifest = async () => {
  try {
    const response = await fetch('manifest.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Manifest not reachable');
    const manifest = await response.json();
    ingestManifest(manifest);
    applyManifestMeta();
    updateHeroAnnouncement(manifest);
  } catch (error) {
    console.warn('[home-page] Unable to load manifest metadata:', error);
  }
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
    anchor.appendChild(desc);
  }

  if (item.chip && item.chip.trim()) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = item.chip.trim();
    anchor.appendChild(chip);
  }

  if (item.meta) {
    const metaParts = [];
    if (item.meta.updated_at) {
      anchor.dataset.updated = item.meta.updated_at;
      const friendlyDate = formatThaiDate(item.meta.updated_at) || item.meta.updated_at;
      metaParts.push(`อัปเดต ${friendlyDate}`);
    }
    if (item.meta.read_time) {
      metaParts.push(item.meta.read_time);
    }
    if (item.meta.version) {
      metaParts.push(`เวอร์ชัน ${item.meta.version}`);
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

const setupFadeIn = () => {
  const fades = document.querySelectorAll('.fade-in');
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
};

const normalize = (value) => (value || '').toString().toLowerCase().trim();

const setupSearch = () => {
  const qInput = document.getElementById('site-search');
  const btnSearch = document.getElementById('btn-search');
  const btnClear = document.getElementById('btn-clear');
  const statusEl = document.getElementById('search-status');
  const filterInputs = Array.from(document.querySelectorAll('.search-filters input[type="checkbox"]'));
  const btnFilterReset = document.getElementById('btn-filter-reset');
  const allKinds = filterInputs.map((input) => input.value);

  const cards = () => Array.from(document.querySelectorAll('[data-card]'));
  const sections = () => Array.from(document.querySelectorAll('main section'));

  const activeKinds = () => new Set(filterInputs.filter((input) => input.checked).map((input) => input.value));

  const applySearch = (term, { scroll } = { scroll: false }) => {
    const displayTerm = term ?? qInput?.value ?? '';
    const keyword = normalize(displayTerm);
    const tokens = keyword.split(/\s+/).filter(Boolean);
    const kinds = activeKinds();
    const selectionSize = kinds.size;
    const totalKinds = allKinds.length;
    const noneSelected = totalKinds > 0 && selectionSize === 0;
    const filterActive = selectionSize > 0 && selectionSize < totalKinds;
    let hits = 0;
    let firstMatch = null;

    cards().forEach(card => {
      const text = normalize(card.dataset.search);
      const cardKind = card.dataset.card;
      const matchTokens = tokens.length ? tokens.every((token) => text.includes(token)) : true;
      const matchKind = filterActive ? kinds.has(cardKind) : true;
      const matched = matchTokens && (noneSelected ? false : matchKind);
      card.toggleAttribute('hidden', !matched);
      card.classList.toggle('match', matched && tokens.length > 0);
      if (matched && tokens.length > 0 && !firstMatch) {
        firstMatch = card;
      }
      if (matched && (tokens.length > 0 || filterActive)) hits += 1;
    });

    sections().forEach(section => {
      const visible = section.querySelector('[data-card]:not([hidden])');
      section.toggleAttribute('hidden', (tokens.length > 0 || filterActive || noneSelected) && !visible);
    });

    if (noneSelected) {
      if (statusEl) {
        statusEl.textContent = 'กรุณาเลือกอย่างน้อยหนึ่งหมวด';
      }
      return;
    }

    if (tokens.length > 0 || filterActive) {
      if (statusEl) {
        const categoryNames = filterActive
          ? allKinds.filter((kind) => kinds.has(kind)).map(getCategoryLabel)
          : [];
        const categoryText = filterActive
          ? ` ในหมวด ${categoryNames.join(', ')}`
          : ' ในทุกหมวด';
        const termText = tokens.length > 0 ? `สำหรับ “${displayTerm}”` : '';
        statusEl.textContent = `พบ ${hits} รายการ${termText}${categoryText}`;
      }
      if (scroll && firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      if (statusEl) {
        if (kinds && !kinds.size) {
          statusEl.textContent = 'กรุณาเลือกอย่างน้อยหนึ่งหมวด';
        } else {
          statusEl.textContent = '';
        }
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

  filterInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (!filterInputs.some((field) => field.checked)) {
        statusEl.textContent = 'กรุณาเลือกอย่างน้อยหนึ่งหมวด';
      }
      applySearch(undefined, { scroll: false });
    });
  });

  btnFilterReset?.addEventListener('click', () => {
    filterInputs.forEach((input) => {
      input.checked = true;
    });
    applySearch(undefined, { scroll: false });
  });

  const initFromHash = () => {
    const hash = decodeURIComponent(location.hash || '');
    if (hash.toLowerCase().startsWith('#search=')) {
      const term = hash.slice('#search='.length);
      if (qInput) qInput.value = term;
      requestAnimationFrame(() => applySearch(term, { scroll: true }));
    }
  };

  window.addEventListener('hashchange', initFromHash);
  initFromHash();
};

loadManifest().finally(() => {
  renderCards();
  setupFadeIn();
  setupSearch();
});

function getCategoryLabel(kind) {
  switch (kind) {
    case 'lessons':
      return 'บทเรียน';
    case 'quizzes':
      return 'แบบฝึกหัด & Quiz';
    case 'formulas':
      return 'อธิบายสูตร';
    case 'summaries':
      return 'สรุป 1 หน้า';
    default:
      return kind;
  }
}
