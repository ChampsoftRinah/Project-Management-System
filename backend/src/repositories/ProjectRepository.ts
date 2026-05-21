import { BaseRepository } from './BaseRepository';
import { Project } from '../types/entities';
import { query } from '../config/database';

export class ProjectRepository extends BaseRepository<Project> {
  protected tableName = 'projects';

  async listByTenant(tenantId: string, limit: number = 50, offset: number = 0): Promise<Project[]> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 AND is_active = true AND (is_deleted = false OR is_deleted IS NULL) LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    return result.rows;
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<Project | null> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2 AND (is_deleted = false OR is_deleted IS NULL)`,
      [id, tenantId]
    );
    return result.rows[0] || null;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await query(
      `UPDATE ${this.tableName} SET is_deleted = true, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
  }
}
