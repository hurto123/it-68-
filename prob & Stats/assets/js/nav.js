document.addEventListener('DOMContentLoaded', () => {
  const breadcrumb = document.querySelector('[data-breadcrumb]');
  if(!breadcrumb) return;
  const path = window.location.pathname.split('/').filter(Boolean);
  const list = breadcrumb.querySelector('ol');
  if(!list) return;
  let current = '/';
  path.forEach(segment => {
    current += segment + '/';
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = current.replace(/\/$/, '.html');
    link.textContent = segment.replace(/[-_]/g, ' ');
    item.appendChild(link);
    list.appendChild(item);
  });
});
