import { FastifyInstance } from 'fastify';
import { registerAuthHooks } from './auth';
import { registerLoggerHooks } from './logger';
import { registerCorsHooks, CorsOptions } from './cors';
import { registerRateLimitHooks, RateLimitOptions } from './rate-limit';

export interface MiddlewareConfig {
  auth?: boolean;
  logger?: boolean;
  cors?: boolean | CorsOptions;
  rateLimit?: boolean | RateLimitOptions;
}

/**
 * 註冊所有 middleware 到 Fastify 實例
 * 
 * @param fastify - Fastify 實例
 * @param config - Middleware 設定
 * 
 * 使用範例:
 * ```typescript
 * await registerMiddleware(fastify, {
 *   auth: true,
 *   logger: true,
 *   cors: { origin: ['http://localhost:3000'] },
 *   rateLimit: { max: 100, windowMs: 15 * 60 * 1000 }
 * });
 * ```
 */
export async function registerMiddleware(
  fastify: FastifyInstance,
  config: MiddlewareConfig = {}
) {
  const {
    auth = false,
    logger = true,
    cors = true,
    rateLimit = true
  } = config;

  // 註冊日誌 middleware (通常最先執行)
  if (logger) {
    await registerLoggerHooks(fastify);
    fastify.log.info('✅ Logger middleware registered');
  }

  // 註冊 CORS middleware
  if (cors) {
    const corsOptions = typeof cors === 'object' ? cors : undefined;
    await registerCorsHooks(fastify, corsOptions);
    fastify.log.info('✅ CORS middleware registered');
  }

  // 註冊 Rate Limiting middleware
  if (rateLimit) {
    const rateLimitOptions = typeof rateLimit === 'object' ? rateLimit : undefined;
    await registerRateLimitHooks(fastify, rateLimitOptions);
    fastify.log.info('✅ Rate limiting middleware registered');
  }

  // 註冊認證 middleware (通常最後執行，因為需要其他 middleware 的支援)
  if (auth) {
    await registerAuthHooks(fastify);
    fastify.log.info('✅ Authentication middleware registered');
  }

  fastify.log.info('🔧 All middleware registered successfully');
}

/**
 * 開發環境的 middleware 設定
 */
export const developmentMiddleware: MiddlewareConfig = {
  auth: false,  // 開發時可能不需要認證
  logger: true,
  cors: true,   // 允許所有來源
  rateLimit: {  // 寬鬆的 rate limiting
    max: 1000,
    windowMs: 15 * 60 * 1000
  }
};

/**
 * 生產環境的 middleware 設定
 */
export const productionMiddleware: MiddlewareConfig = {
  auth: true,
  logger: true,
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
    credentials: true
  },
  rateLimit: {  // 嚴格的 rate limiting
    max: 100,
    windowMs: 15 * 60 * 1000
  }
};

/**
 * 根據環境自動選擇 middleware 設定
 */
export function getEnvironmentMiddleware(): MiddlewareConfig {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionMiddleware;
    case 'development':
    default:
      return developmentMiddleware;
  }
}
