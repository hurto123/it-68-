# Prob - Stats codebase overview

## High-level structure
- **Static site shell (`index.html`)** – Landing page with curriculum sections, tool links, service worker registration, and language toggle hooks. 【F:prob - Stats/index.html†L1-L121】【F:prob - Stats/index.html†L121-L139】
- **Client controllers (`app.js`, `app/command-palette.js`, `search.js`)** – Handle content index rendering, bookmarks, command palette, and fuzzy search backed by a prebuilt token index. 【F:prob - Stats/app.js†L1-L115】【F:prob - Stats/app.js†L115-L180】【F:prob - Stats/app/command-palette.js†L1-L69】【F:prob - Stats/search.js†L1-L69】
- **Content & assets** – HTML lessons under `content/`, supporting datasets in `data/`, localized copy under `i18n/`, and shared styles in `styles/`. 【F:prob - Stats/content/index.json†L1-L77】【F:prob - Stats/data/ab_test.csv†L1-L20】【F:prob - Stats/i18n/en.json†L1-L20】
- **Interactive tools (`tools/`, `sim/`)** – Calculator and simulator pages plus numerical distribution utilities (`tools/distributions.js`) and web workers for heavy computation (`workers/`). 【F:prob - Stats/tools/distributions.js†L1-L200】【F:prob - Stats/workers/bootstrap.worker.js†L1-L74】
- **Progressive Web App setup** – Manifest and service worker caching core assets to enable offline use. 【F:prob - Stats/pwa/manifest.json†L1-L40】【F:prob - Stats/pwa/sw.js†L1-L33】

## Data & internationalization
- `content/index.json` drives dynamic lesson/review/tool cards, including per-entry tags consumed by the command palette. 【F:prob - Stats/content/index.json†L1-L77】
- `search-index.json` stores tokenized snippets for client-side search ranking. 【F:prob - Stats/search-index.json†L1-L7】
- `i18n/en.json` and `i18n/th.json` provide parallel strings; `i18n/i18n.js` loads and applies translations based on saved locale state. 【F:prob - Stats/i18n/en.json†L1-L20】【F:prob - Stats/i18n/i18n.js†L1-L36】

## Computational utilities
- `tools/distributions.js` implements CDF/inverse functions for normal, Student's *t*, chi-square, and F distributions using numerical integration, series expansions, and Newton iterations. 【F:prob - Stats/tools/distributions.js†L1-L200】
- Web workers (`workers/bootstrap.worker.js`, `workers/clt.worker.js`, `workers/nct.worker.js`) offload simulations such as bootstrap resampling, CLT sampling, and noncentral *t* calculations. 【F:prob - Stats/workers/bootstrap.worker.js†L1-L74】

## Testing & quality
- Node test suite (`tests/stat-core.spec.js`) verifies numerical routines across major distributions to stay within tolerance. 【F:prob - Stats/tests/stat-core.spec.js†L1-L19】
- Accessibility checks (`tests/a11y-axe.spec.js`) assert that representative HTML pages include language, landmarks, canvas labels, and print controls. 【F:prob - Stats/tests/a11y-axe.spec.js†L1-L32】
- Lighthouse performance budgets stored at `build/lh-budget.json` restrict total script and stylesheet weight and forbid third-party assets. 【F:prob - Stats/build/lh-budget.json†L1-L9】

## Operational notes
- Service worker cache list (`pwa/sw.js`) only covers root-level assets; new top-level resources require manual cache updates. 【F:prob - Stats/pwa/sw.js†L1-L28】
- Client bootstrap expects browser support for `fetch`, `localStorage`, and `Dialog` APIs used by the command palette modal. 【F:prob - Stats/app.js†L1-L115】【F:prob - Stats/app/command-palette.js†L1-L24】
- Tests rely solely on Node's built-in test runner (`node --test`), simplifying execution without extra dependencies. 【F:prob - Stats/tests/stat-core.spec.js†L1-L19】
