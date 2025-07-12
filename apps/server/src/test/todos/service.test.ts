import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoService } from '@/todos/service';
import { mockTodos, resetDbMocks } from '../mocks/database';
import { testUtils } from '../setup';

// Mock 資料庫模組
vi.mock('@fastify-api/db', () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  };

  return {
    db: mockChain,
    todos: {
      id: 'id',
      content: 'content',
      author: 'author',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      isActive: 'isActive'
    },
    eq: vi.fn(),
    and: vi.fn(),
    like: vi.fn(),
    sql: vi.fn(),
    count: vi.fn(() => ({ count: 2 }))
  };
});

describe('TodoService', () => {
  let todoService: TodoService;
  let mockDb: any;

  beforeEach(async () => {
    // 重置 mocks
    resetDbMocks();
    vi.clearAllMocks();
    
    // 重新匯入以取得最新的 mock
    const { db } = await import('@fastify-api/db');
    mockDb = db;
    
    todoService = new TodoService();
  });

  describe('getAllTodos', () => {
    it('應該成功取得所有 todos（無篩選條件）', async () => {
      // Arrange
      const queryParams = testUtils.createQueryParams();
      
      // Mock 計算總數查詢
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce([{ count: 2 }]);
      
      // Mock 主要資料查詢
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.orderBy.mockReturnValueOnce(mockDb);
      mockDb.limit.mockReturnValueOnce(mockDb);
      mockDb.offset.mockReturnValueOnce(mockTodos);

      // Act
      const result = await todoService.getAllTodos(queryParams);

      // Assert
      expect(result).toEqual({
        todos: mockTodos,
        total: 2
      });
      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(mockDb.from).toHaveBeenCalledTimes(2);
    });

    it('應該支援作者篩選', async () => {
      // Arrange
      const queryParams = testUtils.createQueryParams({ author: 'Test Author' });
      const { eq } = await import('@fastify-api/db');
      
      // Mock responses
      mockDb.where.mockReturnValueOnce([{ count: 1 }]);
      mockDb.offset.mockReturnValueOnce([mockTodos[0]]);

      // Act
      const result = await todoService.getAllTodos(queryParams);

      // Assert
      expect(eq).toHaveBeenCalled();
      expect(result.total).toBe(1);
    });

    it('應該支援活躍狀態篩選', async () => {
      // Arrange
      const queryParams = testUtils.createQueryParams({ isActive: true });
      const { eq } = await import('@fastify-api/db');
      
      // Mock responses
      mockDb.where.mockReturnValueOnce([{ count: 1 }]);
      mockDb.offset.mockReturnValueOnce([mockTodos[0]]);

      // Act
      const result = await todoService.getAllTodos(queryParams);

      // Assert
      expect(eq).toHaveBeenCalled();
      expect(result.total).toBe(1);
    });

    it('應該支援內容搜尋', async () => {
      // Arrange
      const queryParams = testUtils.createQueryParams({ search: 'Test' });
      const { like } = await import('@fastify-api/db');
      
      // Mock responses
      mockDb.where.mockReturnValueOnce([{ count: 2 }]);
      mockDb.offset.mockReturnValueOnce(mockTodos);

      // Act
      const result = await todoService.getAllTodos(queryParams);

      // Assert
      expect(like).toHaveBeenCalled();
      expect(result.todos).toEqual(mockTodos);
    });

    it('應該正確計算分頁偏移量', async () => {
      // Arrange
      const queryParams = testUtils.createQueryParams({ page: 2, limit: 5 });
      
      // Mock responses
      mockDb.where.mockReturnValueOnce([{ count: 10 }]);
      mockDb.offset.mockReturnValueOnce([]);

      // Act
      await todoService.getAllTodos(queryParams);

      // Assert
      expect(mockDb.limit).toHaveBeenCalledWith(5);
      expect(mockDb.offset).toHaveBeenCalledWith(5); // (2-1) * 5 = 5
    });
  });

  describe('generatePaginationInfo', () => {
    it('應該正確生成分頁資訊', () => {
      // Arrange & Act
      const paginationInfo = todoService.generatePaginationInfo(2, 10, 25);

      // Assert
      expect(paginationInfo).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true
      });
    });

    it('應該正確處理第一頁', () => {
      // Arrange & Act
      const paginationInfo = todoService.generatePaginationInfo(1, 10, 25);

      // Assert
      expect(paginationInfo.hasPrev).toBe(false);
      expect(paginationInfo.hasNext).toBe(true);
    });

    it('應該正確處理最後一頁', () => {
      // Arrange & Act
      const paginationInfo = todoService.generatePaginationInfo(3, 10, 25);

      // Assert
      expect(paginationInfo.hasPrev).toBe(true);
      expect(paginationInfo.hasNext).toBe(false);
    });

    it('應該正確處理只有一頁的情況', () => {
      // Arrange & Act
      const paginationInfo = todoService.generatePaginationInfo(1, 10, 5);

      // Assert
      expect(paginationInfo).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });
  });

  describe('getTodoById', () => {
    it('應該成功取得指定 ID 的 todo', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockReturnValueOnce([mockTodos[0]]);

      // Act
      const result = await todoService.getTodoById(todoId);

      // Assert
      expect(result).toEqual(mockTodos[0]);
      expect(mockDb.limit).toHaveBeenCalledWith(1);
    });

    it('當 todo 不存在時應該回傳 null', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockReturnValueOnce([]);

      // Act
      const result = await todoService.getTodoById(todoId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createTodo', () => {
    it('應該成功創建新的 todo', async () => {
      // Arrange
      const todoData = testUtils.createTestTodo();
      const newTodo = { ...mockTodos[0], ...todoData };
      
      mockDb.values.mockReturnValueOnce(mockDb);
      mockDb.returning.mockReturnValueOnce([newTodo]);

      // Act
      const result = await todoService.createTodo(todoData);

      // Assert
      expect(result).toEqual(newTodo);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('創建的 todo 應該包含必要欄位', async () => {
      // Arrange
      const todoData = testUtils.createTestTodo();
      const newTodo = { ...mockTodos[0], ...todoData };
      
      mockDb.values.mockReturnValueOnce(mockDb);
      mockDb.returning.mockReturnValueOnce([newTodo]);

      // Act
      const result = await todoService.createTodo(todoData);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('content', todoData.content);
      expect(result).toHaveProperty('author', todoData.author);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('isActive');
    });
  });

  describe('updateTodo', () => {
    it('應該成功更新現有的 todo', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      const updateData = testUtils.createUpdateData();
      const updatedTodo = { ...mockTodos[0], ...updateData };
      
      mockDb.set.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.returning.mockReturnValueOnce([updatedTodo]);

      // Act
      const result = await todoService.updateTodo(todoId, updateData);

      // Assert
      expect(result).toEqual(updatedTodo);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('當 todo 不存在時應該回傳 null', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      const updateData = testUtils.createUpdateData();
      
      mockDb.set.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.returning.mockReturnValueOnce([]);

      // Act
      const result = await todoService.updateTodo(todoId, updateData);

      // Assert
      expect(result).toBeNull();
    });

    it('更新時應該自動設定 updatedAt', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      const updateData = testUtils.createUpdateData();
      
      mockDb.set.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.returning.mockReturnValueOnce([mockTodos[0]]);

      // Act
      await todoService.updateTodo(todoId, updateData);

      // Assert
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date)
        })
      );
    });
  });

  describe('deleteTodo', () => {
    it('應該成功刪除現有的 todo', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.returning.mockReturnValueOnce([mockTodos[0]]);

      // Act
      const result = await todoService.deleteTodo(todoId);

      // Assert
      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('當 todo 不存在時應該回傳 false', async () => {
      // Arrange
      const todoId = testUtils.generateTestUUID();
      
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.returning.mockReturnValueOnce([]);

      // Act
      const result = await todoService.deleteTodo(todoId);

      // Assert
      expect(result).toBe(false);
    });
  });
});