import { BaseRepository } from './BaseRepository';
import { User } from '../types/entities';
import { query } from '../config/database';

export class UserRepository extends BaseRepository<User> {
  protected tableName = 'users';

  async findByEmailAndTenant(email: string, tenantId: string): Promise<User | null> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 AND email = $2 AND is_active = true`,
      [tenantId, email]
    );
    return result.rows[0] || null;
  }

  async listActiveByTenant(
    tenantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<User[]> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 AND is_active = true LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    return result.rows;
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<User | null> {
    return this.findById(id, tenantId);
  }
}
