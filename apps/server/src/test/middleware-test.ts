/**
 * 測試 middleware 模組是否能正確導入
 */

// 測試所有 middleware 導入
import {
  // Auth middleware
  authMiddleware,
  adminAuthMiddleware,
  protectedRoutes,
  
  // Logger middleware
  loggerMiddleware,
  errorLoggerMiddleware,
  performanceLoggerMiddleware,
  
  // CORS middleware
  corsMiddleware,
  type CorsOptions,
  
  // Rate limit middleware
  rateLimitMiddleware,
  strictRateLimitMiddleware,
  authRateLimitMiddleware,
  createRateLimitMiddleware,
  type RateLimitOptions,
  
  // Manager
  registerMiddleware,
  developmentMiddleware,
  productionMiddleware,
  getEnvironmentMiddleware,
  type MiddlewareConfig
} from '../middleware';

console.log('✅ All middleware modules imported successfully');

// 檢查關鍵函數是否存在
const imports = {
  authMiddleware: typeof authMiddleware,
  loggerMiddleware: typeof loggerMiddleware,
  corsMiddleware: typeof corsMiddleware,
  rateLimitMiddleware: typeof rateLimitMiddleware,
  registerMiddleware: typeof registerMiddleware,
  getEnvironmentMiddleware: typeof getEnvironmentMiddleware
};

console.log('📋 Import types:', imports);

// 檢查是否都是函數
const allAreFunctions = Object.values(imports).every(type => type === 'function');
console.log('🔍 All imports are functions:', allAreFunctions);

export { imports };
