# fastify-api

這是一個使用 Fastify 建立的現代 TypeScript 後端 API TODO 應用程式。

## ✨ 主要功能

### 🔧 後端技術棧
- **Fastify** - 高效能的 Node.js Web 框架，位於 `apps/server`
- **Drizzle ORM** - TypeScript-first 的現代 ORM，版本 ^0.44.2
- **PostgreSQL** - 強大可靠的開源關聯式資料庫
- **Zod** - 強大的運行時資料驗證和型別推斷
- **Postgres.js** - 輕量且高效能的 PostgreSQL 客戶端
- **Dotenv** - 環境變數管理

### 🔧 後端開發工具
- **TypeScript** - 嚴格模式的型別檢查
- **Turborepo** - 高效能 monorepo 建置系統
- **TSX** - 快速的 TypeScript 執行器
- **Vitest** - 快速的單元測試框架
- **自動化數據庫設置** - 一鍵式數據庫創建和種子數據填充
- **分層架構** - Controller-Service-Repository 模式

## 🚀 快速開始

### 前置需求
- Node.js 18+ 或 Bun
- PostgreSQL 資料庫
- pnpm（推薦）、npm 或 bun

### 安裝依賴

```bash
npm install
# 或
pnpm install
# 或
bun install
```

### 環境變數設定

建議在 `apps/server/.env` 文件中設置環境變數：

```bash
# 伺服器配置
PORT=8080
HOST=0.0.0.0
NODE_ENV=development

# 資料庫連線字串
DATABASE_URL=postgresql://postgres:temp1234@localhost:5432/fastify-development

# 管理員資料庫連線（用於創建資料庫）
ADMIN_DATABASE_URL=postgresql://postgres:temp1234@localhost:5432/postgres
```

> 💡 複製 `.env.example` 為 `.env` 文件開始設置：
> ```bash
> cp apps/server/.env.example apps/server/.env
> ```

### 資料庫設定

#### 快速設置（推薦）
```bash
# 一鍵設置數據庫（創建數據庫 + 表格 + 種子數據）
npm run db:setup

# 或者使用快速設置腳本
./setup-db.sh
```

#### 手動設置
```bash
# 使用 Drizzle 推送資料庫 schema（如果有配置）
npm run db:push

# 開啟 Drizzle Studio 資料庫管理界面（如果有配置）
npm run db:studio
```

#### 其他數據庫命令
```bash
# 重置數據庫（刪除並重新創建）
npm run db:reset

# 只填充種子數據
npm run db:seed

# 檢查數據庫連接
npm run db:check

# 查看數據庫狀態
npm run db:status
```

> 📋 詳細的數據庫設置說明請參考：[DATABASE_SETUP.md](docs/DATABASE_SETUP.md)

### 啟動開發伺服器

```bash
# 啟動所有服務（推薦）
npm run dev

# 或使用其他套件管理器
pnpm dev
```

🚀 伺服器將在 `http://localhost:8080` 啟動

## 📁 專案結構

