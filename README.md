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

Articles and reference docs share one shape: `docCollection()` in `src/content.config.ts` defines the schema once, and `src/support/docs.ts` derives everything a doc page shows (table of contents, reading time, SEO, schema.org, breadcrumbs) for both collections. Every support-hub list (articles, reference, whitepapers, spreadsheets) is registered in `src/support/resources.ts` and rendered inside `SupportPage.astro`, so the route files under `src/pages/support/` only supply the list body. Descriptions in the JSON collections are stripped of HTML by the collection schema.

## Site identity

The facts that identify the site live in `src/site.ts`: the canonical `url` (which `astro.config.mjs` reads, so config and pages agree), `brand`, `product`, company details and the external links the pages point at. Replace the placeholder values there before deploying; marketing copy in the sections still mentions the brand by name, so search for it when rebranding. Page titles, descriptions and schema.org data are derived once by `describePage()` in `src/seo.ts`; a page passes the result to `<BaseLayout page={page}>` and gets correct social cards for free.

## Product

The editions, prices, system requirements, comparison matrix and older releases are one object in `src/product.ts`. The five Downloads pages are views of it, and the quote form's license options come from it, so a price or requirement changes in one place (`pnpm test` checks the catalog stays consistent).

## Layout options

Several sections ship in two variants so you can pick one when adapting the template:

- Footers: `Footer.astro` (compact) or `FooterExpanded.astro` (link columns from the navigation tree plus a wider subscribe form). Switch the import in `src/layout/BaseLayout.astro`.
- Home features: `FeatureShowcase.astro` or `FeatureBento.astro` (bento grid with the `PlatformOrbit` animation). Switch the import in `src/pages/index.astro`.

Both variants of each read the same sources (`src/site.ts`, `src/navigation.ts`, the form declarations), so whichever you choose stays in sync.

## Navigation

The mega menus, top-level links and breadcrumb roots are one typed object in `src/navigation.ts`; `MegaMenu.astro` renders every menu, and the navbar, expanded footer and 404 page read the same tree. To add a menu, add an entry to `menus`. `pnpm test` checks that every internal link has a page, and `astro check` rejects any icon name that is not in `icons.ts`.

## Forms (Formspree)

Each form is declared once in `src/forms/declarations.ts` as a list of fields and rendered with `<JsonForm form={contactForm} />`. The client script posts the fields as JSON to the form's delivery target, set in `.env`:

```bash
PUBLIC_FORMSPREE_CONTACT=https://formspree.io/f/your-id     # contact and quote forms
PUBLIC_FORMSPREE_NEWSLETTER=https://formspree.io/f/your-id  # newsletter form
```

Without these, forms validate and show a demo success message (template showcase). With an endpoint configured the form also carries a native `action`, so it submits even without JavaScript. Submissions that fill the hidden honeypot field are dropped silently. To add a form: add a `declareForm(...)` declaration and render it with `<JsonForm>`.

## Showcase placeholders

Some mega-menu and CTA links intentionally use `#`, and the Knowledge Base page is a stub. Replace them when adapting the template.

## Deploy

Deploy the `dist/` output to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages). `vercel.json` includes security headers; the CSP allows Formspree, Google Fonts and the hero video host, and `pnpm test` checks it still matches the origins in `src/site.ts` and `src/forms/delivery.ts`. `script-src` keeps `'unsafe-inline' 'unsafe-eval'` for Preline and view transitions – review before tightening.
