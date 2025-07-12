import { relations } from 'drizzle-orm';
import { todos } from './todos';

// 目前 todos 表沒有關聯，但為將來擴展預留結構
export const todosRelations = relations(todos, ({ one, many }) => ({
  // 將來可以添加關聯，例如：
  // author: one(users, {
  //   fields: [todos.authorId],
  //   references: [users.id],
  // }),
  // category: one(categories, {
  //   fields: [todos.categoryId],
  //   references: [categories.id],
  // }),
  // comments: many(comments),
}));