```
fastify-api/
├── apps/
│   └── server/         # Fastify 後端應用
│       ├── src/
│       │   ├── middleware/     # 中間件系統
│       │   │   ├── auth.ts         # 認證中間件
│       │   │   ├── logger.ts       # 日誌中間件
│       │   │   ├── cors.ts         # CORS 處理
│       │   │   ├── rate-limit.ts   # 請求限流
│       │   │   ├── manager.ts      # 中間件管理器
│       │   │   └── index.ts        # 統一導出
│       │   ├── test/           # 測試檔案
│       │   │   ├── middleware-test.ts  # 中間件測試
│       │   │   ├── mocks/          # 測試模擬資料
│       │   │   │   └── database.ts     # 資料庫模擬
│       │   │   ├── todos/          # Todos 功能測試
│       │   │   │   ├── controller.test.ts  # Controller 層測試
│       │   │   │   ├── service.test.ts     # Service 層測試
│       │   │   │   ├── types.test.ts       # 型別驗證測試
│       │   │   │   ├── integration.test.ts # 整合測試
│       │   │   │   └── index.test.ts       # 綜合測試
│       │   │   ├── setup.ts        # 測試環境設置
│       │   │   ├── README.md       # 測試說明文檔
│       │   │   └── SUMMARY.md      # 測試總結
│       │   ├── todos/          # Todos 功能模組（分層架構）
│       │   │   ├── controller.ts   # HTTP 請求處理層
│       │   │   ├── service.ts      # 業務邏輯層
│       │   │   ├── types.ts        # 型別定義與驗證 Schema
│       │   │   └── routes.ts       # API 路由註冊
│       │   ├── config.ts       # 環境變數配置
│       │   └── server.ts       # Fastify 伺服器主檔案
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.ts    # Vitest 測試配置
├── packages/
│   ├── db/             # 共享資料庫模組（模組化 Schema）
│   │   ├── src/
│   │   │   ├── schemas/        # 模組化 Schema 目錄
│   │   │   │   ├── index.ts        # 統一 Schema 管理
│   │   │   │   ├── todos.ts        # Todos 表格定義
│   │   │   │   └── relations.ts    # 表格關聯定義
│   │   │   ├── index.ts        # 資料庫連線和導出
│   │   │   └── schema.ts       # 向後兼容的 Schema 導出
│   │   ├── package.json
│   │   └── drizzle.config.ts
│   └── packages/       # 其他共享套件（預留）
├── scripts/
│   └── setup-db.ts    # 自動化資料庫設置腳本
├── docs/
│   ├── DATABASE_SETUP.md   # 資料庫設置詳細說明
│   ├── MIDDLEWARE.md       # 中間件使用說明
│   ├── ROADMAP.md          # 專案開發路線圖
│   └── tasks/              # 任務規劃文檔
│       ├── 01.md               # 任務文檔
│       └── 03.md               # 任務文檔
├── setup-db.sh        # 快速資料庫設置腳本
├── turbo.json          # Turborepo 配置
├── package.json        # 根 package.json
├── package-lock.json   # NPM 鎖定檔案
└── README.md           # 專案說明文檔
```

### 🏗️ 架構說明

- **Monorepo 結構**: 使用 Turborepo 管理多套件專案
- **分層架構**: 採用 Controller-Service 分層模式
  - **Controller**: 處理 HTTP 請求與回應，負責資料驗證和錯誤處理
  - **Service**: 核心業務邏輯，與資料庫互動
  - **Types**: 統一的型別定義與 Zod 驗證 Schema
  - **Routes**: 路由註冊，連接 URL 端點與 Controller
- **Middleware 系統**: 靈活的中間件架構
  - **認證 Middleware**: JWT token 驗證、角色權限檢查
  - **日誌 Middleware**: 請求追蹤、錯誤記錄、效能監控
  - **CORS Middleware**: 跨域請求處理、preflight 支援
  - **Rate Limiting**: 多層級請求頻率限制、不同端點的差異化保護
- **模組化 Schema 架構**: 可擴展的資料庫 Schema 管理
  - **schemas/todos.ts**: 獨立的 Todo 表格定義
  - **schemas/relations.ts**: 表格關聯定義（預留擴展）
  - **schemas/index.ts**: 統一的 Schema 管理和導出
  - **schema.ts**: 向後兼容的統一導出，無需修改現有代碼
- **共享資料庫模組**: `@fastify-api/db` 包含模組化 schema 和連線邏輯
- **環境變數管理**: 集中在 `config.ts` 處理，支援 dotenv
- **自動化設置**: 提供完整的資料庫設置和種子數據填充
- **TypeScript 嚴格模式**: 確保程式碼品質和型別安全
- **測試架構**: 包含 middleware 測試和驗證

## 🎯 專案功能狀態

### ✅ 已完成功能
- ✅ **Monorepo 架構**: 使用 Turborepo 管理，統一 Drizzle ORM 版本
- ✅ **分層架構**: 實現 Controller-Service 分層，分離關注點
- ✅ **Middleware 系統**: 完整的中間件架構（認證、日誌、CORS、Rate Limiting）
- ✅ **模組化 Schema**: 可擴展的資料庫 Schema 架構，支援表格模組化管理
- ✅ **資料庫設置**: 完整的 PostgreSQL 配置和自動化設置腳本
- ✅ **Todo CRUD API**: 完整的增刪改查 API 端點，支援分頁、篩選、搜尋功能
- ✅ **型別安全**: 使用 TypeScript 和 Zod 進行嚴格的資料驗證
- ✅ **統一回應格式**: 所有 API 使用 `{success: true/false, data: ...}` 格式
- ✅ **環境變數管理**: 集中配置管理，支援 dotenv 載入
- ✅ **資料庫 ORM**: 使用 Drizzle ORM 進行型別安全的資料庫操作
- ✅ **種子資料**: 自動填充測試資料，快速開發環境設置
- ✅ **健康檢查**: API 狀態監控端點
- ✅ **錯誤處理**: 統一的錯誤回應格式與 Zod 驗證錯誤處理
- ✅ **專案清理**: 移除無用檔案，優化目錄結構
- ✅ **Git 設置**: 完整的 .gitignore 設定
- ✅ **CORS 支援**: 跨域請求處理與 preflight 支援
- ✅ **Rate Limiting**: API 請求頻率限制與不同級別的保護
- ✅ **Middleware 測試**: 完整的中間件匯入與功能驗證
- ✅ **完整測試套件**: 使用 Vitest 實現全面的測試架構
  - ✅ **Controller 層測試**: HTTP 請求處理和回應格式驗證
  - ✅ **Service 層測試**: 業務邏輯和資料庫操作測試
  - ✅ **型別驗證測試**: Zod Schema 和 TypeScript 型別測試
  - ✅ **整合測試**: 完整的 API 端到端測試
  - ✅ **資料庫模擬**: 測試專用的資料庫模擬系統
  - ✅ **測試環境設置**: 獨立的測試配置和環境管理

