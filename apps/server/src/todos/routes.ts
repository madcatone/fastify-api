import { FastifyInstance } from 'fastify';
import { TodoController } from './controller';
import { authRateLimitMiddleware, strictRateLimitMiddleware } from '../middleware';

export async function todoRoutes(fastify: FastifyInstance) {
  const todoController = new TodoController();

  // GET /api/v1/todos - Get all todos
  fastify.get('/api/v1/todos', {
    handler: todoController.getAllTodos.bind(todoController)
  });

  // GET /api/v1/todos/:id - Get single todo by ID
  fastify.get('/api/v1/todos/:id', {
    handler: todoController.getTodoById.bind(todoController)
  });

  // POST /api/v1/todos - Create new todo
  // 為創建操作添加更嚴格的 rate limiting
  fastify.post('/api/v1/todos', {
    preHandler: [strictRateLimitMiddleware],
    handler: todoController.createTodo.bind(todoController)
  });

  // PATCH /api/v1/todos/:id - Update existing todo
  fastify.patch('/api/v1/todos/:id', {
    handler: todoController.updateTodo.bind(todoController)
  });

  // DELETE /api/v1/todos/:id - Delete todo
  // 為刪除操作添加嚴格的 rate limiting
  fastify.delete('/api/v1/todos/:id', {
    preHandler: [strictRateLimitMiddleware],
    handler: todoController.deleteTodo.bind(todoController)
  });
  
  // 受保護的管理端點範例（需要啟用認證）
  // fastify.register(async function (fastify) {
  //   fastify.addHook('preHandler', fastify.authenticate);
  //   
  //   // GET /api/v1/todos/admin/stats - Get admin statistics
  //   fastify.get('/api/v1/todos/admin/stats', async (request, reply) => {
  //     // 這裡可以添加管理員統計邏輯
  //     return {
  //       message: 'Admin stats endpoint',
  //       user: request.user,
  //       timestamp: new Date().toISOString()
  //     };
  //   });
  // });
}