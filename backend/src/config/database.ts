import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'rinah',
  database: process.env.DB_NAME || 'pm_system',
});

export const getConnection = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const query = async (sql: string, params?: any[]) => {
  return pool.query(sql, params);
};

export default pool;
