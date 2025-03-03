// https://astro.build/db/config
import { defineDb, defineTable, column } from "astro:db";

const Feedback = defineTable({
  columns: {
    slug: column.text({ primaryKey: true }),
    helpful: column.number({ default: 0 }),
    notHelpful: column.number({ default: 0 })
  },
});

export default defineDb({
  tables: { Feedback },
});