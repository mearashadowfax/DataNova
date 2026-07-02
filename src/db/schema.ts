import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const feedback = sqliteTable('Feedback', {
  slug: text().primaryKey(),
  helpful: integer().default(0).notNull(),
  notHelpful: integer().default(0).notNull(),
});
