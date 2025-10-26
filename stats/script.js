function setupSubmenuToggles() {
  const submenuItems = Array.from(document.querySelectorAll('.has-submenu'));

  if (submenuItems.length === 0) {
    return;
  }

  const toggleSubmenu = (item, shouldOpen) => {
    const toggleButton = item.querySelector('.submenu-toggle');
    const mainLink = item.querySelector('.submenu-link');
    const isOpen = typeof shouldOpen === 'boolean' ? shouldOpen : !item.classList.contains('is-open');

    item.classList.toggle('is-open', isOpen);

    const expandedValue = isOpen ? 'true' : 'false';

    if (toggleButton) {
      toggleButton.setAttribute('aria-expanded', expandedValue);
    }

    if (mainLink) {
      mainLink.setAttribute('aria-expanded', expandedValue);
    }
  };

  const closeOtherSubmenus = (current) => {
    submenuItems.forEach((item) => {
      if (item !== current && item.classList.contains('is-open')) {
        toggleSubmenu(item, false);
      }
    });
  };

  submenuItems.forEach((item) => {
    const toggleButton = item.querySelector('.submenu-toggle');
    const mainLink = item.querySelector('.submenu-link');

    if (!toggleButton) {
      return;
    }

    toggleButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = !item.classList.contains('is-open');
      if (willOpen) {
        closeOtherSubmenus(item);
      }
      toggleSubmenu(item, willOpen);
    });

    if (mainLink) {
      mainLink.addEventListener('click', (event) => {
        const prefersHoverless = window.matchMedia('(hover: none)').matches;
        const isOpen = item.classList.contains('is-open');

        if (prefersHoverless && !isOpen) {
          event.preventDefault();
          closeOtherSubmenus(item);
          toggleSubmenu(item, true);
        }
      });
    }

    item.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && item.classList.contains('is-open')) {
        toggleSubmenu(item, false);
        if (toggleButton) {
          toggleButton.focus();
        }
      }
    });
  });

  document.addEventListener('click', (event) => {
    submenuItems.forEach((item) => {
      if (!item.contains(event.target) && item.classList.contains('is-open')) {
        toggleSubmenu(item, false);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', setupSubmenuToggles);
