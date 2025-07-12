#!/usr/bin/env tsx

import postgres from 'postgres';

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:temp1234@localhost:5432/fastify-development';
const ADMIN_DATABASE_URL = process.env.ADMIN_DATABASE_URL || 'postgresql://postgres:temp1234@localhost:5432/postgres';

// Parse database name from URL
function getDatabaseName(url: string): string {
  const urlObj = new URL(url);
  return urlObj.pathname.slice(1); // Remove leading slash
}

// Create database if it doesn't exist
async function createDatabase() {
  const dbName = getDatabaseName(DATABASE_URL);
  const adminClient = postgres(ADMIN_DATABASE_URL);
  
  try {
    console.log(`🔍 檢查數據庫 "${dbName}" 是否存在...`);
    
    // Check if database exists
    const result = await adminClient`
      SELECT 1 FROM pg_database WHERE datname = ${dbName}
    `;
    
    if (result.length === 0) {
      console.log(`📦 創建數據庫 "${dbName}"...`);
      await adminClient.unsafe(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ 數據庫 "${dbName}" 創建成功！`);
    } else {
      console.log(`✅ 數據庫 "${dbName}" 已存在`);
    }
  } catch (error) {
    console.error(`❌ 創建數據庫時出錯:`, error);
    throw error;
  } finally {
    await adminClient.end();
  }
}

// Create tables manually
async function createTables() {
  const client = postgres(DATABASE_URL);
  
  try {
    console.log('📋 創建數據表...');

    // Enable pgcrypto extension for UUID generation
    await client`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto"
    `;
    
    // Create todos table
    await client`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        is_active BOOLEAN DEFAULT false NOT NULL
      )
    `;
    
    // Create trigger for updated_at
    await client`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    
    await client`
      DROP TRIGGER IF EXISTS update_todos_updated_at ON todos
    `;
    
    await client`
      CREATE TRIGGER update_todos_updated_at
        BEFORE UPDATE ON todos
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    
    console.log('✅ 數據表創建成功！');
  } catch (error) {
    console.error('❌ 創建數據表失敗:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Seed database with sample data
async function seedDatabase() {
  const client = postgres(DATABASE_URL);
  
  try {
    console.log('🌱 填充種子數據...');
    
    // Check if data already exists
    const existingTodos = await client`
      SELECT id FROM todos LIMIT 1
    `;
    
    if (existingTodos.length > 0) {
      console.log('⚠️  數據已存在，跳過種子數據填充');
      return;
    }
    
    const sampleTodos = [
      { content: '完成 Fastify API 專案', author: 'admin' },
      { content: '設置數據庫', author: 'admin' },
      { content: '編寫 API 文檔', author: 'admin' },
      { content: '實現用戶認證', author: 'admin' },
      { content: '添加單元測試', author: 'admin' }
    ];
    
    for (const todo of sampleTodos) {
      await client`
        INSERT INTO todos (content, author)
        VALUES (${todo.content}, ${todo.author})
      `;
    }
    
    console.log(`✅ 成功插入 ${sampleTodos.length} 條種子數據！`);
  } catch (error) {
    console.error('❌ 種子數據填充失敗:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Reset database (drop and recreate)
async function resetDatabase() {
  const dbName = getDatabaseName(DATABASE_URL);
  const adminClient = postgres(ADMIN_DATABASE_URL);
  
  try {
    console.log('🔄 重置數據庫...');
    
    // Terminate existing connections
    await adminClient.unsafe(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${dbName}'
        AND pid <> pg_backend_pid()
    `);
    
    // Drop database if exists
    await adminClient.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`🗑️  數據庫 "${dbName}" 已刪除`);
    
    // Recreate database
    await adminClient.unsafe(`CREATE DATABASE "${dbName}"`);
    console.log(`📦 數據庫 "${dbName}" 重新創建`);
  } catch (error) {
    console.error('❌ 重置數據庫失敗:', error);
    throw error;
  } finally {
    await adminClient.end();
  }
}

// Check database connection
async function checkConnection() {
  const client = postgres(DATABASE_URL);
  
  try {
    console.log('🔗 檢查數據庫連接...');
    const result = await client`SELECT version()`;
    console.log('✅ 數據庫連接成功！');
    console.log(`📊 PostgreSQL 版本: ${result[0].version}`);
  } catch (error) {
    console.error('❌ 數據庫連接失敗:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Show database status
async function showStatus() {
  const client = postgres(DATABASE_URL);
  
  try {
    console.log('📊 數據庫狀態:');
    
    // Check tables
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log(`📋 表格數量: ${tables.length}`);
    tables.forEach(table => console.log(`  - ${table.table_name}`));
    
    // Check todos count
    const todoCount = await client`SELECT COUNT(*) as count FROM todos`;
    console.log(`📝 Todo 數量: ${todoCount[0].count}`);
    
  } catch (error) {
    console.error('❌ 獲取數據庫狀態失敗:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Main setup function
async function setup() {
  const args = process.argv.slice(2);
  const command = args[0] || 'setup';
  
  console.log('🚀 開始數據庫設置...\n');
  
  try {
    switch (command) {
      case 'reset':
        await resetDatabase();
        await createTables();
        await seedDatabase();
        break;
        
      case 'seed':
        await seedDatabase();
        break;
        
      case 'create-tables':
        await createDatabase();
        await createTables();
        break;
        
      case 'check':
        await checkConnection();
        break;
        
      case 'status':
        await showStatus();
        break;
        
      case 'setup':
      default:
        await createDatabase();
        await createTables();
        await seedDatabase();
        break;
    }
    
    console.log('\n🎉 數據庫設置完成！');
    console.log(`📊 數據庫連接: ${DATABASE_URL}`);
    
  } catch (error) {
    console.error('\n💥 設置失敗:', error);
    process.exit(1);
  }
}

// Show help
function showHelp() {
  console.log(`
數據庫設置腳本使用說明:

命令:
  setup (默認)     - 完整設置：創建數據庫、表格和種子數據
  reset           - 重置數據庫（刪除並重新創建）
  seed            - 只填充種子數據
  create-tables   - 只創建數據表
  check           - 檢查數據庫連接
  status          - 顯示數據庫狀態
  help            - 顯示此幫助信息

環境變量:
  DATABASE_URL      - 目標數據庫連接字符串
  ADMIN_DATABASE_URL - 管理員數據庫連接字符串（用於創建數據庫）

示例:
  npm run db:setup
  npm run db:setup reset
  npm run db:setup seed
  npm run db:setup check
  npm run db:setup status
`);
}

// Run the script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    showHelp();
  } else {
    setup();
  }
}

export { setup, createDatabase, createTables, seedDatabase, resetDatabase, checkConnection, showStatus };
