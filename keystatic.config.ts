import { config, fields, collection } from "@keystatic/core";

// https://keystatic.com/docs/local-mode
// Set storage mode: "local" or "github"
let KEYSTATIC_STORAGE_MODE = "local";

// GitHub repository details (required for GitHub mode)
const GITHUB_REPO_OWNER = "REPO_OWNER";
const GITHUB_REPO_NAME = "REPO_NAME";

export default config({
  storage:
    (KEYSTATIC_STORAGE_MODE as "github") === "github"
      ? {
          kind: "github",
          repo: `${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
        }
      : {
          kind: "local",
        },

  collections: {
    articles: collection({
      label: "Articles",
      slugField: "title",
      path: "src/content/articles/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({ label: "Description" }),
        content: fields.markdoc({
          label: "Content",
          options: {
            image: {
              directory: "src/assets/images/articles",
              publicPath: "@images/articles/",
            },
          },
        }),
        date: fields.date({
          label: "Publication date",
          description: "The date of the publication",
        }),
      },
    }),
    reference: collection({
      label: "Reference",
      slugField: "title",
      path: "src/content/reference/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({ label: "Description" }),
        content: fields.markdoc({
          label: "Content",
          options: {
            image: {
              directory: "src/assets/images/reference",
              publicPath: "@images/reference/",
            },
          },
        }),
        date: fields.date({
          label: "Publication date",
          description: "The date of the publication",
        }),
      },
    }),
    spreadsheets: collection({
      label: "Sample Spreadsheets",
      slugField: "title",
      path: "src/data/spreadsheets/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({ name: { label: "Spreadsheet Name" } }),
        description: fields.text({ label: "Description" }),
        url: fields.url({ label: "Link" }),
      },
    }),
    whitepapers: collection({
      label: "Whitepapers",
      slugField: "title",
      path: "src/data/whitepapers/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({ name: { label: "Whitepaper Name" } }),
        description: fields.text({ label: "Description" }),
        readLink: fields.url({ label: "Read Link" }),
        btnTitle: fields.text({ label: "Button Title" }),
        btnLink: fields.url({ label: "Button Link" }),
      },
    }),
  },
});
