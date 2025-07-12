import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { z } from 'zod';

// JWT Token 驗證 Schema
const authHeaderSchema = z.object({
  authorization: z.string().startsWith('Bearer '),
});

// 擴展 FastifyRequest 型別以包含用戶資訊
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email?: string;
      role?: string;
    };
  }
}

/**
 * 驗證 JWT Token 的 Hook
 * 使用 preHandler hook 在路由處理前驗證用戶身份
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // 從 headers 中取得 authorization
    const result = authHeaderSchema.safeParse(request.headers);
    
    if (!result.success) {
      return reply.status(401).send({
        error: 'Missing or invalid Authorization header',
        message: 'Please provide a valid Bearer token'
      });
    }
    
    const token = result.data.authorization.replace('Bearer ', '');
    
    // TODO: 實際的 JWT 驗證邏輯
    // 這裡先做簡單的示例驗證
    if (token === 'demo-token') {
      // 模擬用戶資料，實際應該從 JWT payload 解析
      request.user = {
        id: 'demo-user-id',
        email: 'demo@example.com',
        role: 'user'
      };
    } else {
      return reply.status(401).send({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }
  } catch (error) {
    request.log.error('Auth middleware error:', error);
    return reply.status(500).send({
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
}

/**
 * 檢查管理員權限的 Hook
 */
export async function adminAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // 先執行基本認證
  await authMiddleware(request, reply);
  
  // 檢查是否已經回應了（認證失敗）
  if (reply.sent) return;
  
  // 檢查用戶角色
  if (!request.user || request.user.role !== 'admin') {
    return reply.status(403).send({
      error: 'Insufficient permissions',
      message: 'Admin role required for this operation'
    });
  }
}

/**
 * 註冊認證相關的 hooks 到 Fastify 實例
 */
export async function registerAuthHooks(fastify: FastifyInstance) {
  // 全域的請求日誌
  fastify.addHook('onRequest', async (request, reply) => {
    request.log.info({
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip
    }, 'Incoming request');
  });
  
  // 可選的認證檢查裝飾器
  fastify.decorate('authenticate', authMiddleware);
  fastify.decorate('requireAdmin', adminAuthMiddleware);
}

/**
 * 建立受保護的路由組
 * 使用範例：
 * 
 * await fastify.register(async function (fastify) {
 *   await fastify.register(protectedRoutes);
 *   
 *   fastify.get('/protected', async (request, reply) => {
 *     return { user: request.user, message: 'This is protected' };
 *   });
 * });
 */
export async function protectedRoutes(fastify: FastifyInstance) {
  // 為這個路由組的所有路由添加認證檢查
  fastify.addHook('preHandler', authMiddleware);
}
