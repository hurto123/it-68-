export function toggleThemeMenu(button, menu){
  if(!button || !menu) return;
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', !expanded);
  menu.hidden = expanded;
}
