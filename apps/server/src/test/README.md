# Todos API 測試套件

這個目錄包含了 todos API 的完整測試套件，使用 Vitest 作為測試框架。

## 📁 測試結構

```
src/test/
├── README.md              # 測試說明文檔（此檔案）
├── setup.ts               # 測試環境設置和工具函數
├── mocks/
│   └── database.ts        # 資料庫 mock 設置
└── todos/
    ├── index.test.ts       # 模組整合測試
    ├── types.test.ts       # 型別驗證測試
    ├── service.test.ts     # Service 層單元測試
    ├── controller.test.ts  # Controller 層單元測試
    └── integration.test.ts # API 端點整合測試
```

## 🧪 測試類型

### 1. 單元測試 (Unit Tests)
- **Service 測試** (`service.test.ts`): 測試 TodoService 的業務邏輯
- **Controller 測試** (`controller.test.ts`): 測試 TodoController 的 HTTP 請求處理
- **型別測試** (`types.test.ts`): 測試 Zod schema 驗證邏輯

### 2. 整合測試 (Integration Tests)
- **API 端點測試** (`integration.test.ts`): 測試完整的 HTTP API 端點
- **模組測試** (`index.test.ts`): 測試模組間的整合

## 🚀 執行測試

### 基本命令
```bash
# 執行所有測試
npm test

# 執行測試並生成覆蓋率報告
npm run test:coverage

# 監視模式（開發時推薦）
npm run test:watch

# 執行一次性測試
npm run test:run

# 開啟測試 UI 介面
npm run test:ui
```

### 執行特定測試
```bash
# 只執行 Service 測試
npm test -- service.test.ts

# 只執行 Controller 測試
npm test -- controller.test.ts

# 只執行整合測試
npm test -- integration.test.ts

# 執行包含特定關鍵字的測試
npm test -- --grep "創建"
```

## 📊 測試覆蓋率

測試套件目標達到以下覆蓋率：
- **語句覆蓋率**: > 90%
- **分支覆蓋率**: > 85%
- **函數覆蓋率**: > 95%
- **行數覆蓋率**: > 90%

### 查看覆蓋率報告
```bash
# 生成並查看覆蓋率報告
npm run test:coverage

# 報告將生成在 coverage/ 目錄中
# 開啟 coverage/index.html 查看詳細報告
```

## 🛠️ 測試工具

### Mock 函數庫
- **Database Mocks** (`mocks/database.ts`): 模擬資料庫操作
- **Test Utils** (`setup.ts`): 提供測試用的工具函數

### 可用的測試工具函數
```typescript
import { testUtils } from '../setup';

// 創建測試用的 todo 資料
const todoData = testUtils.createTestTodo();

// 創建測試用的更新資料
const updateData = testUtils.createUpdateData();

// 創建測試用的查詢參數
const queryParams = testUtils.createQueryParams();

// 生成測試用的 UUID
const validUUID = testUtils.generateTestUUID();
const invalidUUID = testUtils.generateInvalidUUID();
```

## 📝 測試案例

### Service 層測試涵蓋
- ✅ getAllTodos - 分頁、篩選、搜尋
- ✅ generatePaginationInfo - 分頁計算邏輯
- ✅ getTodoById - 單一資源查詢
- ✅ createTodo - 新增功能
- ✅ updateTodo - 更新功能
- ✅ deleteTodo - 刪除功能

### Controller 層測試涵蓋
- ✅ 所有 HTTP 端點的請求處理
- ✅ 資料驗證和錯誤處理
- ✅ 回應格式驗證
- ✅ 狀態碼正確性

### 整合測試涵蓋
- ✅ 完整的 API 端點流程
- ✅ HTTP 請求/回應處理
- ✅ 錯誤場景處理
- ✅ 回應格式一致性

### 型別測試涵蓋
- ✅ Zod schema 驗證邏輯
- ✅ 資料轉換正確性
- ✅ 錯誤訊息驗證
- ✅ 邊界值測試

## 🔧 測試環境設定

### 環境變數
測試會自動設定 `NODE_ENV=test`，確保使用測試環境配置。

### 資料庫設定
目前使用 mock 資料庫操作，避免對實際資料庫的依賴。如需整合真實資料庫：

1. 設置測試資料庫連線
2. 在 `setup.ts` 中添加資料庫清理邏輯
3. 更新相關測試以使用真實資料庫

## 🐛 測試偵錯

### 常見問題

**1. Mock 函數沒有正確重置**
```bash
# 解決方案：檢查 beforeEach 中的 mock 重置
vi.clearAllMocks();
resetDbMocks();
```

**2. 異步測試超時**
```bash
# 解決方案：增加測試超時時間或檢查異步操作
# 在 vitest.config.ts 中設置 testTimeout
```

**3. 模組匯入錯誤**
```bash
# 解決方案：檢查 tsconfig.json 和 vitest.config.ts 的路徑設定
```

### 偵錯技巧
```typescript
// 在測試中使用 console.log 或 debugger
it('debug test', () => {
  console.log('Debug info:', someVariable);
  debugger; // 瀏覽器開發者工具會在此暫停
});

// 使用 vi.spyOn 監控函數呼叫
const spy = vi.spyOn(mockObject, 'method');
expect(spy).toHaveBeenCalledWith(expectedArgs);
```

## 🎯 最佳實踐

### 測試結構
- 使用 **AAA 模式** (Arrange, Act, Assert)
- 每個測試只測試一個功能點
- 使用描述性的測試名稱

### Mock 使用
- 只 mock 外部依賴（資料庫、API）
- 避免 mock 被測試的程式碼本身
- 在每個測試前重置 mock 狀態

### 測試資料
- 使用工具函數創建測試資料
- 避免硬編碼測試值
- 測試邊界條件和錯誤情況

## 📈 持續改進

### 待改進項目
- [ ] 添加效能測試
- [ ] 添加端到端測試
- [ ] 改進測試覆蓋率
- [ ] 添加壓力測試
- [ ] 整合真實資料庫測試環境

### 貢獻指南
1. 為新功能添加對應測試
2. 確保測試覆蓋率不下降
3. 遵循現有的測試命名和結構慣例
4. 更新文檔說明新增的測試