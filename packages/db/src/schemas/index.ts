// 統一導出所有 schemas
export * from './todos';
export * from './relations';

// 統一管理所有表格 (目前只有 todos)
import { todos } from './todos';
import { todosRelations } from './relations';

// 所有表格
export const tables = {
  todos,
} as const;

// 所有關聯
export const relations = {
  todosRelations,
} as const;

// 所有類型
export type Tables = typeof tables;
export type TableNames = keyof Tables;

// 將來可以輕鬆添加新的表格：
// export * from './users';
// export * from './categories';
// export * from './comments';
