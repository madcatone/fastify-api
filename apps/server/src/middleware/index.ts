// Middleware exports
export { authMiddleware, adminAuthMiddleware, protectedRoutes } from './auth';
export { loggerMiddleware, errorLoggerMiddleware, performanceLoggerMiddleware } from './logger';
export { corsMiddleware, type CorsOptions } from './cors';
export { 
  rateLimitMiddleware, 
  strictRateLimitMiddleware, 
  authRateLimitMiddleware,
  createRateLimitMiddleware,
  type RateLimitOptions 
} from './rate-limit';

// Middleware manager
export {
  registerMiddleware,
  developmentMiddleware,
  productionMiddleware,
  getEnvironmentMiddleware,
  type MiddlewareConfig
} from './manager';
