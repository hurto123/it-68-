export function initTooltips() {
  document.querySelectorAll('[data-tooltip]').forEach((el) => {
    el.setAttribute('tabindex', '0');
    el.classList.add('has-tooltip');
    el.addEventListener('focus', showTooltip);
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('blur', hideTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });
}

function showTooltip(event) {
  const message = event.currentTarget.getAttribute('data-tooltip');
  if (!message) return;
  let tooltip = event.currentTarget.querySelector('.ps-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('span');
    tooltip.className = 'ps-tooltip';
    tooltip.role = 'tooltip';
    tooltip.textContent = message;
    event.currentTarget.appendChild(tooltip);
  }
  tooltip.hidden = false;
}

function hideTooltip(event) {
  const tooltip = event.currentTarget.querySelector('.ps-tooltip');
  if (tooltip) {
    tooltip.hidden = true;
  }
}
