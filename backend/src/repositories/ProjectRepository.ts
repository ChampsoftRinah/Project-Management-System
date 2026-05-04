import { BaseRepository } from './BaseRepository';
import { Project } from '../types/entities';
import { query } from '../config/database';

export class ProjectRepository extends BaseRepository<Project> {
  protected tableName = 'projects';

  async listByTenant(tenantId: string, limit: number = 50, offset: number = 0): Promise<Project[]> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 AND is_active = true LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    return result.rows;
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<Project | null> {
    return this.findById(id, tenantId);
  }
}
