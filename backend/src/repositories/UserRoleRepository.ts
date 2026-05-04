import { BaseRepository } from './BaseRepository';
import { UserRole } from '../types/entities';
import { query } from '../config/database';

export class UserRoleRepository extends BaseRepository<UserRole> {
  protected tableName = 'user_roles';

  async assignRole(
    tenantId: string,
    userId: string,
    role: string,
    assignedBy?: string
  ): Promise<UserRole> {
    const result = await query(
      `INSERT INTO ${this.tableName} (id, tenant_id, user_id, role, assigned_by) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [require('crypto').randomUUID(), tenantId, userId, role, assignedBy]
    );
    return result.rows[0];
  }

  async listByUser(tenantId: string, userId: string): Promise<UserRole[]> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 AND user_id = $2`,
      [tenantId, userId]
    );
    return result.rows;
  }

  async hasRole(tenantId: string, userId: string, role: string): Promise<boolean> {
    const result = await query(
      `SELECT COUNT(*) FROM ${this.tableName} WHERE tenant_id = $1 AND user_id = $2 AND role = $3`,
      [tenantId, userId, role]
    );
    return parseInt(result.rows[0].count, 10) > 0;
  }
}
