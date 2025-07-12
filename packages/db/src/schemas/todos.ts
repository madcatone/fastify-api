import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  author: text('author').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// 類型定義
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
