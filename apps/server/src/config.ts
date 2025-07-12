export const config = {
  // Server Configuration
  server: {
    port: Number(process.env.PORT) || 8080,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  
  // Database Configuration  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:temp1234@localhost:5432/fastify-development',
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;

export default config;
