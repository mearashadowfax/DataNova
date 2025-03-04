# Versatile Astro Template for Multi-Page Websites

![DataNova](https://github.com/user-attachments/assets/b2ca99ee-8161-4755-9b66-205993ef2910)

DataNova is an open-source, multi-page website template that empowers you to build a variety of websites and applications. From marketing sites to documentation hubs, DataNova provides the foundation you need with [Keystatic CMS](https://keystatic.com/), [Astro DB](https://docs.astro.build/en/guides/astro-db/), and a modern design built with [Astro](https://astro.build/), [Tailwind CSS](https://tailwindcss.com/), and [Preline UI](https://preline.co/).

**[View Live Demo](https://data-nova.vercel.app/)**

## Table of Contents

* [Why Choose DataNova?](#why-choose-datanova)
* [What's New](#whats-new)
* [Features](#features)
* [Getting Started](#getting-started)
  * [Use This Template](#use-this-template)
  * [Clone the Repository](#clone-the-repository)
  * [Installation](#installation)
  * [Development Commands](#development-commands)
* [Deployment](#deployment)
* [Project Structure](#project-structure)
* [Customization](#customization)
* [Content Management](#content-management)
  * [Keystatic CMS](#keystatic-cms)
  * [Content Collections](#content-collections)
* [Data Handling with Astro DB](#data-handling-with-astro-db)
* [Integrations and Enhancements](#integrations-and-enhancements)
  * [Astro SEO](#astro-seo)
  * [Astro Font](#astro-font)
  * [Client-Side Router](#client-side-router)

## Why Choose DataNova?

* **Versatile:** Build a variety of websites, from blogs and landing pages to complex applications.
* **Easy content management:** Keystatic CMS makes it simple to manage and update your content.
* **Modern technology:** Built with Astro for fast, lightweight, and SEO-friendly websites.
* **Developer-friendly:** Modular components, easy customization, and extendable architecture.

### Features

* **Multi-page structure:** Suitable for websites with various sections and content types.
* **Content collections:** Organize and manage different types of content efficiently.
* **Keystatic CMS:** Streamlined content management for easy editing and updates.
* **Astro DB integration:** Facilitates data handling and feedback collection.
* **Feedback component:** Allows users to provide feedback, stored in Astro DB with Turso.
* **Tailwind CSS:** Utility-first styling for rapid UI development and customization.
* **Preline UI:** Interactive components like navbars and modals for enhanced user experience.
* **Astro SEO:** Manage SEO metadata and schema.org data for improved search engine visibility.
* **Astro Font:** Optimized font loading and preloading for better performance.
* **Client-Side Router:** Enables client-side routing with page transitions for smoother navigation.

## What's New

> [!NOTE]
> Currently, there are no planned improvements or known bugs. If you encounter any issues, please report them on our [issues page](https://github.com/mearashadowfax/ScrewFast/issues) or [start a discussion](https://github.com/mearashadowfax/ScrewFast/discussions/new/choose) to share ideas, suggestions, or ask questions.

## Getting Started

This guide will provide you with the necessary steps to set up and familiarize yourself with the Astro project on your local development machine.

### Use This Template

Click the `Use this template` button at the top right of the repository to create your own repo based on this template.

### Clone the Repository

Once your repository is created, you can clone it to your local machine using the following commands:

```bash
git clone https://github.com/[YOUR_USERNAME]/[YOUR_REPO_NAME].git
cd [YOUR_REPO_NAME]
```

### Installation

Start by installing the project dependencies using your preferred package manager. Open your terminal, navigate to the project's root directory, and execute:

```bash
npm install 
```

This command will install all the necessary dependencies defined in the `package.json` file.

### Development Commands

With dependencies installed, you can utilize the following npm scripts to manage your project's development lifecycle:

* `npm run dev`: Runs Astro's development server.
* `npm run preview`: The [Node adapter](https://docs.astro.build/en/guides/integrations-guide/node/) supports `preview` for builds generated with on-demand rendering.
* `npm run build`: Will generate the necessary server files to serve your site.

For detailed help with Astro CLI commands, visit [Astro's documentation](https://docs.astro.build/en/reference/cli-reference/).

## Deployment

DataNova is configured for [Server-Side Rendering (SSR)](https://docs.astro.build/en/guides/on-demand-rendering/) and comes with the Vercel adapter pre-installed. You can deploy it by connecting your GitHub repository to Vercel.

Click the button below to start deploying your project on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmearashadowfax%2FDataNova)

> [!NOTE]
> SSR is used because Keystatic requires server-side execution for its API routes. If you only intend to use Keystatic for local development, you can configure the project for static output as described in the [Keystatic CMS section](#keystatic-cms).

> [!TIP]  
> If you're deploying to a different platform, you may need to install a different adapter.  Astro provides official adapters for various platforms, including Netlify, Cloudflare, and Node.js. You can find a list of adapters in the [Astro documentation](https://docs.astro.build/en/guides/on-demand-rendering/#server-adapters).
>
>To change the adapter, you'll need to modify the `astro.config.mjs` file. For example, to use the Netlify adapter, you would install it with `npx astro add netlify` and then update your `astro.config.mjs` file like this:
>
>```mjs
> import { defineConfig } from 'astro/config';
> import netlify from '@astrojs/netlify';
>
> export default defineConfig({
>    // ...
>    output: 'server',
>    adapter: netlify(),
> });
>```

## Project Structure

DataNova organizes modular sections, components, content, and layout to streamline development and content management.

```md
├── db/                                  # Contains the database schema and migrations
├── public/                              # Static assets that are served directly
└── src/
    ├── assets/
    │   ├── images/                      
    │   └── styles/                      # CSS styles and Tailwind configuration
    ├── components/
    │   ├── common/                      # Commonly used components across the site
    │   ├── sections/                    # Components for specific website sections
    │   └── ui/                          # UI components (forms, icons, buttons)
    ├── content/                         # The articles and reference collection of Markdoc files
    │   ├── articles/
    │   └── reference/
    ├── data/                            # The spreadsheets and whitepapers collection of JSON files
    │   ├── spreadsheets/
    │   └── whitepapers/
    ├── layout/
    │   └── BaseLayout.astro             # A site-wide wrapping page template
    ├── pages/                           # Astro files representing individual pages and website sections
    │   ├── api/
    │   │   └── feedback.ts              # Handles feedback submissions
    │   ├── downloads/
    │   ├── support/
    │   │   └── articles/
    │   │       ├── [id].astro
    │   │       └── index.astro
    │   ├── 404.astro                    # Custom 404 page
    │   ├── about.astro
    │   ├── contact.astro
    │   ├── index.astro                  # The landing/home page
    │   └── robots.txt.ts                # Dynamically generates robots.txt
    ├── utils/                           # Shared utility functions and helpers
    └── content.config.ts                # Contains content collections configuration options
```

## Customization

This section provides guidance on customizing various aspects of the DataNova template, including the navigation bar, mega menu, footer, and sections.

### Navigation

#### Navigation Bar Links

The navigation bar links are stored in the `utils/navigation.ts` file. To add or modify links, update the `navigationLinks` array:

```typescript
export const navigationLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

```

Replace `label` with the desired display text and use `href` to specify the corresponding page path.

Use these links in the `Navbar`:

```astro
   <div class="grow">
     {
       navigationLinks.map((link) => (
         <a
           href={link.href}
           class={`flex items-center rounded-lg p-2 font-medium text-slate-800 hover:bg-slate-100 ${
             currentPath === link.href ? "underline underline-offset-4" : ""
           }`}
           aria-current={currentPath === link.href ? "page" : undefined}
         >
           {link.label}
         </a>
       ))
     }
   </div>
```

The `currentPath` variable is used to highlight the active link in the navigation.

#### Mega Menu Links

The mega menu allows you to create dropdown menus with multiple sections and links. The mega menu links are stored in the `utils/megaMenu/*` files. For example, the downloads mega menu is stored in [utils/megaMenu/downloads.ts](https://github.com/mearashadowfax/DataNova/blob/771087f60258ced93f7ad8ab38669c5ada1a65c6/src/utils/megaMenu/downloads.ts):

```ts
   export const downloadsMenu = [
     {
       sectionTitle: "Download",
       items: [
         {
           icon: "download",
           title: "DataNova Core Tool",
           description: "Download the free trial version.",
           href: "/downloads/datanova-core",
         },
       ],
     },
     {
       sectionTitle: "Licensing",
       items: [
         { icon: "badge", title: "License Options", href: "/downloads/license-options" },
         { icon: "chatBubble", title: "Request a Quote", href: "/downloads/request-quote" },
       ],
     },
   ];
```

You can create new mega menu sections by adding new files to the `utils/megaMenu/` directory.

The mega menu is generated by the `MegaMenu/*.astro` components. For example, the downloads mega menu is generated by the `src/components/common/MegaMenu/Downloads.astro` component:

Generate and display the mega menu in components like `src/components/common/MegaMenu/Downloads.astro`:

```astro
   ---
   import { downloadsMenu } from "@utils/megaMenu/downloads";
   const currentPath = Astro.url.pathname;
   ---
   <div class="hs-dropdown">
     <button class={`hs-dropdown-toggle ${ currentPath.startsWith("/downloads") ? "underline" : "" }`}>
       Downloads
     </button>
     // ...
     <div class="hs-dropdown-menu">
       {
         downloadsMenu.map((section) => (
           <div>
             <p>{section.sectionTitle}</p>
             {section.items.map((item) => (
               <a href={item.href}>
                 <p>{item.title}</p>
                 <p>{item.description}</p>
               </a>
             ))}
           </div>
         ))
       }
     </div>
   </div>
```

To use the mega menu in the navigation bar, import and add the `MegaMenu` components to the `Navbar.astro` component.

#### Footer Links

The footer section is fully customizable. You can modify the company information, contact details, email subscription form, and copyright information.

* **Company Information**: Update the companyName and companyDescription props in the Footer.astro component to reflect your organization's details.
* **Contact Information**: Modify the contactDetails object in the Footer.astro component to specify your address, phone, email, and website.
* **Email Subscription Form**: The footer includes an email subscription form powered by the FooterForm component. You can customize it to collect additional details or adjust styling.
* **Copyright and Attribution**: Update the copyrightYear, craftedBy, and trademarkNotice props in the Footer.astro component to reflect your copyright information and attribution.

### Content Sections and Common Components

Most content sections and common components in DataNova follow a similar structure, making it easy to customize their content and appearance.

**To customize the content:**

* Modify the title, subTitle, and other content variables within the component file.
* Update the call-to-action (CTA) configurations, such as primaryCTA, secondaryCTA, and tertiaryCTA, to change the button text and links.

**To customize the appearance:**

* Use Tailwind CSS utility classes to fine-tune the styling of individual elements.
* Modify the layout and arrangement of elements within the section or component.

## Content Management

### Keystatic CMS

DataNova uses Keystatic CMS for managing content. You can edit content through the Keystatic web interface. For more information on setting up and using Keystatic CMS, refer to the [Keystatic CMS documentation](https://keystatic.com/).

> [!NOTE]
> The template uses Server-Side Rendering (SSR) because the API routes in the Keystatic Admin UI need to perform reads/writes on the file system (or GitHub repo), which require server-side execution.
>
> If you only intend to use Keystatic for local development, you can configure Astro for static output and set Keystatic to local storage mode. This will allow you to deploy your project to any static hosting service.
>
> To configure Astro for static output and Keystatic for local storage mode:
>
> 1. **Update `astro.config.mjs`:**
>
> ```mjs
>  import { defineConfig } from 'astro/config';
>  // ...
>
>  const isDev = process.env.NODE_ENV === "development"
>
>  export default defineConfig({
>    // ...
>    integrations: [
>      // ...
>      ...(isDev ? [keystatic()] :) // Uses the integration conditionally
>    ],
>    output: isDev ? 'server' : 'static' // Only set server rendering for dev mode
>  });
> ```
>
> 2. **Update `keystatic/config.ts`:**
>
> ```ts
> import { config, fields, collection } from "@keystatic/core";
>
> let KEYSTATIC_STORAGE_MODE = "local";
> ```
>
> 3. **Update your dynamic route to use `getStaticPaths()`. Refer to the [Astro documentation](https://docs.astro.build/en/guides/content-collections/#building-for-static-output-default) for details on generating static content from collections.**

### Content Collections

The template includes content collections for:

## Data Handling with Astro DB

DataNova utilizes Astro DB with Turso for the feedback component. This allows users to provide feedback on articles and reference posts, which is stored in the database. To learn more about Astro DB and Turso, visit the Astro DB documentation and the Turso website.

## Integrations and Enhancements

DataNova leverages several Astro integrations to enhance its functionality and improve the developer experience.

### Astro SEO

The [astro-seo](https://github.com/jonasmerlin/astro-seo) integration helps manage SEO metadata and schema.org data, improving the website's visibility on search engines.

In [BaseLayout.astro](https://github.com/mearashadowfax/DataNova/blob/771087f60258ced93f7ad8ab38669c5ada1a65c6/src/layout/BaseLayout.astro#L43), the `SEO` component from `astro-seo` is used to define global SEO settings like `title`, `description`, `openGraph`, and `twitter` metadata. Page-specific SEO settings can be overridden by passing `seo` props to the `BaseLayout` component, as shown in the example below:

```astro
---
//...

const seo = {
  title: "About DataNova",
  description: "Learn more about DataNova...",
};
---

<BaseLayout seo={seo}>
  {/* ... page content ... */}
</BaseLayout>
```

### Astro SEO Schema

The [astro-seo-schema](https://github.com/codiume/orbit/tree/main/packages/astro-seo-schema) integration provides a convenient way to add schema.org structured data to your pages, helping search engines understand the content better.

In [BaseLayout.astro](https://github.com/mearashadowfax/DataNova/blob/771087f60258ced93f7ad8ab38669c5ada1a65c6/src/layout/BaseLayout.astro#L79), the Schema component from `astro-seo-schema` is used to define default schema.org data for the website. Page-specific schema.org data can be added by passing `schema` props to the `BaseLayout` component, as shown in the example below.

```astro
---
// ...
import type { WithContext, Thing } from "schema-dts";

const schema: WithContext<Thing> = {
  // ... schema.org metadata
};
---

<BaseLayout schema={schema}>
  {/* ... page content ... */}
</BaseLayout>
```

### Astro Font

The [astro-font](https://github.com/rishi-raj-jain/astro-font) integration optimizes font loading and preloading, improving website performance.

In [BaseLayout.astro](https://github.com/mearashadowfax/DataNova/blob/771087f60258ced93f7ad8ab38669c5ada1a65c6/src/layout/BaseLayout.astro#L85), the `AstroFont` component is used to define font configurations, including `name`, `src`, `preload`, `display`, `selector`, and `fallback` options. This ensures fonts are loaded efficiently and applied to the correct elements.

### Client-Side Router

The [ClientRouter](https://docs.astro.build/en/guides/view-transitions/) component from `astro:transitions` enables client-side routing with page transitions, providing a smoother and more interactive user experience.

In [BaseLayout.astro](https://github.com/mearashadowfax/DataNova/blob/771087f60258ced93f7ad8ab38669c5ada1a65c6/src/layout/BaseLayout.astro#L82), the `ClientRouter` component is included to activate client-side routing. This allows for page transitions and improves navigation performance.

### Sitemap Generation

While DataNova doesn't include the official [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) integration by default, you can easily add it if needed. However, please note that the official integration cannot generate sitemap entries for dynamic routes in SSR mode.

If you require more advanced sitemap generation capabilities, such as including dynamic routes or customizing sitemap entries, you can use the community-maintained [Sitemap Extensions](https://inox-tools.fryuni.dev/sitemap-ext) package.
