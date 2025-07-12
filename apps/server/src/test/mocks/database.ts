import { vi } from 'vitest';
import { Todo } from '@fastify-api/db';

// Mock 資料庫回應
export const mockTodos: Todo[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    content: 'Test todo 1',
    author: 'Test Author 1',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    isActive: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    content: 'Test todo 2',
    author: 'Test Author 2',
    createdAt: new Date('2024-01-01T11:00:00Z'),
    updatedAt: new Date('2024-01-01T11:00:00Z'),
    isActive: false
  }
];

// Mock 資料庫操作
export const mockDbOperations = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  offset: vi.fn(),
  orderBy: vi.fn(),
  returning: vi.fn(),
  values: vi.fn()
};

// 重置所有 mock
export const resetDbMocks = () => {
  Object.values(mockDbOperations).forEach(mock => mock.mockReset());
};