### 🚧 開發中功能
- 🚧 **JWT 認證系統**: 完整的 JWT token 驗證（middleware 已準備）
- 🚧 **API 文檔**: 自動化 API 文檔生成（Swagger/OpenAPI）
- 🚧 **結構化日誌系統**: 基於 Fastify 的結構化日誌記錄（基礎已完成）
- 🚧 **資料庫遷移**: Drizzle Kit 遷移管理
- 🚧 **用戶管理**: 用戶註冊、登入、角色管理系統
- 🚧 **Webhook 支援**: 外部系統整合介面

### 📊 資料庫資訊
- **資料庫**: PostgreSQL
- **預設連接**: `localhost:5432/fastify-development`
- **Tables**: `todos` (已包含 5 筆測試資料)
- **自動功能**: created_at/updated_at 時間戳自動更新

## 📖 API 端點

| 方法     | 路徑                    | 描述                   | 功能              | 狀態 |
|----------|-------------------------|------------------------|-------------------|------|
| `GET`    | `/health`               | 健康檢查端點           | 系統狀態監控      | ✅   |
| `GET`    | `/api/v1/todos`         | 取得所有待辦事項       | 分頁、篩選、搜尋  | ✅   |
| `GET`    | `/api/v1/todos/:id`     | 根據 ID 取得單一待辦事項 | 單筆查詢，UUID驗證 | ✅   |
| `POST`   | `/api/v1/todos`         | 建立一個新的待辦事項   | 新增，Zod驗證     | ✅   |
| `PATCH`  | `/api/v1/todos/:id`     | 更新一個現有的待辦事項 | 部分更新，驗證    | ✅   |
| `DELETE` | `/api/v1/todos/:id`     | 刪除一個待辦事項       | 軟刪除            | ✅   |

### 📊 查詢參數（GET /api/v1/todos）

| 參數 | 類型 | 說明 | 預設值 | 範例 |
|------|------|------|-------|------|
| `page` | number | 頁數 | 1 | `?page=2` |
| `limit` | number | 每頁筆數 (1-100) | 10 | `?limit=20` |
| `author` | string | 依作者篩選 | - | `?author=admin` |
| `isActive` | boolean | 依活躍狀態篩選 | - | `?isActive=true` |
| `search` | string | 搜尋內容關鍵字 | - | `?search=API` |

### 📋 Todo 資料結構

```typescript
interface Todo {
  id: string;           // UUID
  content: string;      // 待辦事項內容
  author: string;       // 作者
  createdAt: Date;      // 創建時間
  updatedAt: Date;      // 更新時間
  isActive: boolean;    // 是否啟用
}
```

### 🏗️ 分層架構詳解

專案採用 **Controller-Service 分層架構**，清楚分離各層職責：

#### 📋 Controller 層 (`controller.ts`)
- **職責**: HTTP 請求處理、回應格式化、錯誤處理
- **功能**: 
  - 使用 Zod Schema 驗證請求資料
  - 呼叫 Service 層執行業務邏輯
  - 統一錯誤回應格式（400, 404, 500）
  - 型別安全的請求參數處理

#### 🔧 Service 層 (`service.ts`)
- **職責**: 核心業務邏輯、資料庫操作
- **功能**:
  - 與 Drizzle ORM 互動
  - 實現 CRUD 操作邏輯
  - 資料轉換與處理
  - 業務規則驗證

#### 📝 Types 層 (`types.ts`)
- **職責**: 型別定義、資料驗證 Schema
- **功能**:
  - Zod Schema 定義（createTodoSchema, updateTodoSchema 等）
  - TypeScript 型別推斷
  - 統一的資料驗證規則

