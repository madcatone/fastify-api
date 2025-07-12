import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { TodoService } from './service';
import { 
  createTodoSchema, 
  updateTodoSchema, 
  todoParamsSchema,
  getAllTodosQuerySchema,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoParams,
  GetAllTodosQuery,
  TodosSuccessResponse
} from './types';

export class TodoController {
  private todoService: TodoService;

  constructor() {
    this.todoService = new TodoService();
  }

  /**
   * 取得所有 todos（支援分頁和篩選）
   */
  async getAllTodos(request: FastifyRequest<{ Querystring: GetAllTodosQuery }>, reply: FastifyReply) {
    try {
      // 解析和驗證查詢參數
      const queryParams = getAllTodosQuerySchema.parse(request.query);
      
      // 從 service 取得資料
      const { todos, total } = await this.todoService.getAllTodos(queryParams);
      
      // 產生分頁資訊
      const paginationInfo = this.todoService.generatePaginationInfo(
        queryParams.page,
        queryParams.limit,
        total
      );
      
      // 構建回應格式
      const response: TodosSuccessResponse = {
        success: true,
        data: {
          todos,
          pagination: paginationInfo,
          filters: {
            author: queryParams.author,
            isActive: queryParams.isActive,
            search: queryParams.search
          }
        }
      };
      
      return reply.send(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          success: false,
          error: 'Invalid query parameters', 
          details: error.errors 
        });
      }
      request.log.error(error);
      return reply.status(500).send({ 
        success: false,
        error: 'Failed to fetch todos' 
      });
    }
  }

  /**
   * 根據 ID 取得單一 todo
   */
  async getTodoById(request: FastifyRequest<{ Params: TodoParams }>, reply: FastifyReply) {
    try {
      const { id } = todoParamsSchema.parse(request.params);
      const todo = await this.todoService.getTodoById(id);
      
      if (!todo) {
        return reply.status(404).send({ 
          success: false,
          error: 'Todo not found' 
        });
      }
      
      return reply.send({ 
        success: true,
        data: todo 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          success: false,
          error: 'Invalid ID format', 
          details: error.errors 
        });
      }
      request.log.error(error);
      return reply.status(500).send({ 
        success: false,
        error: 'Failed to fetch todo' 
      });
    }
  }

  /**
   * 創建新的 todo
   */
  async createTodo(request: FastifyRequest<{ Body: CreateTodoRequest }>, reply: FastifyReply) {
    try {
      const validatedData = createTodoSchema.parse(request.body);
      const newTodo = await this.todoService.createTodo(validatedData);
      
      return reply.status(201).send({ 
        success: true,
        data: newTodo 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          success: false,
          error: 'Validation failed', 
          details: error.errors 
        });
      }
      request.log.error(error);
      return reply.status(500).send({ 
        success: false,
        error: 'Failed to create todo' 
      });
    }
  }

  /**
   * 更新現有的 todo
   */
  async updateTodo(request: FastifyRequest<{ Params: TodoParams; Body: UpdateTodoRequest }>, reply: FastifyReply) {
    try {
      const { id } = todoParamsSchema.parse(request.params);
      const updateData = updateTodoSchema.parse(request.body);
      
      if (Object.keys(updateData).length === 0) {
        return reply.status(400).send({ 
          success: false,
          error: 'No valid fields to update' 
        });
      }
      
      const updatedTodo = await this.todoService.updateTodo(id, updateData);
      
      if (!updatedTodo) {
        return reply.status(404).send({ 
          success: false,
          error: 'Todo not found' 
        });
      }
      
      return reply.send({ 
        success: true,
        data: updatedTodo 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          success: false,
          error: 'Validation failed', 
          details: error.errors 
        });
      }
      request.log.error(error);
      return reply.status(500).send({ 
        success: false,
        error: 'Failed to update todo' 
      });
    }
  }

  /**
   * 刪除 todo
   */
  async deleteTodo(request: FastifyRequest<{ Params: TodoParams }>, reply: FastifyReply) {
    try {
      const { id } = todoParamsSchema.parse(request.params);
      const deleted = await this.todoService.deleteTodo(id);
      
      if (!deleted) {
        return reply.status(404).send({ 
          success: false,
          error: 'Todo not found' 
        });
      }
      
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          success: false,
          error: 'Invalid ID format', 
          details: error.errors 
        });
      }
      request.log.error(error);
      return reply.status(500).send({ 
        success: false,
        error: 'Failed to delete todo' 
      });
    }
  }
}
