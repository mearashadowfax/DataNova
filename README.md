# DataNova Static Site Generator (SSG) Branch

This branch provides a version of the DataNova template configured for **Static Site Generation (SSG)** with Astro 7, Tailwind CSS 4, Markdoc, and Preline UI.

## Key Differences from Main Branch

- **Static generation:** Pages are built at compile time (`output: 'static'`). No server adapter.
- **No database / Keystatic:** Feedback API, Turso, and CMS admin UI are not included.
- **Forms:** Contact, quote, and newsletter forms use Formspree via public env vars (demo mode when unset).

## Requirements

- Node.js **22.12+** (see `.nvmrc`)
- pnpm 10+

## Getting Started

```bash
pnpm install
cp .env.template .env   # optional Formspree endpoints
pnpm dev
```

### Scripts

- `pnpm dev` – development server
- `pnpm build` – `astro check` + static build
- `pnpm preview` – preview the production build
- `pnpm test` – unit tests
- `pnpm format:check` / `pnpm format:write` – Prettier

## Content

| Collection   | Location                       |
| ------------ | ------------------------------ |
| Articles     | `src/content/articles/*.mdoc`  |
| Reference    | `src/content/reference/*.mdoc` |
| Spreadsheets | `src/data/spreadsheets/*.json` |
| Whitepapers  | `src/data/whitepapers/*.json`  |

Update `site` in `astro.config.mjs` before deploying.

## Forms (Formspree)

Set in `.env`:

```bash
PUBLIC_FORMSPREE_CONTACT=https://formspree.io/f/your-id
PUBLIC_FORMSPREE_NEWSLETTER=https://formspree.io/f/your-id
```

Without these, forms validate and show a demo success message (template showcase).

## Showcase placeholders

Some mega-menu and CTA links intentionally use `#`, and the Knowledge Base page is a stub. Replace them when adapting the template.

## Deploy

Deploy the `dist/` output to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages). `vercel.json` includes security headers; CSP allows Formspree and Google Fonts.
