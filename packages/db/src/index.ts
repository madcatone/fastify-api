import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:temp1234@localhost:5432/fastify-development';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export * from './schema';
export { eq, and, or, like, sql, count, desc, asc } from 'drizzle-orm';