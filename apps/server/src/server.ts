import 'dotenv/config';
import Fastify from 'fastify';
import { todoRoutes } from './todos/routes';
import { registerMiddleware, getEnvironmentMiddleware } from './middleware';
import config from './config';

const fastify = Fastify({
  logger: config.server.env === 'development',
});

// 註冊 middleware
async function setupMiddleware() {
  // 根據環境自動配置 middleware
  const middlewareConfig = getEnvironmentMiddleware();
  
  // 也可以手動配置：
  // const middlewareConfig = {
  //   auth: false,
  //   logger: true,
  //   cors: { origin: ['http://localhost:3000'] },
  //   rateLimit: { max: 200, windowMs: 15 * 60 * 1000 }
  // };
  
  await registerMiddleware(fastify, middlewareConfig);
}

// 註冊路由
async function setupRoutes() {
  // 一般路由（不需要認證）
  await fastify.register(todoRoutes);
  
  // 健康檢查端點
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.server.env,
      database: config.database.url.split('@')[1] || 'configured'
    };
  });
  
  // 受保護的路由範例（需要認證）
  // await fastify.register(async function (fastify) {
  //   // 為這組路由添加認證要求
  //   fastify.addHook('preHandler', fastify.authenticate);
  //   
  //   fastify.get('/protected', async (request, reply) => {
  //     return { 
  //       message: 'This is a protected route',
  //       user: request.user 
  //     };
  //   });
  // });
  
  // 管理員路由範例
  // await fastify.register(async function (fastify) {
  //   fastify.addHook('preHandler', fastify.requireAdmin);
  //   
  //   fastify.get('/admin/stats', async (request, reply) => {
  //     return { message: 'Admin only stats' };
  //   });
  // });
}

const start = async () => {
  try {
    // 設置 middleware
    await setupMiddleware();
    
    // 設置路由
    await setupRoutes();
    
    const { port, host, env } = config.server;
    
    await fastify.listen({ port, host });
    fastify.log.info(`🚀 Server listening on http://localhost:${port}`);
    fastify.log.info(`🌍 Environment: ${env}`);
    fastify.log.info(`💾 Database: ${config.database.url.split('@')[1] || 'configured'}`);
    
    // 顯示已註冊的路由
    if (env === 'development') {
      fastify.log.info('📋 Available routes:');
      fastify.log.info('  GET  /health');
      fastify.log.info('  GET  /api/v1/todos');
      fastify.log.info('  GET  /api/v1/todos/:id');
      fastify.log.info('  POST /api/v1/todos');
      fastify.log.info('  PATCH /api/v1/todos/:id');
      fastify.log.info('  DELETE /api/v1/todos/:id');
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();