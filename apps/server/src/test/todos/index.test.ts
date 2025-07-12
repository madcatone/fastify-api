import { describe, it, expect } from 'vitest';

describe('Todos Module Test Suite', () => {
  it('所有測試模組應該能正確匯入', async () => {
    // 驗證所有測試相關的模組都能正確匯入
    const modules = await Promise.all([
      import('@/todos/controller'),
      import('@/todos/service'),
      import('@/todos/types'),
      import('@/todos/routes'),
    ]);

    expect(modules).toHaveLength(4);
    
    // 驗證主要類別和函數存在
    const [controllerModule, serviceModule, typesModule, routesModule] = modules;
    
    expect(controllerModule.TodoController).toBeDefined();
    expect(serviceModule.TodoService).toBeDefined();
    expect(typesModule.createTodoSchema).toBeDefined();
    expect(typesModule.updateTodoSchema).toBeDefined();
    expect(typesModule.todoParamsSchema).toBeDefined();
    expect(typesModule.getAllTodosQuerySchema).toBeDefined();
    expect(routesModule.todoRoutes).toBeDefined();
  });

  it('類型定義應該匹配預期結構', async () => {
    const { createTodoSchema, updateTodoSchema } = await import('@/todos/types');
    
    // 驗證 schema 具有正確的結構
    expect(createTodoSchema._def.typeName).toBe('ZodObject');
    expect(updateTodoSchema._def.typeName).toBe('ZodObject');
    
    // 驗證必要欄位存在於 createTodoSchema
    const createShape = createTodoSchema._def.shape();
    expect(createShape.content).toBeDefined();
    expect(createShape.author).toBeDefined();
    
    // 驗證可選欄位存在於 updateTodoSchema
    const updateShape = updateTodoSchema._def.shape();
    expect(updateShape.content).toBeDefined();
    expect(updateShape.author).toBeDefined();
    expect(updateShape.isActive).toBeDefined();
  });
});