#### 🛣️ Routes 層 (`routes.ts`)
- **職責**: 路由註冊、端點與 Controller 的連接
- **功能**:
  - URL 路徑與 HTTP 方法的定義
  - Controller 方法綁定
  - Fastify 路由註冊

### 🗄️ 模組化 Schema 架構

專案採用 **模組化 Schema** 設計，為未來擴展做好準備：

#### 📁 Schema 目錄結構
```typescript
packages/db/src/schemas/
├── index.ts         # 統一管理和導出所有 schemas
├── todos.ts         # Todo 表格定義和類型
└── relations.ts     # 表格關聯定義（預留擴展）
```

#### 🔧 Schema 模組範例 (`schemas/todos.ts`)
```typescript
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  author: text('author').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
```

#### 🚀 擴展新表格的流程
當需要添加新的資料表時，只需：

1. **創建新的模組檔案** (例如: `schemas/users.ts`)
```typescript
export const users = pgTable('users', {
  // ...columns
});
```

2. **更新統一導出** (`schemas/index.ts`)
```typescript
export * from './users';
```

3. **添加關聯** (如需要，在 `relations.ts`)
```typescript
export const usersRelations = relations(users, ({ many }) => ({
  todos: many(todos),
}));
```

#### ✅ 優勢
- **模組化管理**: 每個功能有獨立的 schema 檔案
- **團隊協作**: 減少合併衝突，各模組獨立開發
- **向後兼容**: 現有代碼無需修改，保持原有匯入方式
- **易於維護**: 清晰的表格關係和類型定義
- **可擴展性**: 輕鬆添加新表格而不影響現有結構

## 🧪 測試架構

### 🔍 測試套件概覽

專案使用 **Vitest** 作為測試框架，提供完整的測試覆蓋率：

#### 📊 測試覆蓋範圍
- **Controller 層測試**: HTTP 請求處理、錯誤回應、資料驗證
- **Service 層測試**: 業務邏輯、資料庫操作、CRUD 功能 
- **型別驗證測試**: Zod Schema 驗證、TypeScript 型別檢查
- **整合測試**: 端到端 API 測試、完整流程驗證
- **Middleware 測試**: 中間件功能、權限驗證、CORS 處理

#### 🛠️ 測試工具與配置
- **Vitest**: 快速的單元測試框架，支援 TypeScript
- **資料庫模擬**: 獨立的測試資料庫模擬系統
- **測試環境隔離**: 專用的測試配置和環境變數
- **覆蓋率報告**: 自動生成測試覆蓋率統計

#### 🚀 運行測試
```bash
# 運行所有測試
npm run test

# 監控模式（檔案變更時自動重新測試）
npm run test:watch

# 啟動 Vitest UI 界面
npm run test:ui

# 運行特定測試檔案
npm run test -- todos/controller.test.ts

# 運行特定測試套件
npm run test -- --grep "Controller"
```

#### 📁 測試檔案結構
```
apps/server/src/test/
├── middleware-test.ts      # 中間件測試
├── mocks/                  # 測試模擬資料
│   └── database.ts             # 資料庫模擬
├── todos/                  # Todos 功能測試
│   ├── controller.test.ts      # Controller 層測試
│   ├── service.test.ts         # Service 層測試  
│   ├── types.test.ts           # 型別驗證測試
│   ├── integration.test.ts     # 整合測試
│   └── index.test.ts           # 綜合測試
├── setup.ts                # 測試環境設置
├── README.md               # 測試說明文檔
└── SUMMARY.md              # 測試總結
```

## 🧪 測試 API

#### 🔥 基本端點測試

```bash
# 健康檢查（查看 rate limit headers）
curl -I http://localhost:8080/health

# 取得所有 todos
curl http://localhost:8080/api/v1/todos

# 根據 ID 取得單一 todo
curl http://localhost:8080/api/v1/todos/[UUID]

# 建立新的 todo
curl -X POST http://localhost:8080/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"content":"新的待辦事項","author":"測試用戶"}'

# 更新 todo
curl -X PATCH http://localhost:8080/api/v1/todos/[UUID] \
  -H "Content-Type: application/json" \
  -d '{"content":"更新的內容","isActive":false}'

# 刪除 todo
curl -X DELETE http://localhost:8080/api/v1/todos/[UUID]
```

#### 🛡️ Middleware 功能測試

