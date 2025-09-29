export function renderNav(navGroups, container) {
  if (!container || !Array.isArray(navGroups)) return;

  const fallbackHTML = container.innerHTML;
  const fragment = document.createDocumentFragment();

  try {
    navGroups.forEach((group) => {
      const section = document.createElement('section');
      section.className = 'nav-group';
      section.setAttribute('role', 'listitem');
      section.dataset.groupId = group.id;

      const heading = document.createElement('h3');
      heading.textContent = group.label;
      section.appendChild(heading);

      if (group.summary) {
        const summary = document.createElement('p');
        summary.className = 'nav-summary';
        summary.textContent = group.summary;
        section.appendChild(summary);
      }

      const list = document.createElement('ul');
      list.className = 'nav-items';
      list.setAttribute('role', 'list');

      group.items.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'nav-item';

        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.title;
        if (item.description) {
          link.title = item.description;
        }
        li.appendChild(link);

        if (item.meta) {
          const meta = document.createElement('span');
          meta.className = 'nav-meta';
          meta.textContent = item.meta;
          li.appendChild(meta);
        }

        list.appendChild(li);
      });

      section.appendChild(list);

      if (group.cta) {
        const footer = document.createElement('div');
        footer.className = 'nav-cta';
        const link = document.createElement('a');
        link.href = group.cta.href;
        link.textContent = group.cta.label;
        footer.appendChild(link);
        section.appendChild(footer);
      }

      fragment.appendChild(section);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
    container.dataset.jsEnhanced = 'true';
  } catch (error) {
    console.error('renderNav failed, restoring static markup', error);
    container.innerHTML = fallbackHTML;
  }
}

export function renderDatasets(tableBody, datasets) {
  if (!tableBody) return;
  tableBody.innerHTML = '';
  datasets.forEach((dataset) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const link = document.createElement('a');
    link.href = dataset.href;
    link.textContent = dataset.name;
    nameCell.appendChild(link);

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = dataset.description;

    row.appendChild(nameCell);
    row.appendChild(descriptionCell);
    tableBody.appendChild(row);
  });
}

export function renderSearchResults(container, results) {
  if (!container) return;
  container.innerHTML = '';

  if (results.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.textContent = 'ไม่พบผลลัพธ์ ลองใช้คำค้นอื่นหรือค้นหาด้วยภาษาอังกฤษ';
    container.appendChild(emptyState);
    return;
  }

  results.forEach((entry) => {
    const article = document.createElement('article');
    const heading = document.createElement('h3');
    const link = document.createElement('a');
    link.href = entry.url;
    link.innerHTML = highlight(entry.title, entry.matches);
    heading.appendChild(link);

    const excerpt = document.createElement('p');
    excerpt.innerHTML = highlight(entry.excerpt, entry.matches);

    article.appendChild(heading);
    article.appendChild(excerpt);
    container.appendChild(article);
  });
}

function highlight(text, matches = []) {
  if (!matches || matches.length === 0) return text;
  let output = text;
  matches.forEach((term) => {
    const regex = new RegExp(`(${term})`, 'gi');
    output = output.replace(regex, '<mark>$1</mark>');
  });
  return output;
}

export function renderFileGroups(container, groups) {
  if (!container) return;
  container.innerHTML = '';

  groups.forEach((group) => {
    const card = document.createElement('article');
    card.className = 'category-card';
    card.setAttribute('role', 'listitem');

    const heading = document.createElement('h3');
    heading.textContent = group.name;

    const count = document.createElement('p');
    count.className = 'category-count';
    count.textContent = group.countLabel || `${group.count} ไฟล์`;

    const header = document.createElement('header');
    header.appendChild(heading);
    header.appendChild(count);
    card.appendChild(header);

    if (group.description) {
      const description = document.createElement('p');
      description.className = 'category-description';
      description.textContent = group.description;
      card.appendChild(description);
    }

    if (Array.isArray(group.examples) && group.examples.length > 0) {
      const list = document.createElement('ul');
      list.className = 'category-examples';
      group.examples.forEach((example) => {
        const item = document.createElement('li');
        item.textContent = example;
        list.appendChild(item);
      });
      card.appendChild(list);
    }

    if (group.link) {
      const footer = document.createElement('footer');
      footer.className = 'category-footer';
      const link = document.createElement('a');
      link.href = group.link.href;
      link.textContent = group.link.label;
      footer.appendChild(link);
      card.appendChild(footer);
    }

    container.appendChild(card);
  });
}
