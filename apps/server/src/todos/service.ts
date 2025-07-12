import { db, todos, Todo } from '@fastify-api/db';
import { eq, and, like, sql, count } from '@fastify-api/db';
import { randomUUID } from 'crypto';
import {
  CreateTodoRequest,
  UpdateTodoRequest,
  GetAllTodosQuery,
  PaginationInfo
} from './types';

export interface GetAllTodosResult {
  todos: Todo[];
  total: number;
}

export class TodoService {
  /**
   * 取得所有 todos（支援分頁和篩選）
   */
  async getAllTodos(queryParams: GetAllTodosQuery): Promise<GetAllTodosResult> {
    const { page, limit, author, isActive, search } = queryParams;
    
    // 建立篩選條件
    const conditions = [];
    
    if (author) {
      conditions.push(eq(todos.author, author));
    }
    
    if (isActive !== undefined) {
      conditions.push(eq(todos.isActive, isActive));
    }
    
    if (search) {
      conditions.push(like(todos.content, `%${search}%`));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // 計算總數
    const totalResult = await db
      .select({ count: count() })
      .from(todos)
      .where(whereClause);
    
    const total = totalResult[0].count;
    
    // 計算偏移量
    const offset = (page - 1) * limit;
    
    // 查詢資料（加上分頁）
    const todosResult = await db
      .select()
      .from(todos)
      .where(whereClause)
      .orderBy(todos.createdAt)
      .limit(limit)
      .offset(offset);
    
    return {
      todos: todosResult,
      total: Number(total)
    };
  }

  /**
   * 產生分頁資訊
   */
  generatePaginationInfo(page: number, limit: number, total: number): PaginationInfo {
    const totalPages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  /**
   * 根據 ID 取得單一 todo
   */
  async getTodoById(id: string): Promise<Todo | null> {
    const result = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 創建新的 todo
   */
  async createTodo(data: CreateTodoRequest): Promise<Todo> {
    const newTodo = await db.insert(todos).values({
      id: randomUUID(),
      content: data.content,
      author: data.author,
    }).returning();
    
    return newTodo[0];
  }

  /**
   * 更新現有的 todo
   */
  async updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo | null> {
    const updatedTodo = await db.update(todos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning();
    
    return updatedTodo.length > 0 ? updatedTodo[0] : null;
  }

  /**
   * 刪除 todo
   */
  async deleteTodo(id: string): Promise<boolean> {
    const deletedTodo = await db.delete(todos)
      .where(eq(todos.id, id))
      .returning();
    
    return deletedTodo.length > 0;
  }
}
