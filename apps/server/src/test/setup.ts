import 'dotenv/config';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '@fastify-api/db';

// 測試環境配置
beforeAll(async () => {
  // 確保使用測試資料庫
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }
  
  console.log('🧪 Setting up test environment...');
});

afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
});

// 每個測試前清理資料
beforeEach(async () => {
  // 在整合測試中可能需要清理資料庫
  // 這裡暫時保留空實現，根據需要添加清理邏輯
});

// 測試工具函數
export const testUtils = {
  // 創建測試用的 todo 資料
  createTestTodo: (overrides: Partial<any> = {}) => ({
    content: 'Test todo content',
    author: 'Test Author',
    ...overrides
  }),
  
  // 創建測試用的更新資料
  createUpdateData: (overrides: Partial<any> = {}) => ({
    content: 'Updated content',
    isActive: false,
    ...overrides
  }),
  
  // 創建測試用的查詢參數
  createQueryParams: (overrides: Partial<any> = {}) => ({
    page: 1,
    limit: 10,
    ...overrides
  }),
  
  // 生成測試用的 UUID
  generateTestUUID: () => '550e8400-e29b-41d4-a716-446655440000',
  
  // 生成無效的 UUID
  generateInvalidUUID: () => 'invalid-uuid-format'
};