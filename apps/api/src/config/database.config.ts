import { ConfigFactory } from '@nestjs/config';

export const databaseConfig: ConfigFactory<{
  db: {
    type: 'postgres';
    host: string | undefined;
    port: number;
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
  };
}> = () => ({
  db: {
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
  },
});

export default databaseConfig;
