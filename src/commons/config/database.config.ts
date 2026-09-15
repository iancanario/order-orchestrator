import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  name: process.env.DATABASE_NAME ?? 'order_orchestrator',
  username: process.env.DATABASE_USER ?? 'dev',
  password: process.env.DATABASE_PASSWORD ?? 'dev@1234',
}));