export async function loadSearchIndex() {
  const response = await fetch('content/search-index.json');
  if (!response.ok) {
    console.warn('โหลดดัชนีค้นหาไม่สำเร็จ');
    return [];
  }
  const data = await response.json();
  return data.entries || [];
}

export function searchIndex(entries, term) {
  if (!term) return [];
  const words = term.trim().toLowerCase().split(/\s+/);
  return entries
    .map((entry) => {
      const haystack = [entry.title, entry.keywords.join(' '), entry.excerpt]
        .join(' ')
        .toLowerCase();
      const matched = words.filter((word) => haystack.includes(word));
      if (matched.length === words.length) {
        return { ...entry, matches: matched };
      }
      return null;
    })
    .filter(Boolean)
    .slice(0, 8);
}
