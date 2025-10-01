const searchInput = document.querySelector('#command-search');
let searchIndex = [];

async function loadSearchIndex() {
  try {
    const res = await fetch('search-index.json');
    searchIndex = await res.json();
  } catch (error) {
    console.warn('Search index unavailable', error);
  }
}

function tokenize(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function search(query) {
  if (!query) return [];
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  return searchIndex
    .map(item => {
      const itemTokens = new Set(item.tokens);
      const score = tokens.reduce((acc, token) => acc + (itemTokens.has(token) ? 1 : 0), 0);
      return { item, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.item)
    .slice(0, 20);
}

function renderSearchResults(results) {
  const list = document.getElementById('command-results');
  if (!list) return;
  list.innerHTML = '';
  results.forEach(result => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${result.href}"><strong>${result.title}</strong><span>${result.snippet}</span></a>`;
    list.appendChild(li);
  });
}

if (searchInput) {
  searchInput.addEventListener('input', () => {
    renderSearchResults(search(searchInput.value));
  });
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const first = document.querySelector('#command-results a');
      if (first) {
        window.location.href = first.href;
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', loadSearchIndex);
