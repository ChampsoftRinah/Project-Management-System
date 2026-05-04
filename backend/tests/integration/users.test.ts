import request from 'supertest';
import app from '../../../src/index';
import { query } from '../../../src/config/database';

describe('Users Integration Tests', () => {
  let tenantId: string;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    const tenantResult = await query(
      'INSERT INTO tenants (id, name, is_active) VALUES ($1, $2, $3) RETURNING id',
      ['test-tenant-users', 'Test Tenant', true]
    );
    tenantId = tenantResult.rows[0].id;

    const userResult = await query(
      'INSERT INTO users (id, tenant_id, email, password_hash, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['test-user-001', tenantId, 'test@example.com', 'hashed_password', true]
    );
    userId = userResult.rows[0].id;

    token = 'test-jwt-token';
  });

  afterAll(async () => {
    await query('DELETE FROM user_roles WHERE tenant_id = $1', [tenantId]);
    await query('DELETE FROM users WHERE tenant_id = $1', [tenantId]);
    await query('DELETE FROM tenants WHERE id = $1', [tenantId]);
  });

  describe('POST /users/:userId/roles', () => {
    it('should assign role to user', async () => {
      const response = await request(app)
        .post(`/api/v1/users/${userId}/roles`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          role: 'Developer',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.role).toBe('Developer');
      expect(response.body.data.user_id).toBe(userId);
    });
  });

  describe('GET /users', () => {
    it('should list active users in tenant', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((user: any) => {
        expect(user.tenant_id).toBe(tenantId);
        expect(user.is_active).toBe(true);
      });
    });
  });
});
