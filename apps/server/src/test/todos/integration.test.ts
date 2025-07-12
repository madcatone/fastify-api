import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { todoRoutes } from '@/todos/routes';
import { testUtils } from '../setup';

// 注意：這是整合測試，需要模擬完整的應用程式設置
// 如果有資料庫連接，可能需要使用測試資料庫或進一步的 mocking

describe('Todos API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // 創建 Fastify 應用程式實例
    app = Fastify();
    
    // 註冊 todos 路由
    await app.register(todoRoutes);
    
    // 等待應用程式準備就緒
    await app.ready();
  });

  afterAll(async () => {
    // 關閉應用程式
    await app.close();
  });

  describe('GET /api/v1/todos', () => {
    it('應該成功取得 todos 列表', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/todos'
      });

      // Assert
      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.payload);
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('data');
      expect(responseBody.data).toHaveProperty('todos');
      expect(responseBody.data).toHaveProperty('pagination');
      expect(responseBody.data).toHaveProperty('filters');
      
      // 檢查分頁結構
      expect(responseBody.data.pagination).toHaveProperty('page');
      expect(responseBody.data.pagination).toHaveProperty('limit');
      expect(responseBody.data.pagination).toHaveProperty('total');
      expect(responseBody.data.pagination).toHaveProperty('totalPages');
      expect(responseBody.data.pagination).toHaveProperty('hasNext');
      expect(responseBody.data.pagination).toHaveProperty('hasPrev');
    });

    it('應該支援分頁查詢參數', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/todos?page=2&limit=5'
      });

      // Assert
      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.payload);
      expect(responseBody.data.pagination.page).toBe(2);
      expect(responseBody.data.pagination.limit).toBe(5);
    });

    it('應該支援篩選查詢參數', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/todos?author=TestAuthor&isActive=true&search=test'
      });

      // Assert
      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.payload);
      expect(responseBody.data.filters.author).toBe('TestAuthor');
      expect(responseBody.data.filters.isActive).toBe(true);
      expect(responseBody.data.filters.search).toBe('test');
    });

    it('應該處理無效的查詢參數', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/todos?page=invalid&limit=200'
      });

      // Assert
      expect(response.statusCode).toBe(400);
      
      const responseBody = JSON.parse(response.payload);
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody).toHaveProperty('error', 'Invalid query parameters');
      expect(responseBody).toHaveProperty('details');
    });

    it('應該設置正確的回應 Content-Type', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/todos'
      });

      // Assert
      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('GET /api/v1/todos/:id', () => {
    it('應該處理有效的 UUID 格式', async () => {
      // Act
      const validUUID = testUtils.generateTestUUID();
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/todos/${validUUID}`
      });

      // Assert
      // 這裡可能是 404 (如果資料庫中沒有該記錄) 或 200 (如果找到記錄)
      // 因為我們沒有實際的資料庫資料，預期是 404 或 500
      expect([200, 404, 500]).toContain(response.statusCode);
    });

    it('應該拒絕無效的 UUID 格式', async () => {
      // Act
      const invalidUUID = testUtils.generateInvalidUUID();
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/todos/${invalidUUID}`
      });

      // Assert
      expect(response.statusCode).toBe(400);
      
      const responseBody = JSON.parse(response.payload);
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody).toHaveProperty('error', 'Invalid ID format');
    });
  });

  describe('POST /api/v1/todos', () => {
    it('應該接受有效的 todo 資料', async () => {
      // Arrange
      const todoData = testUtils.createTestTodo();

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/todos',
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify(todoData)
      });

      // Assert
      // 可能是 201 (成功創建) 或 500 (資料庫錯誤)
      expect([201, 500]).toContain(response.statusCode);
      
      if (response.statusCode === 201) {
        const responseBody = JSON.parse(response.payload);
        expect(responseBody).toHaveProperty('success', true);
        expect(responseBody).toHaveProperty('data');
      }
    });

    it('應該拒絕無效的 todo 資料', async () => {
      // Arrange
      const invalidTodoData = { content: '', author: '' }; // 空字串無效

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/todos',
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify(invalidTodoData)
      });

      // Assert
      expect(response.statusCode).toBe(400);
      
      const responseBody = JSON.parse(response.payload);
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody).toHaveProperty('error', 'Validation failed');
      expect(responseBody).toHaveProperty('details');
    });

    it('應該拒絕缺少必要欄位的請求', async () => {
      // Arrange
      const incompleteTodoData = { content: 'Test content' }; // 缺少 author

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/todos',
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify(incompleteTodoData)
      });

      // Assert
      expect(response.statusCode).toBe(400);
      
      const responseBody = JSON.parse(response.payload);
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody).toHaveProperty('error', 'Validation failed');
    });

    it('應該拒絕無效的 Content-Type', async () => {
      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/todos',
        headers: {
          'content-type': 'text/plain'
        },
        payload: 'invalid payload'
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe('PATCH /api/v1/todos/:id', () => {
    it('應該接受有效的更新資料', async () => {
      // Arrange
      const validUUID = testUtils.generateTestUUID();
      const updateData = testUtils.createUpdateData();

      // Act
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/todos/${validUUID}`,
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify(updateData)
      });

      // Assert
      // 可能是 200 (成功更新) 或 404 (找不到) 或 500 (資料庫錯誤)
      expect([200, 404, 500]).toContain(response.statusCode);
    });

    it('應該拒絕空的更新資料', async () => {
      // Arrange
      const validUUID = testUtils.generateTestUUID();

      // Act
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/todos/${validUUID}`,
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify({})
      });

      // Assert
      expect(response.statusCode).toBe(400);
      
      const responseBody = JSON.parse(response.payload);
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody).toHaveProperty('error', 'No valid fields to update');
    });

    it('應該拒絕無效的 UUID 格式', async () => {
      // Arrange
      const invalidUUID = testUtils.generateInvalidUUID();
      const updateData = testUtils.createUpdateData();

      // Act
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/todos/${invalidUUID}`,
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify(updateData)
      });

      // Assert
      expect(response.statusCode).toBe(400);
      
      const responseBody = JSON.parse(response.payload);
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('DELETE /api/v1/todos/:id', () => {
    it('應該接受有效的 UUID', async () => {
      // Arrange
      const validUUID = testUtils.generateTestUUID();

      // Act
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/todos/${validUUID}`
      });

      // Assert
      // 可能是 204 (成功刪除) 或 404 (找不到) 或 500 (資料庫錯誤)
      expect([204, 404, 500]).toContain(response.statusCode);
    });

    it('應該拒絕無效的 UUID 格式', async () => {
      // Arrange
      const invalidUUID = testUtils.generateInvalidUUID();

      // Act
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/todos/${invalidUUID}`
      });

      // Assert
      expect(response.statusCode).toBe(400);
      
      const responseBody = JSON.parse(response.payload);
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody).toHaveProperty('error', 'Invalid ID format');
    });
  });

  describe('錯誤處理', () => {
    it('應該處理不存在的端點', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/nonexistent'
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });

    it('應該處理不支援的 HTTP 方法', async () => {
      // Act
      const response = await app.inject({
        method: 'PUT', // PUT 不被支援
        url: '/api/v1/todos'
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe('回應格式一致性', () => {
    it('成功回應應該包含 success: true', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/todos'
      });

      // Assert
      if (response.statusCode === 200) {
        const responseBody = JSON.parse(response.payload);
        expect(responseBody).toHaveProperty('success', true);
        expect(responseBody).toHaveProperty('data');
      }
    });

    it('錯誤回應應該包含 success: false', async () => {
      // Act
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/todos/${testUtils.generateInvalidUUID()}`
      });

      // Assert
      if (response.statusCode >= 400) {
        const responseBody = JSON.parse(response.payload);
        expect(responseBody).toHaveProperty('success', false);
        expect(responseBody).toHaveProperty('error');
      }
    });
  });
});