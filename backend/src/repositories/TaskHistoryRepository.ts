import { BaseRepository } from './BaseRepository';
import { TaskHistory } from '../types/entities';
import { query } from '../config/database';

export class TaskHistoryRepository extends BaseRepository<TaskHistory> {
  protected tableName = 'task_history';

  async createHistory(
    tenantId: string,
    taskId: string,
    changedBy: string,
    action: string,
    oldValue?: any,
    newValue?: any
  ): Promise<TaskHistory> {
    const result = await query(
      `INSERT INTO ${this.tableName} (id, tenant_id, task_id, changed_by, action, old_value, new_value) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        require('crypto').randomUUID(),
        tenantId,
        taskId,
        changedBy,
        action,
        JSON.stringify(oldValue),
        JSON.stringify(newValue),
      ]
    );
    return result.rows[0];
  }

  async listByTask(
    tenantId: string,
    taskId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<TaskHistory[]> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 AND task_id = $2 ORDER BY changed_at DESC LIMIT $3 OFFSET $4`,
      [tenantId, taskId, limit, offset]
    );
    return result.rows;
  }
}
