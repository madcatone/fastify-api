import { z } from 'zod';

// Zod schemas for validation
export const createTodoSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required'),
});

export const updateTodoSchema = z.object({
  content: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const todoParamsSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

// 分頁參數 Schema
export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(val => parseInt(val, 10)).pipe(z.number().min(1)),
  limit: z.string().optional().default('10').transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)),
});

// 篩選參數 Schema
export const filterSchema = z.object({
  author: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  search: z.string().optional(), // 搜尋 content
});

// Query 參數 Schema (合併分頁和篩選)
export const getAllTodosQuerySchema = paginationSchema.merge(filterSchema);

// TypeScript types inferred from Zod schemas
export type CreateTodoRequest = z.infer<typeof createTodoSchema>;
export type UpdateTodoRequest = z.infer<typeof updateTodoSchema>;
export type TodoParams = z.infer<typeof todoParamsSchema>;

// TypeScript 類型
export type PaginationParams = z.infer<typeof paginationSchema>;
export type FilterParams = z.infer<typeof filterSchema>;
export type GetAllTodosQuery = z.infer<typeof getAllTodosQuerySchema>;

// 分頁資訊類型
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 成功回應格式類型
export interface TodosSuccessResponse {
  success: true;
  data: {
    todos: Array<any>; // 將由 Todo 類型填充
    pagination: PaginationInfo;
    filters: FilterParams;
  };
}
