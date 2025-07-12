import { describe, it, expect } from 'vitest';
import {
  createTodoSchema,
  updateTodoSchema,
  todoParamsSchema,
  getAllTodosQuerySchema,
  paginationSchema,
  filterSchema
} from '@/todos/types';
import { ZodError } from 'zod';

describe('Todos Types and Validation', () => {
  describe('createTodoSchema', () => {
    it('應該接受有效的 todo 創建資料', () => {
      // Arrange
      const validData = {
        content: 'Test todo content',
        author: 'Test Author'
      };

      // Act & Assert
      expect(() => createTodoSchema.parse(validData)).not.toThrow();
      
      const result = createTodoSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('應該拒絕空的 content', () => {
      // Arrange
      const invalidData = {
        content: '',
        author: 'Test Author'
      };

      // Act & Assert
      expect(() => createTodoSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('應該拒絕空的 author', () => {
      // Arrange
      const invalidData = {
        content: 'Test content',
        author: ''
      };

      // Act & Assert
      expect(() => createTodoSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('應該拒絕缺少必要欄位', () => {
      // Arrange
      const incompleteData = {
        content: 'Test content'
        // 缺少 author
      };

      // Act & Assert
      expect(() => createTodoSchema.parse(incompleteData)).toThrow(ZodError);
    });

    it('應該拒絕額外的欄位', () => {
      // Arrange
      const dataWithExtraFields = {
        content: 'Test content',
        author: 'Test Author',
        extraField: 'should be rejected'
      };

      // Act
      const result = createTodoSchema.parse(dataWithExtraFields);

      // Assert
      expect(result).not.toHaveProperty('extraField');
      expect(result).toEqual({
        content: 'Test content',
        author: 'Test Author'
      });
    });
  });

  describe('updateTodoSchema', () => {
    it('應該接受有效的更新資料', () => {
      // Arrange
      const validUpdateData = {
        content: 'Updated content',
        author: 'Updated Author',
        isActive: false
      };

      // Act & Assert
      expect(() => updateTodoSchema.parse(validUpdateData)).not.toThrow();
      
      const result = updateTodoSchema.parse(validUpdateData);
      expect(result).toEqual(validUpdateData);
    });

    it('應該接受部分更新資料', () => {
      // Arrange
      const partialUpdateData = {
        content: 'Updated content'
      };

      // Act & Assert
      expect(() => updateTodoSchema.parse(partialUpdateData)).not.toThrow();
      
      const result = updateTodoSchema.parse(partialUpdateData);
      expect(result).toEqual(partialUpdateData);
    });

    it('應該接受只更新 isActive', () => {
      // Arrange
      const isActiveUpdate = {
        isActive: true
      };

      // Act & Assert
      expect(() => updateTodoSchema.parse(isActiveUpdate)).not.toThrow();
      
      const result = updateTodoSchema.parse(isActiveUpdate);
      expect(result).toEqual(isActiveUpdate);
    });

    it('應該接受空物件（但在業務邏輯中會被拒絕）', () => {
      // Arrange
      const emptyUpdate = {};

      // Act & Assert
      expect(() => updateTodoSchema.parse(emptyUpdate)).not.toThrow();
      
      const result = updateTodoSchema.parse(emptyUpdate);
      expect(result).toEqual({});
    });

    it('應該拒絕空字串的欄位', () => {
      // Arrange
      const invalidUpdateData = {
        content: '',
        author: ''
      };

      // Act & Assert
      expect(() => updateTodoSchema.parse(invalidUpdateData)).toThrow(ZodError);
    });

    it('應該接受有效的布林值', () => {
      // Arrange
      const validBooleanData = {
        isActive: true
      };

      // Act & Assert
      expect(() => updateTodoSchema.parse(validBooleanData)).not.toThrow();
      
      const result = updateTodoSchema.parse(validBooleanData);
      expect(result.isActive).toBe(true);
    });
  });

  describe('todoParamsSchema', () => {
    it('應該接受有效的 UUID', () => {
      // Arrange
      const validParams = {
        id: '550e8400-e29b-41d4-a716-446655440000'
      };

      // Act & Assert
      expect(() => todoParamsSchema.parse(validParams)).not.toThrow();
      
      const result = todoParamsSchema.parse(validParams);
      expect(result).toEqual(validParams);
    });

    it('應該拒絕無效的 UUID 格式', () => {
      // Arrange
      const invalidParams = {
        id: 'invalid-uuid-format'
      };

      // Act & Assert
      expect(() => todoParamsSchema.parse(invalidParams)).toThrow(ZodError);
    });

    it('應該拒絕數字 ID', () => {
      // Arrange
      const numericParams = {
        id: '123'
      };

      // Act & Assert
      expect(() => todoParamsSchema.parse(numericParams)).toThrow(ZodError);
    });

    it('應該拒絕空字串', () => {
      // Arrange
      const emptyParams = {
        id: ''
      };

      // Act & Assert
      expect(() => todoParamsSchema.parse(emptyParams)).toThrow(ZodError);
    });
  });

  describe('paginationSchema', () => {
    it('應該接受有效的分頁參數', () => {
      // Arrange
      const validPagination = {
        page: '2',
        limit: '20'
      };

      // Act & Assert
      expect(() => paginationSchema.parse(validPagination)).not.toThrow();
      
      const result = paginationSchema.parse(validPagination);
      expect(result).toEqual({
        page: 2,
        limit: 20
      });
    });

    it('應該使用預設值', () => {
      // Arrange
      const emptyPagination = {};

      // Act & Assert
      expect(() => paginationSchema.parse(emptyPagination)).not.toThrow();
      
      const result = paginationSchema.parse(emptyPagination);
      expect(result).toEqual({
        page: 1,
        limit: 10
      });
    });

    it('應該轉換字串為數字', () => {
      // Arrange
      const stringPagination = {
        page: '3',
        limit: '5'
      };

      // Act
      const result = paginationSchema.parse(stringPagination);

      // Assert
      expect(typeof result.page).toBe('number');
      expect(typeof result.limit).toBe('number');
      expect(result.page).toBe(3);
      expect(result.limit).toBe(5);
    });

    it('應該拒絕頁數小於 1', () => {
      // Arrange
      const invalidPagination = {
        page: '0',
        limit: '10'
      };

      // Act & Assert
      expect(() => paginationSchema.parse(invalidPagination)).toThrow(ZodError);
    });

    it('應該拒絕限制大於 100', () => {
      // Arrange
      const invalidPagination = {
        page: '1',
        limit: '101'
      };

      // Act & Assert
      expect(() => paginationSchema.parse(invalidPagination)).toThrow(ZodError);
    });

    it('應該拒絕非數字字串', () => {
      // Arrange
      const invalidPagination = {
        page: 'abc',
        limit: 'xyz'
      };

      // Act & Assert
      expect(() => paginationSchema.parse(invalidPagination)).toThrow(ZodError);
    });
  });

  describe('filterSchema', () => {
    it('應該接受有效的篩選參數', () => {
      // Arrange
      const validFilters = {
        author: 'Test Author',
        isActive: 'true',
        search: 'test keyword'
      };

      // Act & Assert
      expect(() => filterSchema.parse(validFilters)).not.toThrow();
      
      const result = filterSchema.parse(validFilters);
      expect(result).toEqual({
        author: 'Test Author',
        isActive: true,
        search: 'test keyword'
      });
    });

    it('應該接受空的篩選參數', () => {
      // Arrange
      const emptyFilters = {};

      // Act & Assert
      expect(() => filterSchema.parse(emptyFilters)).not.toThrow();
      
      const result = filterSchema.parse(emptyFilters);
      expect(result).toEqual({});
    });

    it('應該轉換字串布林值', () => {
      // Arrange
      const booleanFilters = {
        isActive: 'false'
      };

      // Act
      const result = filterSchema.parse(booleanFilters);

      // Assert
      expect(typeof result.isActive).toBe('boolean');
      expect(result.isActive).toBe(false);
    });

    it('應該接受部分篩選參數', () => {
      // Arrange
      const partialFilters = {
        author: 'Test Author'
      };

      // Act & Assert
      expect(() => filterSchema.parse(partialFilters)).not.toThrow();
      
      const result = filterSchema.parse(partialFilters);
      expect(result).toEqual({
        author: 'Test Author'
      });
    });
  });

  describe('getAllTodosQuerySchema', () => {
    it('應該合併分頁和篩選參數', () => {
      // Arrange
      const combinedQuery = {
        page: '2',
        limit: '15',
        author: 'Test Author',
        isActive: 'true',
        search: 'test'
      };

      // Act & Assert
      expect(() => getAllTodosQuerySchema.parse(combinedQuery)).not.toThrow();
      
      const result = getAllTodosQuerySchema.parse(combinedQuery);
      expect(result).toEqual({
        page: 2,
        limit: 15,
        author: 'Test Author',
        isActive: true,
        search: 'test'
      });
    });

    it('應該在只有分頁參數時正常工作', () => {
      // Arrange
      const paginationOnly = {
        page: '1',
        limit: '10'
      };

      // Act & Assert
      expect(() => getAllTodosQuerySchema.parse(paginationOnly)).not.toThrow();
      
      const result = getAllTodosQuerySchema.parse(paginationOnly);
      expect(result).toEqual({
        page: 1,
        limit: 10
      });
    });

    it('應該在只有篩選參數時正常工作', () => {
      // Arrange
      const filterOnly = {
        author: 'Test Author',
        search: 'keyword'
      };

      // Act
      const result = getAllTodosQuerySchema.parse(filterOnly);

      // Assert
      expect(result).toEqual({
        page: 1, // 預設值
        limit: 10, // 預設值
        author: 'Test Author',
        search: 'keyword'
      });
    });
  });

  describe('錯誤訊息驗證', () => {
    it('應該提供有意義的錯誤訊息', () => {
      // Arrange
      const invalidData = {
        content: '',
        author: ''
      };

      // Act & Assert
      try {
        createTodoSchema.parse(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors.length).toBeGreaterThan(0);
        expect(zodError.errors.some(e => e.message === 'Content is required')).toBe(true);
        expect(zodError.errors.some(e => e.message === 'Author is required')).toBe(true);
      }
    });

    it('應該指出正確的欄位路徑', () => {
      // Arrange
      const invalidData = {
        content: '',
        author: 'Valid Author'
      };

      // Act & Assert
      try {
        createTodoSchema.parse(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors.some(e => e.path.includes('content'))).toBe(true);
      }
    });
  });
});