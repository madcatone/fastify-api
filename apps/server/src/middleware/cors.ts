import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

export interface CorsOptions {
  origin?: string | string[] | boolean | ((origin: string) => boolean);
  credentials?: boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
}

/**
 * CORS middleware
 * 處理跨域請求設定
 */
export async function corsMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const origin = request.headers.origin;
  
  // 預設的 CORS 設定
  const corsOptions: CorsOptions = {
    origin: process.env.NODE_ENV === 'development' ? true : ['http://localhost:3000', 'https://yourdomain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400 // 24 hours
  };
  
  // 檢查 origin 是否被允許
  if (corsOptions.origin === true) {
    reply.header('Access-Control-Allow-Origin', '*');
  } else if (Array.isArray(corsOptions.origin)) {
    if (origin && corsOptions.origin.includes(origin)) {
      reply.header('Access-Control-Allow-Origin', origin);
    }
  } else if (typeof corsOptions.origin === 'string') {
    reply.header('Access-Control-Allow-Origin', corsOptions.origin);
  }
  
  // 設定其他 CORS headers
  if (corsOptions.credentials) {
    reply.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (corsOptions.methods) {
    reply.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  }
  
  if (corsOptions.allowedHeaders) {
    reply.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  }
  
  if (corsOptions.exposedHeaders) {
    reply.header('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
  }
  
  if (corsOptions.maxAge) {
    reply.header('Access-Control-Max-Age', corsOptions.maxAge.toString());
  }
  
  // 處理 preflight 請求
  if (request.method === 'OPTIONS') {
    return reply.status(204).send();
  }
}

/**
 * 註冊 CORS hooks 到 Fastify 實例
 */
export async function registerCorsHooks(fastify: FastifyInstance, options?: CorsOptions) {
  // 為所有請求添加 CORS headers
  fastify.addHook('onRequest', corsMiddleware);
  
  // 處理 OPTIONS 請求的路由
  fastify.options('*', async (request, reply) => {
    return reply.status(204).send();
  });
}
