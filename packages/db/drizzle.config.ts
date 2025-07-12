import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schemas/*',  // 支援 schemas 目錄下的所有檔案
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:temp1234@localhost:5432/fastify-development',
  },
} satisfies Config;