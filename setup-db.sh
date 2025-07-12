#!/bin/bash

# 數據庫快速設置腳本
# 這個腳本將快速設置您的開發數據庫

set -e  # 如果任何命令失敗則退出

echo "🚀 Fastify API 數據庫快速設置"
echo "================================"

# 檢查 Node.js 和 npm 是否可用
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝。請先安裝 Node.js。"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安裝。請先安裝 npm。"
    exit 1
fi

# 檢查 PostgreSQL 是否在運行
if ! command -v pg_isready &> /dev/null; then
    echo "⚠️  pg_isready 未找到。請確保 PostgreSQL 已安裝。"
else
    if ! pg_isready -h localhost -p 5432 &> /dev/null; then
        echo "❌ PostgreSQL 未運行或無法連接到 localhost:5432"
        echo "   請啟動 PostgreSQL 服務後重試。"
        exit 1
    else
        echo "✅ PostgreSQL 連接正常"
    fi
fi

# 安裝依賴（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安裝專案依賴..."
    npm install
else
    echo "✅ 依賴已安裝"
fi

# 運行數據庫設置
echo "🏗️  設置數據庫..."
npm run db:setup

echo ""
echo "🎉 數據庫設置完成！"
echo ""
echo "接下來您可以："
echo "  • 啟動開發服務器: npm run dev"
echo "  • 查看數據庫狀態: npm run db:status" 
echo "  • 重置數據庫: npm run db:reset"
echo ""
echo "數據庫連接信息："
echo "  URL: postgresql://postgres:temp1234@localhost:5432/fastify-development"
echo "  如需更改，請設置 DATABASE_URL 環境變量"
