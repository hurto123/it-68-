function createSetFromSelectorList(selectors) {
  const elements = new Set();
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      elements.add(element);
    });
  });
  return Array.from(elements);
}

function assignVariant(element) {
  if (element.dataset.psVariant) {
    return;
  }

  if (element.matches('.ps-embedded')) {
    element.dataset.psVariant = 'pulse';
  } else if (element.matches('table tbody tr, li, .nav-item, .nav-group')) {
    element.dataset.psVariant = 'slide-up';
  } else if (element.matches('header, footer, main > *, section, article, .card, .category-card')) {
    element.dataset.psVariant = 'scale';
  } else if (element.matches('.site-header .wrap > *')) {
    element.dataset.psVariant = 'slide-left';
  } else {
    element.dataset.psVariant = 'slide-up';
  }
}

function setDelay(element, index) {
  if (element.dataset.psAnimDelay) {
    return;
  }
  const delay = Math.min(index * 0.04, 0.6).toFixed(2);
  element.style.setProperty('--ps-anim-delay', `${delay}s`);
}

function initObserver(targets) {
  if (!('IntersectionObserver' in window)) {
    targets.forEach((element) => {
      element.classList.add('ps-animate--visible');
    });
    return null;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('ps-animate--visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -10%',
  });

  targets.forEach((element) => observer.observe(element));
  return observer;
}

function watchDynamicContent(observer, onAdd = () => {}) {
  if (!('MutationObserver' in window)) {
    return;
  }

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }

        if (node.matches('[data-ps-animate], .card, .category-card, .nav-group, table tbody tr, li')) {
          prepareElement(node);
          if (observer) {
            observer.observe(node);
          } else {
            onAdd(node);
          }
        }

        node.querySelectorAll?.('[data-ps-animate], .card, .category-card, .nav-group, table tbody tr, li').forEach((child) => {
          prepareElement(child);
          if (observer) {
            observer.observe(child);
          } else {
            onAdd(child);
          }
        });
      });
    });
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

function prepareElement(element, index = 0) {
  if (!element.classList.contains('ps-animate')) {
    element.classList.add('ps-animate');
  }
  assignVariant(element);
  setDelay(element, index);
}

function markVisible(elements) {
  elements.forEach((element) => {
    element.classList.add('ps-animate--visible');
  });
}

function initAnimations() {
  if (document.documentElement.classList.contains('ps-animations-initialized')) {
    return;
  }

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionPreference.matches) {
    document.documentElement.classList.add('ps-animations-disabled');
    return;
  }

  document.documentElement.classList.add('ps-animations-initialized');

  const selectors = [
    '[data-ps-animate]',
    '.site-header .wrap > *',
    '.nav-group',
    '.nav-group .nav-item',
    '.card',
    '.card-grid > *',
    '.category-card',
    'main > *',
    'section',
    'article',
    'table tbody tr',
    '.list-tight li',
    '.stats-list > div',
    '.dataset-table tbody tr',
    '.cta-group > *'
  ];

  try {
    const targets = createSetFromSelectorList(selectors);
    targets.forEach((element, index) => {
      if (element.dataset.psAnimate === 'off') {
        return;
      }
      prepareElement(element, index);
    });

    document.documentElement.classList.add('ps-animations-ready');

    const animTargets = targets.filter((element) => element.dataset.psAnimate !== 'off');
    const observer = initObserver(animTargets);
    if (!observer) {
      markVisible(animTargets);
    }
    watchDynamicContent(observer, (element) => {
      element.classList.add('ps-animate--visible');
    });

    motionPreference.addEventListener?.('change', (event) => {
      if (event.matches) {
        document.documentElement.classList.add('ps-animations-disabled');
        markVisible(animTargets);
      } else {
        document.documentElement.classList.remove('ps-animations-disabled');
      }
    });
  } catch (error) {
    console.error('ps animations failed, disabling effects', error);
    document.documentElement.classList.add('ps-animations-disabled');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}
