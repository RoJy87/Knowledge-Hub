import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
}

export default registerAs<DatabaseConfig>('database', () => ({
  url: process.env.DATABASE_URL || '',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'knowledge_hub',
  password: process.env.DB_PASSWORD || 'knowledge_hub_password',
  name: process.env.DB_NAME || 'knowledge_hub',
}));
