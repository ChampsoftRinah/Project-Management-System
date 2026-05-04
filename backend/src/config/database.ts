import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'pm_user',
  password: process.env.DB_PASSWORD || 'pm_password',
  database: process.env.DB_NAME || 'pm_dev',
});

export const getConnection = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const query = async (sql: string, params?: any[]) => {
  return pool.query(sql, params);
};

export default pool;
