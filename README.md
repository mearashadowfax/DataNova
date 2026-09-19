# DataNova

An [Astro](https://astro.build/) template for multi-page product sites – marketing pages, docs, downloads and support – that ships with a content admin UI, a database and working form endpoints. You start from a deployable site with the boring plumbing already wired, instead of a blank landing page you have to grow into one.

![DataNova](https://github.com/user-attachments/assets/b2ca99ee-8161-4755-9b66-205993ef2910)

**Live demo:** <https://data-nova.vercel.app/>

- **17 pages, 4 content collections.** Landing, about, contact, platform, five downloads pages and a support hub with articles, reference docs, a knowledge base, sample spreadsheets and whitepapers. Articles and reference are Markdoc; spreadsheets and whitepapers are JSON.
- **Edit content in a CMS.** [Keystatic](https://keystatic.com/) admin UI at `/keystatic`. Writes to local files in development or to your GitHub repo in production.
- **Database included.** [Drizzle ORM](https://orm.drizzle.team/) on [Turso](https://turso.tech/)/libSQL, with a local SQLite file in development. Powers the helpful / not-helpful feedback widget on every article and reference page.
- **Forms that work on day one.** `/api/contact`, `/api/quote` and `/api/newsletter` are each declared once as a field list that renders the form and validates the payload, rate-limit per IP and carry a honeypot. They run in demo mode until you paste a Formspree or webhook URL.
- **Hardened for production.** CSP, HSTS and other security headers in `vercel.json`; the CMS admin can be switched off in production; the database client refuses to fall back to a local file on Vercel.
- **Modern stack.** Astro 7 (SSR, Vercel adapter), Tailwind CSS 4, Preline UI 5, React 19 and Svelte 5 islands, TypeScript. Node 22+, pnpm.
- **SEO and performance wiring.** `astro-seo`, schema.org via `astro-seo-schema`, `astro-font`, view transitions with `ClientRouter`, prefetching and a dynamic `robots.txt`.
- **CI.** GitHub Actions runs Prettier, Vitest and `astro check` + build on every push and pull request.

```bash
git clone https://github.com/mearashadowfax/DataNova.git && cd DataNova
cp .env.template .env
pnpm install && pnpm db:push
pnpm dev
#  ➜  http://localhost:4321            your site
#  ➜  http://localhost:4321/keystatic  content admin
```

---

## Table of Contents

- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Customization](#customization)
  - [Navigation Bar](#navigation-bar)
  - [Mega Menus](#mega-menus)
  - [Footers](#footers)
  - [Sections and Components](#sections-and-components)
  - [Colors and Fonts](#colors-and-fonts)
- [Content Management with Keystatic](#content-management-with-keystatic)
  - [Storage Modes](#storage-modes)
  - [Disable the Admin UI in Production](#disable-the-admin-ui-in-production)
  - [Static Output Instead of SSR](#static-output-instead-of-ssr)
- [Database with Drizzle and Turso](#database-with-drizzle-and-turso)
- [Contact and Newsletter Forms](#contact-and-newsletter-forms)
- [API Routes](#api-routes)
- [SEO, Fonts and Transitions](#seo-fonts-and-transitions)
- [Contributing](#contributing)
- [License](#license)

---

## Getting Started

You need **Node.js 22 or newer** and **pnpm**. If you don't have pnpm, `corepack enable` installs the version pinned in `package.json`.

**1. Create your repository.** Click **Use this template** on GitHub, then clone it:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

**2. Create the environment file.** Everything in `.env.template` is optional for local development – the defaults use a local SQLite file and demo-mode forms.

```bash
cp .env.template .env
```

**3. Install dependencies and create the database schema.**

```bash
pnpm install
pnpm db:push
```

You should see `[✓] Changes applied`. This creates `.data/local.db` with the `Feedback` table.

**4. Start the dev server.**

```bash
pnpm dev
```

Open <http://localhost:4321> for the site and <http://localhost:4321/keystatic> for the content admin.

### Commands

| Command             | What it does                                                  |
| ------------------- | ------------------------------------------------------------- |
| `pnpm dev`          | Start the Astro dev server                                    |
| `pnpm build`        | Run `astro check`, then build the server output for Vercel    |
| `pnpm test`         | Run unit tests with Vitest (`pnpm test:watch` for watch mode) |
| `pnpm check`        | Typecheck `.astro` and `.ts` files                            |
| `pnpm format:check` | Check formatting with Prettier (`pnpm format:fix` to write)   |
| `pnpm db:push`      | Push the Drizzle schema straight to the database              |
| `pnpm db:generate`  | Generate versioned SQL migrations into `drizzle/`             |
| `pnpm db:migrate`   | Apply migrations from `drizzle/`                              |

> [!NOTE]
> The Vercel adapter does not support `astro preview`. Use `pnpm dev`, or the [Vercel CLI](https://vercel.com/docs/cli) (`vercel dev`) to emulate the production runtime locally.

---

## Deployment

DataNova is set up for [server-side rendering](https://docs.astro.build/en/guides/on-demand-rendering/) with the Vercel adapter. Connect your repository to Vercel, or [deploy the template directly](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmearashadowfax%2FDataNova).

**Set these environment variables in Vercel before the first deploy:**

| Variable                                                       | Required                 | Purpose                                                                                                            |
| -------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `TURSO_DATABASE_URL`                                           | Yes                      | Turso database URL. Database routes throw on Vercel without it – see [Database](#database-with-drizzle-and-turso). |
| `TURSO_AUTH_TOKEN`                                             | Yes                      | Turso database token                                                                                               |
| `SKIP_KEYSTATIC=1`                                             | If using local CMS mode  | Disables the `/keystatic` admin routes in production                                                               |
| `KEYSTATIC_STORAGE_MODE=github` + repo owner/name              | If using GitHub CMS mode | Lets editors publish through the admin UI on your live site                                                        |
| `FORMSPREE_CONTACT_ENDPOINT` / `FORMSPREE_NEWSLETTER_ENDPOINT` | No                       | Deliver form submissions. Forms run in demo mode when unset                                                        |

Also change `site` in `astro.config.mjs` from `https://data-nova.vercel.app` to your domain – it's used for canonical URLs and `robots.txt`.

> [!TIP]
> **Deploying elsewhere?** Swap the adapter. For example, `npx astro add netlify` and then in `astro.config.mjs`:
>
> ```mjs
> import netlify from '@astrojs/netlify';
>
> export default defineConfig({
>   // ...
>   output: 'server',
>   adapter: netlify(),
> });
> ```
>
> Astro has official adapters for Netlify, Cloudflare and Node.js – see the [adapter list](https://docs.astro.build/en/guides/on-demand-rendering/#server-adapters). The security headers in `vercel.json` are Vercel-specific and need to be recreated for your platform.

---

## Project Structure

```
├── astro.config.mjs        # Integrations, SSR output, Vercel adapter
├── keystatic.config.ts     # CMS collections and storage mode
├── drizzle.config.ts       # Drizzle Kit (schema path, Turso credentials)
├── vercel.json             # Security and cache headers
├── drizzle/                # Generated SQL migrations
├── public/                 # Static assets served as-is
└── src/
    ├── assets/
    │   ├── images/
    │   └── styles/global.css   # Tailwind theme: colors, fonts
    ├── components/
    │   ├── common/             # Shared building blocks (hero, cards, breadcrumbs, MegaMenu/, PostFeedback.svelte)
    │   ├── sections/           # Page sections (Navbar, Footer, FooterExpanded, HeroSection, Feature*, CTA)
    │   └── ui/                 # Button, forms/, icons/
    ├── content/                # Markdoc collections edited via Keystatic
    │   ├── articles/
    │   └── reference/
    ├── data/                   # JSON collections
    │   ├── spreadsheets/
    │   └── whitepapers/
    ├── config.ts               # Every env var, resolved once into a typed config
    ├── db/
    │   ├── client.ts           # libSQL client, opened on first use
    │   └── schema.ts           # Feedback table
    ├── feedback/store.ts       # Helpful / not-helpful votes: counts(), vote(), ping()
    ├── forms/                  # Form declarations, the submit pipeline and the delivery seam
    ├── layout/BaseLayout.astro # <head>, SEO, fonts, navbar and footer for every page
    ├── navigation.ts           # Mega menus, top-level links and breadcrumb roots
    ├── pages/
    │   ├── api/                # contact.ts, quote.ts, newsletter.ts, feedback.ts, health.ts
    │   ├── downloads/          # Product, editions, licensing, quote pages
    │   ├── platform/
    │   ├── support/            # articles/, reference/, knowledge base, spreadsheets, whitepapers
    │   ├── index.astro, about.astro, contact.astro, 404.astro
    │   └── robots.txt.ts       # Generated from `site`
    ├── support/                # docs.ts (what a support document is), load.ts (astro:content)
    ├── utils/                  # rate-limit.ts, sanitize.ts, form-client.ts, reading-time.ts
    └── content.config.ts       # Astro content collection schemas
```

Path aliases are defined in `tsconfig.json`: `@/`, `@common/`, `@sections/`, `@ui/`, `@layout/`, `@utils/`, `@styles/`, `@images/`, `@megaMenu/`.

> [!NOTE]
> Some mega-menu and CTA links intentionally point to `#` for showcase purposes. Replace them when adapting the template.

---

## Customization

### Navigation Bar

Top-level links live in [`src/navigation.ts`](src/navigation.ts):

```ts
export const navigationLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];
```

[`Navbar.astro`](src/components/sections/Navbar.astro) renders the array and underlines the link matching `Astro.url.pathname`.

### Mega Menus

The whole navigation tree is one typed object, `menus`, in [`src/navigation.ts`](src/navigation.ts). Each menu has a label, an optional description, a `pathPrefix` that marks it active, and sections of items:

```ts
// src/navigation.ts
export const menus = {
  downloads: {
    id: 'downloads',
    label: 'Downloads',
    description: 'Get started with a free trial or explore licensing options',
    pathPrefix: '/downloads',
    layout: 'list',
    sections: [
      {
        title: 'Download',
        items: [
          {
            icon: 'download',
            title: 'DataNova Core',
            description: 'Download the free trial version.',
            href: '/downloads/datanova-core',
          },
        ],
      },
    ],
  },
  // ...
} as const satisfies Record<string, Menu>;
```

`layout: 'list'` renders an icon, title and description per link; `layout: 'cards'` renders an imported image per link (see the Platform menu). One component, [`MegaMenu.astro`](src/components/common/MegaMenu/MegaMenu.astro), renders every menu, and `Navbar.astro` loops over `menuList`. The expanded footer and the 404 page read the same tree, and `pnpm test` checks that every internal `href` has a page and every `icon` exists in [`icons.ts`](src/components/ui/icons/icons.ts).

To add a menu: add an entry to `menus`. Nothing else changes.

### Footers

Two footers ship with the template:

- [`Footer.astro`](src/components/sections/Footer.astro) – compact: company info, contact details and a subscribe form.
- [`FooterExpanded.astro`](src/components/sections/FooterExpanded.astro) – adds link columns generated from `menus` and a wider subscribe form.

Both render the newsletter form with `<JsonForm form={newsletterForm} layout="inline" />` (see [Contact and Newsletter Forms](#contact-and-newsletter-forms)). Company name, description, address, phone and email live in [`src/site.ts`](src/site.ts) (shipped as placeholder values – replace them with yours); the attribution line is a constant at the top of each footer. Switch footers by changing one import in [`src/layout/BaseLayout.astro`](src/layout/BaseLayout.astro):

```astro
---
import Footer from '@sections/Footer.astro'; // or '@sections/FooterExpanded.astro'
---
```

### Sections and Components

Sections in `src/components/sections/` and blocks in `src/components/common/` follow the same pattern – copy is held in constants at the top of the file:

```astro
---
const title = 'My New Title';
const subTitle = '...';
const primaryCTA = { text: 'Get started', href: '/downloads/datanova-core' };
---
```

Edit `title`, `subTitle` and the `primaryCTA` / `secondaryCTA` / `tertiaryCTA` objects; no template markup changes needed.

### Colors and Fonts

Tailwind CSS 4 is configured in CSS, not in a JS config file. Theme tokens live in [`src/assets/styles/global.css`](src/assets/styles/global.css) – change colors and font families there. See Tailwind's docs on [customizing colors](https://tailwindcss.com/docs/colors#customizing-your-colors) and [font families](https://tailwindcss.com/docs/font-family#customizing-your-theme). The fonts themselves (Google Fonts by default) are declared in the `AstroFont` config in `BaseLayout.astro`.

---

## Content Management with Keystatic

Keystatic gives editors a web UI for the `articles` and `reference` Markdoc collections. Collection shapes are defined in [`keystatic.config.ts`](keystatic.config.ts); the matching Astro schemas are in [`src/content.config.ts`](src/content.config.ts). Both files build the `articles` and `reference` collections from one `docCollection()` helper, so a new field is added in two places, once per file. What a page derives from a document (table of contents, reading time, SEO, schema.org, breadcrumbs, feedback slug) lives in [`src/support/docs.ts`](src/support/docs.ts).

- **Local development:** <http://localhost:4321/keystatic> – edits write to `src/content/`.
- **Production (GitHub mode):** `https://your-domain.com/keystatic` – edits are committed to your repository.

### Storage Modes

Storage is chosen by environment variable, read in `keystatic.config.ts`:

```bash
# .env
KEYSTATIC_STORAGE_MODE=local          # default; or "github"
KEYSTATIC_GITHUB_REPO_OWNER=your-org  # GitHub mode only
KEYSTATIC_GITHUB_REPO_NAME=your-repo  # GitHub mode only
```

GitHub mode also requires a Keystatic GitHub App – follow the [Keystatic GitHub mode guide](https://keystatic.com/docs/github-mode).

### Disable the Admin UI in Production

If you only edit content locally, keep `/keystatic` off your live site. `astro.config.mjs` already skips the integration when `SKIP_KEYSTATIC` is set:

```js
integrations: [
  react(),
  markdoc(),
  ...(process.env.SKIP_KEYSTATIC ? [] : [keystatic()]),
  svelte(),
],
```

> [!IMPORTANT]
> Set `SKIP_KEYSTATIC=1` in your hosting provider's environment variables. CI does the same when building.

### Static Output Instead of SSR

The template renders on the server because Keystatic's API routes and the form/feedback endpoints need a runtime. If you edit content only in local mode and don't need the API routes, you can build a fully static site and host it anywhere:

1. In `astro.config.mjs`, include `keystatic()` only in development and set `output` accordingly:

   ```mjs
   const isDev = process.env.NODE_ENV === 'development';

   export default defineConfig({
     integrations: [
       react(),
       markdoc(),
       ...(isDev ? [keystatic()] : []),
       svelte(),
     ],
     output: isDev ? 'server' : 'static',
   });
   ```

2. Add `getStaticPaths()` to the dynamic routes `src/pages/support/articles/[id].astro` and `src/pages/support/reference/[id].astro` – see [building for static output](https://docs.astro.build/en/guides/content-collections/#building-for-static-output-default).

3. Remove or replace `src/pages/api/*` and the `PostFeedback` widget, which require a server.

Further reading: [Keystatic docs](https://keystatic.com/docs/introduction) · [Disable admin UI in production](https://keystatic.com/docs/recipes/astro-disable-admin-ui-in-production) · [Astro content collections](https://docs.astro.build/en/guides/content-collections/)

---

## Database with Drizzle and Turso

The feedback widget ([`PostFeedback.svelte`](src/components/common/PostFeedback.svelte)) stores helpful / not-helpful counts per document. Votes are keyed by `collection/id` (for example `articles/my-post`) so an article and a reference doc with the same file name never share a counter. The schema is one table in [`src/db/schema.ts`](src/db/schema.ts):

```ts
export const feedback = sqliteTable('Feedback', {
  slug: text().primaryKey(),
  helpful: integer().default(0).notNull(),
  notHelpful: integer().default(0).notNull(),
});
```

All reads and writes go through [`src/feedback/store.ts`](src/feedback/store.ts) – `counts(slug)`, `vote(slug, kind)` and `ping()` – which is also what `pnpm test` exercises against an in-memory libSQL database. The connection itself comes from [`src/db/client.ts`](src/db/client.ts), opened on first use, with its URL resolved in [`src/config.ts`](src/config.ts): `TURSO_DATABASE_URL` when set, `file:.data/local.db` otherwise. **On Vercel the config refuses to fall back to a local file**, so a misconfigured deploy fails loudly instead of silently writing to a throwaway file.

**Set up a production database:**

1. [Create a Turso database](https://sqlite.new) (free tier is fine).
2. Copy the database URL and create an auth token, then add both to `.env` and to your hosting provider:

   ```env
   TURSO_DATABASE_URL=libsql://your-db-name.turso.io
   TURSO_AUTH_TOKEN=your_token
   ```

3. Apply the schema. For a quick start, push it directly:

   ```bash
   pnpm db:push
   ```

   For shared environments, prefer versioned migrations: `pnpm db:generate` writes SQL into `drizzle/`, and `pnpm db:migrate` applies it. Both commands read the same `TURSO_*` variables from `.env`.

> [!NOTE]
> The legacy `ASTRO_DB_REMOTE_URL` and `ASTRO_DB_APP_TOKEN` variables are still accepted as fallbacks.

Further reading: [Drizzle ORM docs](https://orm.drizzle.team/docs/overview) · [Turso docs](https://docs.turso.tech/introduction)

---

## Contact and Newsletter Forms

Each form is declared once in [`src/forms/definitions.ts`](src/forms/definitions.ts) as a list of fields:

```ts
export const contactForm = defineForm({
  name: 'contact',
  endpoint: '/api/contact',
  deliverTo: 'contact',
  fields: [
    {
      name: 'name',
      label: 'Name',
      kind: 'text',
      maxLength: 120,
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      kind: 'email',
      maxLength: 254,
      required: true,
    },
    {
      name: 'message',
      label: 'Message',
      kind: 'textarea',
      maxLength: 5000,
      required: true,
    },
  ],
  messages: {
    legend: 'Contact us',
    sent: 'Thanks! Your message has been sent.',
  },
});
```

The same declaration renders the markup – `<JsonForm form={contactForm} />` from [`JsonForm.astro`](src/components/ui/forms/JsonForm.astro) – and derives the Zod schema the endpoint validates with, so a field the browser requires is always a field the server requires. The route file is one line: `export const POST = formEndpoint(contactForm)`.

[`src/forms/submit.ts`](src/forms/submit.ts) owns the whole pipeline for every form:

- rate-limits by client IP (5 requests/minute per form),
- validates the JSON payload against the derived schema,
- drops submissions that fill the hidden `website` honeypot field, returning a silent success,
- forwards the payload to a webhook, or logs it server-side in **demo mode** when no webhook is configured.

To deliver real submissions, set one variable per delivery target (the contact and quote forms share `contact`):

```bash
FORMSPREE_CONTACT_ENDPOINT=https://formspree.io/f/your-id
FORMSPREE_NEWSLETTER_ENDPOINT=https://formspree.io/f/your-id
# or any JSON webhook:
# FORM_WEBHOOK_CONTACT=
# FORM_WEBHOOK_NEWSLETTER=
```

The CSP in `vercel.json` allows `connect-src` to `formspree.io`; add your own webhook host there if you use something else.

To add a form: add a `defineForm(...)` declaration, a one-line route under `src/pages/api/`, and render it with `<JsonForm>`.

---

## API Routes

| Route                    | Method | Purpose                                                            |
| ------------------------ | ------ | ------------------------------------------------------------------ |
| `/api/contact`           | POST   | Contact form – `{ name, email, message }`                          |
| `/api/quote`             | POST   | Quote form – `{ name, company, email, licenseType, message }`      |
| `/api/newsletter`        | POST   | Newsletter subscribe – `{ email }`                                 |
| `/api/feedback?slug=...` | GET    | Read helpful / not-helpful counts for a document (`articles/<id>`) |
| `/api/feedback`          | POST   | Vote – `{ slug, type: 'helpful' \| 'notHelpful' }`                 |
| `/api/health`            | GET    | `{ ok, database }` – returns 503 if the database is unreachable    |

Form and feedback routes declare a rate-limit policy (`{ name, limit, windowMs }`) enforced by [`src/utils/rate-limit.ts`](src/utils/rate-limit.ts), which answers `429` with a `Retry-After` header. Buckets are in memory, so limits are per instance; replace `createRateLimiter` with one backed by a shared store if you run many instances.

---

## SEO, Fonts and Transitions

Everything global lives in [`src/layout/BaseLayout.astro`](src/layout/BaseLayout.astro):

- **`astro-seo`** renders `<title>`, description, Open Graph and Twitter tags. Override per page by passing `seo`:

  ```astro
  ---
  const seo = {
    title: 'About DataNova',
    description: 'Learn more about DataNova...',
  };
  ---

  <BaseLayout seo={seo}>...</BaseLayout>
  ```

- **`astro-seo-schema`** emits schema.org JSON-LD. Pass a typed `schema` prop (`WithContext<Thing>` from `schema-dts`) to replace the site default.
- **`astro-font`** loads DM Sans and Work Sans from Google Fonts with preloading and `font-display: swap`. Change fonts in the `AstroFont` config.
- **`ClientRouter`** from `astro:transitions` enables view transitions; `prefetch: true` and `experimental.clientPrerender` in `astro.config.mjs` speed up navigation further.
- **`robots.txt`** is generated at [`src/pages/robots.txt.ts`](src/pages/robots.txt.ts) from the `site` value.

**Sitemaps** are not included. The official `@astrojs/sitemap` cannot see dynamic routes in SSR mode; if you need one, use the community [Sitemap Extensions](https://inox-tools.fryuni.dev/sitemap-ext) package.

---

## Contributing

Bug reports and feature requests go to the [issue tracker](https://github.com/mearashadowfax/DataNova/issues); questions to [Discussions](https://github.com/mearashadowfax/DataNova/discussions/new/choose). Pull requests are welcome – CI runs `pnpm format:check`, `pnpm test` and `pnpm build`, so run those locally first. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

MIT – see [LICENSE](LICENSE).

The template has no affiliation with the companies whose logos appear in the demo. They are placeholders and must be replaced in your own site.
