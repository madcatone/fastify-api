import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

export interface RateLimitOptions {
  windowMs?: number;    // 時間窗口（毫秒）
  max?: number;         // 最大請求數
  message?: string;     // 超限時的錯誤訊息
  standardHeaders?: boolean;  // 是否返回標準的 rate limit headers
  legacyHeaders?: boolean;    // 是否返回舊版 headers
  skipSuccessfulRequests?: boolean;  // 是否跳過成功的請求
  skipFailedRequests?: boolean;      // 是否跳過失敗的請求
  keyGenerator?: (request: FastifyRequest) => string;  // 自定義 key 生成器
}

// 簡單的記憶體存儲 rate limit 資料
interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

/**
 * Rate limiting middleware
 * 限制 API 請求頻率
 */
export function createRateLimitMiddleware(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests, please try again later',
    standardHeaders = true,
    legacyHeaders = false,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (request: FastifyRequest) => request.ip
  } = options;

  return async function rateLimitMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const key = keyGenerator(request);
    const now = Date.now();
    
    // 清理過期的記錄
    const keysToDelete: string[] = [];
    rateLimitStore.forEach((data, storeKey) => {
      if (data.resetTime <= now) {
        keysToDelete.push(storeKey);
      }
    });
    keysToDelete.forEach(key => rateLimitStore.delete(key));
    
    // 取得或創建當前 key 的資料
    let data = rateLimitStore.get(key);
    if (!data || data.resetTime <= now) {
      data = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, data);
    }
    
    // 檢查是否超過限制
    if (data.count >= max) {
      const timeUntilReset = Math.ceil((data.resetTime - now) / 1000);
      
      // 設定 rate limit headers
      if (standardHeaders) {
        reply.header('RateLimit-Limit', max.toString());
        reply.header('RateLimit-Remaining', '0');
        reply.header('RateLimit-Reset', new Date(data.resetTime).toISOString());
      }
      
      if (legacyHeaders) {
        reply.header('X-RateLimit-Limit', max.toString());
        reply.header('X-RateLimit-Remaining', '0');
        reply.header('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000).toString());
      }
      
      reply.header('Retry-After', timeUntilReset.toString());
      
      return reply.status(429).send({
        error: 'Too Many Requests',
        message: message,
        retryAfter: timeUntilReset
      });
    }
    
    // 增加計數器（將在 response 時決定是否實際增加）
    const shouldCount = async () => {
      if (skipSuccessfulRequests && reply.statusCode >= 200 && reply.statusCode < 300) {
        return false;
      }
      if (skipFailedRequests && reply.statusCode >= 400) {
        return false;
      }
      return true;
    };
    
    // 在回應結束時更新計數
    reply.raw.on('finish', async () => {
      if (await shouldCount()) {
        data!.count++;
        rateLimitStore.set(key, data!);
      }
    });
    
    // 設定 rate limit headers
    if (standardHeaders) {
      reply.header('RateLimit-Limit', max.toString());
      reply.header('RateLimit-Remaining', (max - data.count - 1).toString());
      reply.header('RateLimit-Reset', new Date(data.resetTime).toISOString());
    }
    
    if (legacyHeaders) {
      reply.header('X-RateLimit-Limit', max.toString());
      reply.header('X-RateLimit-Remaining', (max - data.count - 1).toString());
      reply.header('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000).toString());
    }
  };
}

/**
 * 預設的 rate limit middleware
 */
export const rateLimitMiddleware = createRateLimitMiddleware();

/**
 * 嚴格的 rate limit middleware (用於敏感端點)
 */
export const strictRateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: 'Too many requests to this sensitive endpoint'
});

/**
 * 認證端點的 rate limit middleware
 */
export const authRateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true
});

/**
 * 註冊 rate limiting hooks 到 Fastify 實例
 */
export async function registerRateLimitHooks(fastify: FastifyInstance, options?: RateLimitOptions) {
  const middleware = options ? createRateLimitMiddleware(options) : rateLimitMiddleware;
  
  // 為所有請求添加 rate limiting
  fastify.addHook('preHandler', middleware);
}
