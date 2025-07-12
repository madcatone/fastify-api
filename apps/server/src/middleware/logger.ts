import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

/**
 * 請求日誌 middleware
 * 記錄請求和回應的詳細資訊
 */
export async function loggerMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const startTime = Date.now();
  
  // 記錄請求開始
  request.log.info({
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    contentType: request.headers['content-type'],
    ip: request.ip,
    userId: request.user?.id || 'anonymous'
  }, 'Request started');
  
  // 在回應結束時記錄
  reply.raw.on('finish', () => {
    const duration = Date.now() - startTime;
    
    request.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      contentLength: reply.getHeader('content-length') || 0,
      userId: request.user?.id || 'anonymous'
    }, 'Request completed');
  });
}

/**
 * 錯誤日誌 middleware
 * 統一處理和記錄錯誤
 */
export async function errorLoggerMiddleware(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // 記錄錯誤詳情
  request.log.error({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method: request.method,
      url: request.url,
      headers: request.headers,
      userId: request.user?.id || 'anonymous'
    }
  }, 'Request error occurred');
  
  // 根據錯誤類型返回適當的回應
  if (error.name === 'ValidationError') {
    return reply.status(400).send({
      error: 'Validation failed',
      message: error.message
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  
  // 預設的伺服器錯誤回應
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
}

/**
 * 效能監控 middleware
 * 記錄慢查詢和資源使用情況
 */
export async function performanceLoggerMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();
  
  reply.raw.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    
    const duration = Number(endTime - startTime) / 1000000; // 轉換為毫秒
    const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;
    
    // 記錄效能指標
    const performanceData = {
      method: request.method,
      url: request.url,
      duration: `${duration.toFixed(2)}ms`,
      memoryDiff: `${(memoryDiff / 1024 / 1024).toFixed(2)}MB`,
      statusCode: reply.statusCode,
      userId: request.user?.id || 'anonymous'
    };
    
    // 對於慢請求（超過 1 秒）使用 warn 級別
    if (duration > 1000) {
      request.log.warn(performanceData, 'Slow request detected');
    } else {
      request.log.debug(performanceData, 'Request performance metrics');
    }
  });
}

/**
 * 註冊日誌相關的 hooks 到 Fastify 實例
 */
export async function registerLoggerHooks(fastify: FastifyInstance) {
  // 請求開始時的日誌
  fastify.addHook('onRequest', loggerMiddleware);
  
  // 效能監控（僅在開發環境啟用）
  if (process.env.NODE_ENV === 'development') {
    fastify.addHook('onRequest', performanceLoggerMiddleware);
  }
  
  // 錯誤處理
  fastify.setErrorHandler(errorLoggerMiddleware);
  
  // 請求結束時的清理和最終日誌
  fastify.addHook('onResponse', async (request, reply) => {
    request.log.debug({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      headers: reply.getHeaders()
    }, 'Response sent');
  });
}
