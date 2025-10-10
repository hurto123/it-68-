fetch('content/search-index.json')
  .then(resp => resp.json())
  .then(index => {
    const form = document.querySelector('[data-search-form]');
    const results = document.querySelector('[data-search-results]');
    if(!form || !results) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const q = new FormData(form).get('q')?.toString().trim().toLowerCase();
      results.innerHTML = '';
      if(!q) return;
      index.filter(item => item.keywords.some(k => k.includes(q))).forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${item.url}">${item.title}</a><p>${item.snippet}</p>`;
        results.appendChild(li);
      });
    });
  });
