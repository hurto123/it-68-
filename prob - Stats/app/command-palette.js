const palette = document.getElementById('command-palette');
const paletteOpen = document.getElementById('command-palette-open');
const paletteSearch = document.getElementById('command-search');
let paletteIndex = [];

function openPalette() {
  if (!palette) return;
  palette.showModal();
  paletteSearch?.focus();
  renderPaletteResults(paletteIndex.slice(0, 10));
}

function closePalette() {
  palette?.close();
}

function handlePaletteShortcut(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openPalette();
  }
}

function renderPaletteResults(results) {
  const list = document.getElementById('command-results');
  if (!list) return;
  list.innerHTML = '';
  results.forEach(item => {
    const li = document.createElement('li');
    li.role = 'option';
    li.innerHTML = `<a href="${item.href}"><strong>${item.title}</strong><span>${item.type}</span></a>`;
    list.appendChild(li);
  });
}

function filterPalette(query) {
  const lower = query.toLowerCase();
  return paletteIndex
    .filter(item => item.title.toLowerCase().includes(lower) || item.tags.some(tag => tag.includes(lower)))
    .slice(0, 20);
}

window.addEventListener('index:loaded', (event) => {
  const { lessons, review, advanced, tools } = event.detail;
  paletteIndex = [
    ...lessons.map(item => ({ ...item, type: 'lesson' })),
    ...review.map(item => ({ ...item, type: 'review' })),
    ...advanced.map(item => ({ ...item, type: 'advanced' })),
    ...tools.map(item => ({ ...item, type: 'tool' })),
  ];
});

paletteSearch?.addEventListener('input', () => {
  renderPaletteResults(filterPalette(paletteSearch.value));
});

document.addEventListener('keydown', handlePaletteShortcut);
paletteOpen?.addEventListener('click', openPalette);
palette?.addEventListener('close', () => paletteSearch.value = '');
