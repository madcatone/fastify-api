# 數據庫設置腳本

這個腳本幫助您快速設置和管理 Fastify API 專案的 PostgreSQL 數據庫。

## 功能特性

- 🏗️ 自動創建數據庫
- 📋 創建所需的數據表和觸發器
- 🌱 填充種子數據
- 🔄 重置數據庫
- 🔗 檢查數據庫連接
- 📊 查看數據庫狀態

## 前置條件

1. 確保 PostgreSQL 已安裝並運行
2. 安裝專案依賴: `npm install`

## 使用方法

### 完整設置 (推薦首次使用)
```bash
npm run db:setup
```
這將執行：創建數據庫 → 創建表格 → 填充種子數據

### 其他命令

```bash
# 重置數據庫（刪除並重新創建）
npm run db:reset

# 只填充種子數據
npm run db:seed

# 檢查數據庫連接
npm run db:check

# 查看數據庫狀態
npm run db:status

# 顯示幫助信息
npm run db:setup help
```

## 環境變量

您可以通過環境變量配置數據庫連接：

```bash
# 目標數據庫連接字符串
DATABASE_URL=postgresql://username:password@localhost:5432/your_database

# 管理員數據庫連接字符串（用於創建數據庫）
ADMIN_DATABASE_URL=postgresql://username:password@localhost:5432/postgres
```

## 默認配置

如果沒有設置環境變量，腳本將使用以下默認值：

- **DATABASE_URL**: `postgresql://postgres:temp1234@localhost:5432/fastify-development`
- **ADMIN_DATABASE_URL**: `postgresql://postgres:temp1234@localhost:5432/postgres`

## 創建的表格結構

### todos 表
```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);
```

### 觸發器
- `update_todos_updated_at`: 自動更新 `updated_at` 字段

## 種子數據

腳本會自動插入 5 條示例 todo 項目，包括：
- 完成 Fastify API 專案
- 設置數據庫
- 編寫 API 文檔
- 實現用戶認證
- 添加單元測試

## 故障排除

### 常見問題

1. **連接被拒絕**
   - 確保 PostgreSQL 服務正在運行
   - 檢查連接字符串中的主機和端口

2. **權限不足**
   - 確保用戶有創建數據庫的權限
   - 檢查 ADMIN_DATABASE_URL 中的用戶憑證

3. **數據庫已存在**
   - 使用 `npm run db:reset` 重置數據庫
   - 或者手動更改數據庫名稱

### 檢查連接
```bash
# 快速檢查數據庫是否可連接
npm run db:check

# 查看數據庫詳細狀態
npm run db:status
```

## 腳本位置

數據庫設置腳本位於：`scripts/setup-db.ts`

您可以直接運行腳本或通過 npm 命令使用。

## 與 Drizzle ORM 集成

這個腳本與您現有的 Drizzle ORM 配置兼容：
- 使用相同的數據庫 schema
- 支持與 `packages/db` 中的類型定義一致
- 可以與 Drizzle Studio 一起使用

## 開發提示

- 在開發過程中，可以使用 `npm run db:seed` 快速重新填充測試數據
- 使用 `npm run db:status` 監控數據庫狀態
- 在部署前確保運行 `npm run db:setup` 設置生產環境數據庫
