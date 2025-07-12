# Middleware 使用說明

這個 middleware 系統提供了靈活的方式來配置和管理 Fastify 應用的各種中間件。

## 🚀 快速開始

### 1. 自動配置（推薦）

```typescript
import { registerMiddleware, getEnvironmentMiddleware } from './middleware';

// 根據環境自動選擇配置
const middlewareConfig = getEnvironmentMiddleware();
await registerMiddleware(fastify, middlewareConfig);
```

### 2. 手動配置

```typescript
import { registerMiddleware } from './middleware';

await registerMiddleware(fastify, {
  auth: true,           // 啟用認證
  logger: true,         // 啟用日誌
  cors: {               // 自定義 CORS
    origin: ['http://localhost:3000'],
    credentials: true
  },
  rateLimit: {          // 自定義速率限制
    max: 100,
    windowMs: 15 * 60 * 1000
  }
});
```

## 🔧 可用的 Middleware

### 1. 認證 Middleware (Auth)

```typescript
// 基本認證檢查
fastify.addHook('preHandler', authMiddleware);

// 管理員權限檢查
fastify.addHook('preHandler', adminAuthMiddleware);

// 受保護的路由組
await fastify.register(protectedRoutes);
```

**測試認證**:
```bash
# 沒有 token（會失敗）
curl http://localhost:8080/protected

# 有效 token
curl http://localhost:8080/protected \
  -H "Authorization: Bearer demo-token"
```

### 2. 日誌 Middleware (Logger)

自動記錄：
- 請求開始和結束
- 錯誤詳情
- 效能指標（開發環境）
- 用戶資訊（如果已認證）

### 3. CORS Middleware

```typescript
// 開發環境：允許所有來源
cors: true

// 生產環境：限制特定來源
cors: {
  origin: ['https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}
```

### 4. Rate Limiting Middleware

```typescript
// 一般限制：15分鐘100次請求
rateLimit: { max: 100, windowMs: 15 * 60 * 1000 }

// 嚴格限制：5分鐘10次請求
fastify.addHook('preHandler', strictRateLimitMiddleware);

// 認證端點限制：15分鐘5次請求（只計算失敗的請求）
fastify.addHook('preHandler', authRateLimitMiddleware);
```

## 📝 路由範例

### 一般路由（無需認證）

```typescript
fastify.get('/public', async (request, reply) => {
  return { message: 'This is public' };
});
```

### 受保護路由（需要認證）

```typescript
await fastify.register(async function (fastify) {
  fastify.addHook('preHandler', authMiddleware);
  
  fastify.get('/protected', async (request, reply) => {
    return { 
      message: 'Protected content',
      user: request.user 
    };
  });
});
```

### 管理員路由（需要管理員權限）

```typescript
await fastify.register(async function (fastify) {
  fastify.addHook('preHandler', adminAuthMiddleware);
  
  fastify.get('/admin/users', async (request, reply) => {
    return { message: 'Admin only content' };
  });
});
```

### 特殊限制路由

```typescript
await fastify.register(async function (fastify) {
  // 為敏感端點使用更嚴格的限制
  fastify.addHook('preHandler', strictRateLimitMiddleware);
  
  fastify.post('/reset-password', async (request, reply) => {
    return { message: 'Password reset initiated' };
  });
});
```

## 🌍 環境配置

### 開發環境
- 認證：關閉
- 日誌：詳細
- CORS：允許所有來源
- Rate Limit：寬鬆（1000 requests/15min）

### 生產環境
- 認證：開啟
- 日誌：標準
- CORS：限制特定來源
- Rate Limit：嚴格（100 requests/15min）

## 🔍 監控與除錯

### 查看 Rate Limit 狀態

```bash
curl -I http://localhost:8080/api/v1/todos
```

回應 headers 將包含：
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 2024-01-15T11:00:00.000Z
```

### 測試 CORS

```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8080/api/v1/todos
```

### 查看日誌

日誌會自動包含：
- 請求方法和 URL
- 回應時間
- 用戶資訊
- 錯誤詳情
- 效能指標

## 🎯 最佳實踐

1. **分層認證**：為不同敏感度的端點使用不同的認證級別
2. **適當的 Rate Limiting**：為不同類型的端點設定合適的限制
3. **詳細日誌**：在生產環境中保持適當的日誌級別
4. **CORS 安全**：在生產環境中限制來源域名
5. **錯誤處理**：提供統一和有意義的錯誤回應
