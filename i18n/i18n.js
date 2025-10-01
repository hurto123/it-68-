const translations = {};
let currentLocale = 'th';

async function loadLocale(locale) {
  if (!translations[locale]) {
    const response = await fetch(`i18n/${locale}.json`);
    translations[locale] = await response.json();
  }
  return translations[locale];
}

async function applyTranslations(locale) {
  currentLocale = locale;
  const dict = await loadLocale(locale);
  document.querySelectorAll('[data-i18n]').forEach(node => {
    const key = node.getAttribute('data-i18n');
    const translation = key.split('.').reduce((acc, part) => acc?.[part], dict);
    if (translation) {
      if (node.tagName === 'INPUT' && node.type === 'search') {
        node.placeholder = translation;
      } else {
        node.textContent = translation;
      }
    }
  });
  window.dispatchEvent(new CustomEvent('i18n:ready', { detail: { locale } }));
}

window.addEventListener('i18n:change', (event) => {
  applyTranslations(event.detail.locale);
});

window.addEventListener('DOMContentLoaded', () => {
  const locale = document.documentElement.lang || 'th';
  applyTranslations(locale);
});