```bash
# CORS preflight 測試
curl -X OPTIONS http://localhost:8080/api/v1/todos \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -I

# Rate Limiting 測試（查看限制 headers）
curl -I http://localhost:8080/api/v1/todos

# 認證測試（開發環境中預設關閉）
curl http://localhost:8080/api/v1/todos \
  -H "Authorization: Bearer demo-token"

# 測試嚴格 rate limit（POST/DELETE 端點）
for i in {1..15}; do 
  curl -X POST http://localhost:8080/api/v1/todos \
    -H "Content-Type: application/json" \
    -d '{"content":"測試 '$i'","author":"測試"}' \
    -w "\nStatus: %{http_code}\n" || break
done
```

#### 🔍 回應格式範例

**成功回應（GET /api/v1/todos）**:
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "content": "完成 API 文檔",
        "author": "開發者",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "author": "開發者",
      "isActive": true,
      "search": "API"
    }
  }
}
```

**成功回應（單一資源）**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "完成 API 文檔",
    "author": "開發者",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "isActive": true
  }
}
```

**錯誤回應**:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "path": ["content"],
      "message": "Content is required"
    }
  ]
}
```

## ⚙️ Middleware 配置

專案使用靈活的 middleware 系統，可根據環境自動配置或手動設定。

### 🔧 自動配置（推薦）

```typescript
// 在 server.ts 中自動根據環境選擇配置
const middlewareConfig = getEnvironmentMiddleware();
await registerMiddleware(fastify, middlewareConfig);
```

### 🎛️ 手動配置

```typescript
// 自定義 middleware 配置
await registerMiddleware(fastify, {
  auth: true,           // 啟用 JWT 認證
  logger: true,         // 啟用詳細日誌
  cors: {               // 自定義 CORS 設定
    origin: ['http://localhost:3000'],
    credentials: true
  },
  rateLimit: {          // 自定義限流設定
    max: 200,           // 15分鐘200次請求
    windowMs: 15 * 60 * 1000
  }
});
```

### 🌍 環境差異

- **開發環境**: 認證關閉、CORS 寬鬆、限流寬鬆（1000 req/15min）
- **生產環境**: 認證開啟、CORS 嚴格、限流嚴格（100 req/15min）

> 📖 詳細的 middleware 使用說明請參考：[MIDDLEWARE.md](docs/MIDDLEWARE.md)

## 🛠️ 開發命令

### 專案管理
```bash
npm run dev         # 啟動開發服務器
npm run build       # 構建專案
npm run test        # 運行 Vitest 測試套件
npm run test:watch  # 監控模式運行測試
npm run test:ui     # 啟動 Vitest UI 界面
```

### 資料庫管理
```bash
npm run db:setup    # 完整設置（創建DB + 表格 + 種子數據）
npm run db:reset    # 重置資料庫
npm run db:seed     # 只填充種子資料
npm run db:check    # 檢查資料庫連接
npm run db:status   # 查看資料庫狀態
```

### 快速啟動
```bash
# 1. 安裝依賴
npm install

# 2. 設置資料庫
npm run db:setup

# 3. 啟動開發服務器
npm run dev

# 4. 測試 API
curl http://localhost:8080/health
```

## 🔧 故障排除

### 常見問題

**1. 無法連接資料庫**
```bash
# 檢查 PostgreSQL 是否運行
npm run db:check

# 重新設置資料庫
npm run db:reset

# 檢查環境變數設置
cat apps/server/.env
```

**2. 端口被佔用**
```bash
# 修改端口 (預設 8080)
PORT=3000 npm run dev

# 或在 .env 文件中設置
echo "PORT=3000" >> apps/server/.env
```

**3. Drizzle ORM 依賴衝突**
```bash
# 檢查版本一致性
npm list drizzle-orm

# 重新安裝依賴
rm -rf node_modules package-lock.json
npm install
```

**4. TypeScript 編譯錯誤**
```bash
# 檢查型別錯誤
npm run typecheck

# 清除 TypeScript 緩存
rm -rf apps/server/dist
npm run build
```

**5. 環境變數載入問題**
```bash
# 檢查 .env 檔案存在
ls -la apps/server/.env

# 確認 dotenv 載入順序
# 在 server.ts 第一行確認有 import 'dotenv/config'
```

### 🩺 健康檢查命令
```bash
# 快速系統檢查
npm run db:check     # 資料庫連接
curl localhost:8080/health  # API 狀態
npm run db:status    # 資料表狀態
```

## 📄 授權

本專案採用 [MIT License](LICENSE) 授權。