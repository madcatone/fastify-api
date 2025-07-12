import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoController } from '@/todos/controller';
import { TodoService } from '@/todos/service';
import { mockTodos } from '../mocks/database';
import { testUtils } from '../setup';
import { ZodError } from 'zod';

// Mock TodoService
vi.mock('@/todos/service');

describe('TodoController', () => {
  let todoController: TodoController;
  let mockTodoService: any;
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock TodoService 方法
    mockTodoService = {
      getAllTodos: vi.fn(),
      generatePaginationInfo: vi.fn(),
      getTodoById: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn()
    };
    
    // Mock TodoService constructor
    (TodoService as any).mockImplementation(() => mockTodoService);
    
    todoController = new TodoController();
    
    // Mock Fastify request and reply
    mockRequest = {
      query: {},
      params: {},
      body: {},
      log: {
        error: vi.fn()
      }
    };
    
    mockReply = {
      send: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis()
    };
  });

  describe('getAllTodos', () => {
    it('應該成功取得所有 todos', async () => {
      // Arrange
      const queryParams = testUtils.createQueryParams();
      const serviceResult = {
        todos: mockTodos,
        total: 2
      };
      const paginationInfo = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };
      
      mockRequest.query = { page: '1', limit: '10' };
      mockTodoService.getAllTodos.mockResolvedValue(serviceResult);
      mockTodoService.generatePaginationInfo.mockReturnValue(paginationInfo);

      // Act
      await todoController.getAllTodos(mockRequest, mockReply);

      // Assert
      expect(mockTodoService.getAllTodos).toHaveBeenCalledWith({
        page: 1,
        limit: 10
      });
      expect(mockTodoService.generatePaginationInfo).toHaveBeenCalledWith(1, 10, 2);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: {
          todos: mockTodos,
          pagination: paginationInfo,
          filters: {
            author: undefined,
            isActive: undefined,
            search: undefined
          }
        }
      });
    });

    it('應該支援查詢參數篩選', async () => {
      // Arrange
      const queryParams = {
        page: '1',
        limit: '10',
        author: 'Test Author',
        isActive: 'true',
        search: 'test'
      };
      
      mockRequest.query = queryParams;
      mockTodoService.getAllTodos.mockResolvedValue({ todos: [mockTodos[0]], total: 1 });
      mockTodoService.generatePaginationInfo.mockReturnValue({
        page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false
      });

      // Act
      await todoController.getAllTodos(mockRequest, mockReply);

      // Assert
      expect(mockTodoService.getAllTodos).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        author: 'Test Author',
        isActive: true,
        search: 'test'
      });
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            filters: {
              author: 'Test Author',
              isActive: true,
              search: 'test'
            }
          })
        })
      );
    });

    it('應該處理查詢參數驗證錯誤', async () => {
      // Arrange
      mockRequest.query = { page: 'invalid', limit: '101' }; // 超過限制

      // Act
      await todoController.getAllTodos(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid query parameters',
        details: expect.any(Array)
      });
    });

    it('應該處理服務層錯誤', async () => {
      // Arrange
      mockRequest.query = { page: '1', limit: '10' };
      mockTodoService.getAllTodos.mockRejectedValue(new Error('Database error'));

      // Act
      await todoController.getAllTodos(mockRequest, mockReply);

      // Assert
      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch todos'
      });
    });
  });

  describe('getTodoById', () => {
    it('應該成功取得指定 ID 的 todo', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      mockRequest.params = { id: todoId };
      mockTodoService.getTodoById.mockResolvedValue(mockTodos[0]);

      // Act
      await todoController.getTodoById(mockRequest, mockReply);

      // Assert
      expect(mockTodoService.getTodoById).toHaveBeenCalledWith(todoId);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: mockTodos[0]
      });
    });

    it('當 todo 不存在時應該回傳 404', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      mockRequest.params = { id: todoId };
      mockTodoService.getTodoById.mockResolvedValue(null);

      // Act
      await todoController.getTodoById(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Todo not found'
      });
    });

    it('應該處理無效的 UUID 格式', async () => {
      // Arrange
      mockRequest.params = { id: testUtils.generateInvalidUUID() };

      // Act
      await todoController.getTodoById(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid ID format',
        details: expect.any(Array)
      });
    });

    it('應該處理服務層錯誤', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      mockRequest.params = { id: todoId };
      mockTodoService.getTodoById.mockRejectedValue(new Error('Database error'));

      // Act
      await todoController.getTodoById(mockRequest, mockReply);

      // Assert
      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch todo'
      });
    });
  });

  describe('createTodo', () => {
    it('應該成功創建新的 todo', async () => {
      // Arrange
      const todoData = testUtils.createTestTodo();
      const newTodo = { ...mockTodos[0], ...todoData };
      
      mockRequest.body = todoData;
      mockTodoService.createTodo.mockResolvedValue(newTodo);

      // Act
      await todoController.createTodo(mockRequest, mockReply);

      // Assert
      expect(mockTodoService.createTodo).toHaveBeenCalledWith(todoData);
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: newTodo
      });
    });

    it('應該處理請求體驗證錯誤', async () => {
      // Arrange
      mockRequest.body = { content: '', author: '' }; // 空字串不符合驗證規則

      // Act
      await todoController.createTodo(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: expect.any(Array)
      });
    });

    it('應該處理缺少必要欄位', async () => {
      // Arrange
      mockRequest.body = { content: 'Test content' }; // 缺少 author

      // Act
      await todoController.createTodo(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: expect.any(Array)
      });
    });

    it('應該處理服務層錯誤', async () => {
      // Arrange
      const todoData = testUtils.createTestTodo();
      mockRequest.body = todoData;
      mockTodoService.createTodo.mockRejectedValue(new Error('Database error'));

      // Act
      await todoController.createTodo(mockRequest, mockReply);

      // Assert
      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create todo'
      });
    });
  });

  describe('updateTodo', () => {
    it('應該成功更新現有的 todo', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      const updateData = testUtils.createUpdateData();
      const updatedTodo = { ...mockTodos[0], ...updateData };
      
      mockRequest.params = { id: todoId };
      mockRequest.body = updateData;
      mockTodoService.updateTodo.mockResolvedValue(updatedTodo);

      // Act
      await todoController.updateTodo(mockRequest, mockReply);

      // Assert
      expect(mockTodoService.updateTodo).toHaveBeenCalledWith(todoId, updateData);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: updatedTodo
      });
    });

    it('當沒有有效欄位需要更新時應該回傳 400', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      mockRequest.params = { id: todoId };
      mockRequest.body = {}; // 空物件

      // Act
      await todoController.updateTodo(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'No valid fields to update'
      });
    });

    it('當 todo 不存在時應該回傳 404', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      const updateData = testUtils.createUpdateData();
      
      mockRequest.params = { id: todoId };
      mockRequest.body = updateData;
      mockTodoService.updateTodo.mockResolvedValue(null);

      // Act
      await todoController.updateTodo(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Todo not found'
      });
    });

    it('應該處理參數和請求體驗證錯誤', async () => {
      // Arrange
      mockRequest.params = { id: testUtils.generateInvalidUUID() };
      mockRequest.body = { content: '' }; // 無效的更新資料

      // Act
      await todoController.updateTodo(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: expect.any(Array)
      });
    });

    it('應該處理服務層錯誤', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      const updateData = testUtils.createUpdateData();
      
      mockRequest.params = { id: todoId };
      mockRequest.body = updateData;
      mockTodoService.updateTodo.mockRejectedValue(new Error('Database error'));

      // Act
      await todoController.updateTodo(mockRequest, mockReply);

      // Assert
      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update todo'
      });
    });
  });

  describe('deleteTodo', () => {
    it('應該成功刪除現有的 todo', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      
      mockRequest.params = { id: todoId };
      mockTodoService.deleteTodo.mockResolvedValue(true);

      // Act
      await todoController.deleteTodo(mockRequest, mockReply);

      // Assert
      expect(mockTodoService.deleteTodo).toHaveBeenCalledWith(todoId);
      expect(mockReply.status).toHaveBeenCalledWith(204);
      expect(mockReply.send).toHaveBeenCalled();
    });

    it('當 todo 不存在時應該回傳 404', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      
      mockRequest.params = { id: todoId };
      mockTodoService.deleteTodo.mockResolvedValue(false);

      // Act
      await todoController.deleteTodo(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Todo not found'
      });
    });

    it('應該處理無效的 UUID 格式', async () => {
      // Arrange
      mockRequest.params = { id: testUtils.generateInvalidUUID() };

      // Act
      await todoController.deleteTodo(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid ID format',
        details: expect.any(Array)
      });
    });

    it('應該處理服務層錯誤', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      
      mockRequest.params = { id: todoId };
      mockTodoService.deleteTodo.mockRejectedValue(new Error('Database error'));

      // Act
      await todoController.deleteTodo(mockRequest, mockReply);

      // Assert
      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to delete todo'
      });
    });
  });
});