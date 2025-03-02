# Versatile Astro Template for Multi-Page Websites

![DataNova](https://github.com/user-attachments/assets/8ddf1de6-18d1-4c62-8cbb-331805506de5)


DataNova is an open-source, multi-page website template that empowers you to build a variety of websites and applications. From marketing sites to documentation hubs, DataNova provides the foundation you need with [Keystatic CMS](https://keystatic.com/), [Astro DB](https://docs.astro.build/en/guides/astro-db/), and a modern design built with [Astro](https://astro.build/), [Tailwind CSS](https://tailwindcss.com/), and [Preline UI](https://preline.co/).

**[View Live Demo](https://datanova.com/)**

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
* [Content Management](#content-management)
  * [Keystatic CMS](#keystatic-cms)
  * [Content Collections](#content-collections)
* [Data Handling with Astro DB](#data-handling-with-astro-db)
* [Integrations and Enhancements](#integrations-and-enhancements)
  * [Astro SEO](#astro-seo)
  * [Astro Font](#astro-font)
  * [Client-Side Router](#client-side-router)
* [Customization](#customization)
* [Troubleshooting](#troubleshooting)
* [Tools and Technologies](#tools-and-technologies)
* [Contributing](#contributing)
* [License](#license)


## Why Choose DataNova?

* **Versatile:** Build a variety of websites, from blogs and landing pages to complex applications.
* **Easy content management:** Keystatic CMS makes it simple to manage and update your content.
* **Modern technology:** Built with Astro, a fast and modern site generator.
* **Attractive design:** Includes Tailwind CSS and Preline UI for a visually appealing and customizable look.
* **Developer-friendly:** Well-structured codebase for easy customization and extension.

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
To get started, click the `Use this template` button (the big green one at the top right) to create your own repo from this template in your GitHub account.

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
>  ```mjs
>  import { defineConfig } from 'astro/config';
>  // ... other imports
>
>  const isDev = process.env.NODE_ENV === "development"
>
>  export default defineConfig({
>    // ... other configurations
>    integrations: [
>      // ... other integrations like react and markdoc ...
>      ...(isDev ? [keystatic()] :) // uses the integration conditionally
>    ],
>    output: isDev ? 'server' : 'static' // only set server rendering for dev mode
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

### Content Collections
The template includes content collections for:

Articles: Located in src/content/articles
Reference: Located in src/content/reference
Spreadsheets: Located in src/data/spreadsheets
Whitepapers: Located in src/data/whitepapers

## Data Handling with Astro DB
DataNova utilizes Astro DB with Turso for the feedback component. This allows users to provide feedback on articles and reference posts, which is stored in the database. To learn more about Astro DB and Turso, visit the Astro DB documentation and the Turso website.
