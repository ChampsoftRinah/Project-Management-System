import { query } from '../config/database';

export class BaseRepository<T> {
  protected tableName: string;

  async findById(id: string, tenantId: string): Promise<T | null> {
    const result = await query(`SELECT * FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2`, [
      id,
      tenantId,
    ]);
    return result.rows[0] || null;
  }

  async list(tenantId: string, limit: number = 50, offset: number = 0): Promise<T[]> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    return result.rows;
  }

  async create(tenantId: string, data: any): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const result = await query(
      `INSERT INTO ${this.tableName} (tenant_id, ${keys.join(', ')}) VALUES ($1, ${placeholders}) RETURNING *`,
      [tenantId, ...values]
    );
    return result.rows[0];
  }

  async update(id: string, tenantId: string, data: any): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const result = await query(
      `UPDATE ${this.tableName} SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} AND tenant_id = $${keys.length + 2} RETURNING *`,
      [...values, id, tenantId]
    );
    return result.rows[0];
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await query(`DELETE FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
  }
}
