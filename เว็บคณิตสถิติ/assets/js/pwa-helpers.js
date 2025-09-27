const ROOT_URL = new URL('../..', import.meta.url);
const manifestHref = new URL('content-manifest.json', ROOT_URL).href;
const icon192Href = new URL('assets/icons/icon-192.png', ROOT_URL).href;
const icon512Href = new URL('assets/icons/icon-512.png', ROOT_URL).href;

function ensureLink(rel, attrs) {
  const selectorParts = [`link[rel="${rel}"]`];
  if (attrs.sizes) selectorParts.push(`[sizes="${attrs.sizes}"]`);
  if (attrs.type) selectorParts.push(`[type="${attrs.type}"]`);
  const existing = document.head.querySelector(selectorParts.join(''));
  if (existing) {
    return existing;
  }
  const link = document.createElement('link');
  link.rel = rel;
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined) {
      link.setAttribute(key, value);
    }
  });
  document.head.appendChild(link);
  return link;
}

let applied = false;
export function ensurePwaLinks() {
  if (applied || !document?.head) return;
  ensureLink('manifest', { href: manifestHref });
  ensureLink('icon', { type: 'image/png', sizes: '192x192', href: icon192Href });
  ensureLink('icon', { type: 'image/png', sizes: '512x512', href: icon512Href });
  ensureLink('apple-touch-icon', { href: icon192Href });
  applied = true;
}

export default ensurePwaLinks;
