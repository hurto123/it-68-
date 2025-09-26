(() => {
  const headerEl = document.querySelector('[data-lesson-header]');
  const metaEl = document.getElementById('lesson-meta');
  if (!headerEl || !metaEl) return;

  let lessonMeta;
  try {
    lessonMeta = JSON.parse(metaEl.textContent || '{}');
  } catch (error) {
    console.error('ไม่สามารถอ่าน lesson-meta:', error);
    return;
  }

  const lessonId = headerEl.dataset.lessonId || lessonMeta.id;
  if (!lessonId) return;

  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const createBadge = (text) => {
    const span = document.createElement('span');
    span.className = 'pill tag';
    span.textContent = text;
    return span;
  };

  const resolveNavItems = (navConfig, lessons, current) => {
    if (!Array.isArray(navConfig) || !navConfig.length) {
      return [
        { label: '🏠 หน้าแรก', href: 'index.html' },
        { rel: 'prev', label: '⟵ บทก่อนหน้า' },
        { rel: 'next', label: 'บทถัดไป ⟶' }
      ];
    }
    return navConfig;
  };

  const buildNavLink = (item, lessons, current) => {
    const link = document.createElement('a');
    let href = item.href;
    let disabled = item.disabled;

    if (!href && item.rel === 'prev') {
      const index = lessons.findIndex(entry => entry.id === current.id);
      if (index > 0) {
        href = lessons[index - 1]?.assets?.page;
      }
      if (!href) {
        disabled = true;
      }
    }

    if (!href && item.rel === 'next') {
      const index = lessons.findIndex(entry => entry.id === current.id);
      if (index >= 0 && index < lessons.length - 1) {
        href = lessons[index + 1]?.assets?.page;
      }
      if (!href) {
        disabled = true;
      }
    }

    link.textContent = item.label || item.text || '';
    if (href) {
      link.href = href;
    }
    if (disabled) {
      link.setAttribute('aria-disabled', 'true');
    }
    if (item.target) {
      link.target = item.target;
      if (item.target === '_blank') {
        link.rel = 'noreferrer noopener';
      }
    }
    return link;
  };

  const createActions = (actions = []) => {
    if (!actions.length) return null;
    const container = document.createElement('div');
    container.className = 'actions';
    if (actions.some(action => action.ariaLabel)) {
      container.setAttribute('role', 'group');
      container.setAttribute('aria-label', actions.map(action => action.ariaLabel).filter(Boolean).join(' '));
    }

    actions.forEach(action => {
      if (action.type === 'button') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pill-btn';
        btn.textContent = action.label || '';
        if (action.action === 'print') {
          btn.addEventListener('click', () => window.print());
        } else if (typeof action.onClick === 'string') {
          btn.addEventListener('click', () => {
            try {
              new Function(action.onClick)();
            } catch (error) {
              console.error('ไม่สามารถรัน onClick ของ action', error);
            }
          });
        }
        container.appendChild(btn);
      } else {
        const anchor = document.createElement('a');
        anchor.className = 'pill-link';
        anchor.textContent = action.label || '';
        if (action.href) {
          anchor.href = action.href;
        }
        if (action.target) {
          anchor.target = action.target;
          if (action.target === '_blank') {
            anchor.rel = 'noreferrer noopener';
          }
        }
        container.appendChild(anchor);
      }
    });

    return container;
  };

  const createChip = (chip) => {
    if (chip.type === 'link') {
      const anchor = document.createElement('a');
      anchor.className = 'pill-link';
      anchor.textContent = chip.label || '';
      if (chip.href) {
        anchor.href = chip.href;
      }
      if (chip.target) {
        anchor.target = chip.target;
        if (chip.target === '_blank') {
          anchor.rel = 'noreferrer noopener';
        }
      }
      return anchor;
    }

    const span = document.createElement('span');
    span.className = 'pill';
    if (chip.icon) {
      span.append(chip.icon, ' ');
    }
    if (chip.text) {
      span.append(chip.text, ' ');
    }
    if (Array.isArray(chip.links)) {
      chip.links.forEach((link, index) => {
        const anchor = document.createElement('a');
        anchor.className = link.className || 'inline';
        anchor.textContent = link.label || '';
        if (link.href) {
          anchor.href = link.href;
        }
        if (link.target) {
          anchor.target = link.target;
          if (link.target === '_blank') {
            anchor.rel = 'noreferrer noopener';
          }
        }
        span.appendChild(anchor);
        if (index < chip.links.length - 1) {
          span.append(', ');
        }
      });
    }
    if (!chip.links?.length && chip.label) {
      span.append(chip.label);
    }
    return span;
  };

  const renderHeader = (lessonEntry, manifest) => {
    const headerConfig = lessonEntry.header || {};
    const wrap = document.createElement('div');
    wrap.className = 'wrap';

    const heading = document.createElement('h1');
    heading.textContent = headerConfig.title || document.title || lessonMeta.title || '';

    if (Array.isArray(headerConfig.badges)) {
      headerConfig.badges.forEach(badge => {
        const text = typeof badge === 'string' ? badge : badge?.text;
        if (text) {
          heading.appendChild(createBadge(text));
        }
      });
    } else if (!headerConfig.badges && (lessonEntry.version || lessonEntry.updated_at)) {
      const parts = [];
      if (lessonEntry.version) parts.push(`รุ่น ${lessonEntry.version}`);
      if (lessonEntry.updated_at) parts.push(`อัปเดต ${formatDate(lessonEntry.updated_at)}`);
      if (parts.length) {
        heading.appendChild(createBadge(parts.join(' · ')));
      }
    }

    wrap.appendChild(heading);

    if (headerConfig.description) {
      const desc = document.createElement('p');
      desc.className = 'muted';
      desc.textContent = headerConfig.description;
      wrap.appendChild(desc);
    }

    const lessons = Array.isArray(manifest.lessons) ? manifest.lessons : [];
    const navItems = resolveNavItems(headerConfig.nav, lessons, lessonEntry);
    if (navItems.length) {
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', headerConfig.nav_label || 'นำทางบทเรียน');
      navItems.forEach(item => nav.appendChild(buildNavLink(item, lessons, lessonEntry)));
      wrap.appendChild(nav);
    }

    const actions = createActions(headerConfig.actions);
    if (actions) {
      if (headerConfig.actions_label) {
        actions.setAttribute('role', 'group');
        actions.setAttribute('aria-label', headerConfig.actions_label);
      }
      wrap.appendChild(actions);
    }

    if (Array.isArray(headerConfig.chips) && headerConfig.chips.length) {
      const chips = document.createElement('div');
      chips.className = 'chips';
      if (headerConfig.chips_label) {
        chips.setAttribute('aria-label', headerConfig.chips_label);
      }
      headerConfig.chips.forEach(item => chips.appendChild(createChip(item)));
      wrap.appendChild(chips);
    }

    headerEl.innerHTML = '';
    headerEl.appendChild(wrap);
  };

  fetch('manifest.json')
    .then(response => {
      if (!response.ok) throw new Error(`โหลด manifest ล้มเหลว: ${response.status}`);
      return response.json();
    })
    .then(manifest => {
      const entry = Array.isArray(manifest.lessons)
        ? manifest.lessons.find(item => item.id === lessonId)
        : null;
      if (!entry) return;
      renderHeader(entry, manifest);
    })
    .catch(error => {
      console.error('ไม่สามารถโหลด manifest:', error);
    });
})();
