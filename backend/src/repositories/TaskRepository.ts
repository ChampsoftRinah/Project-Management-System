import { BaseRepository } from './BaseRepository';
import { Task } from '../types/entities';
import { query } from '../config/database';

export class TaskRepository extends BaseRepository<Task> {
  protected tableName = 'tasks';

  async listByProject(
    tenantId: string,
    projectId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Task[]> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 AND project_id = $2 AND is_deleted = false ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [tenantId, projectId, limit, offset]
    );
    return result.rows;
  }

  async listByAssignee(
    tenantId: string,
    assigneeId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Task[]> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 AND assignee_id = $2 AND is_deleted = false ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [tenantId, assigneeId, limit, offset]
    );
    return result.rows;
  }

  async listByStatus(
    tenantId: string,
    status: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Task[]> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 AND status = $2 AND is_deleted = false ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [tenantId, status, limit, offset]
    );
    return result.rows;
  }

  async listByFilters(
    tenantId: string,
    projectId: string,
    filters: {
      status?: string;
      assignee_id?: string;
      priority?: string;
      title_search?: string;
    },
    limit: number = 50,
    offset: number = 0
  ): Promise<Task[]> {
    const whereClauses = ['tenant_id = $1', 'project_id = $2', 'is_deleted = false'];
    const values: any[] = [tenantId, projectId];

    if (filters.status) {
      values.push(filters.status);
      whereClauses.push(`status = $${values.length}`);
    }

    if (filters.assignee_id) {
      values.push(filters.assignee_id);
      whereClauses.push(`assignee_id = $${values.length}`);
    }

    if (filters.priority) {
      values.push(filters.priority);
      whereClauses.push(`priority = $${values.length}`);
    }

    if (filters.title_search) {
      const searchTerm = `%${filters.title_search.toLowerCase()}%`;
      values.push(searchTerm);
      whereClauses.push(
        `(LOWER(title) LIKE $${values.length} OR LOWER(description) LIKE $${values.length})`
      );
    }

    const sql = `SELECT * FROM ${this.tableName} WHERE ${whereClauses.join(
      ' AND '
    )} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

    const result = await query(sql, [...values, limit, offset]);
    return result.rows;
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<Task | null> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2 AND is_deleted = false`,
      [id, tenantId]
    );
    return result.rows[0] || null;
  }

  async updateWithVersion(
    id: string,
    tenantId: string,
    data: any,
    expectedVersion: number
  ): Promise<Task> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    const result = await query(
      `UPDATE ${this.tableName} SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} AND tenant_id = $${keys.length + 2} AND version = $${keys.length + 3} RETURNING *`,
      [...values, id, tenantId, expectedVersion]
    );

    if (result.rows.length === 0) {
      throw new Error('Task not found or version mismatch');
    }

    return result.rows[0];
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await query(
      `UPDATE ${this.tableName} SET is_deleted = true, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
  }
}
