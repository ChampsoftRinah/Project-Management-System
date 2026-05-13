import { Pool, QueryResult } from 'pg';
import pool from '../config/database';

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export class AuditService {
  private pool: Pool = pool;

  async logAction(
    tenantId: string,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    changes?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog> {
    const query = `
      INSERT INTO audit_logs (
        id, tenant_id, user_id, action, resource_type, resource_id,
        changes, ip_address, user_agent, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *;
    `;

    const id = require('crypto').randomUUID();
    const result: QueryResult<AuditLog> = await this.pool.query(query, [
      id,
      tenantId,
      userId,
      action,
      resourceType,
      resourceId,
      changes ? JSON.stringify(changes) : null,
      ipAddress,
      userAgent,
    ]);

    return result.rows[0];
  }

  async listAuditLogs(
    tenantId: string,
    filters?: {
      user_id?: string;
      resource_type?: string;
      action?: string;
    },
    limit: number = 50,
    offset: number = 0
  ): Promise<AuditLog[]> {
    let query = `
      SELECT * FROM audit_logs
      WHERE tenant_id = $1
    `;

    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.user_id) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    if (filters?.resource_type) {
      query += ` AND resource_type = $${paramIndex}`;
      params.push(filters.resource_type);
      paramIndex++;
    }

    if (filters?.action) {
      query += ` AND action = $${paramIndex}`;
      params.push(filters.action);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result: QueryResult<AuditLog> = await this.pool.query(query, params);
    return result.rows;
  }

  async getUserActivitySummary(
    tenantId: string,
    userId: string,
    days: number = 7
  ): Promise<{ action: string; count: number }[]> {
    const query = `
      SELECT action, COUNT(*) as count
      FROM audit_logs
      WHERE tenant_id = $1 AND user_id = $2
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY action
      ORDER BY count DESC;
    `;

    const result = await this.pool.query(query, [tenantId, userId]);
    return result.rows;
  }
}

export default new AuditService();
