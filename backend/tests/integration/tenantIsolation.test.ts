import request from 'supertest';
import app from '../../../src/index';
import { query } from '../../../src/config/database';

describe('Tenant Isolation Integration Tests', () => {
  let tenant1: string;
  let tenant2: string;
  let user1: string;
  let user2: string;
  let token1: string;
  let token2: string;

  beforeAll(async () => {
    // Create two tenants
    const t1Result = await query(
      'INSERT INTO tenants (id, name, is_active) VALUES ($1, $2, $3) RETURNING id',
      ['tenant-1', 'Tenant 1', true]
    );
    tenant1 = t1Result.rows[0].id;

    const t2Result = await query(
      'INSERT INTO tenants (id, name, is_active) VALUES ($1, $2, $3) RETURNING id',
      ['tenant-2', 'Tenant 2', true]
    );
    tenant2 = t2Result.rows[0].id;

    // Create users in different tenants
    const u1Result = await query(
      'INSERT INTO users (id, tenant_id, email, password_hash, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['user-1', tenant1, 'user1@example.com', 'hashed', true]
    );
    user1 = u1Result.rows[0].id;

    const u2Result = await query(
      'INSERT INTO users (id, tenant_id, email, password_hash, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['user-2', tenant2, 'user2@example.com', 'hashed', true]
    );
    user2 = u2Result.rows[0].id;

    token1 = 'token-for-tenant-1';
    token2 = 'token-for-tenant-2';
  });

  afterAll(async () => {
    await query('DELETE FROM projects WHERE tenant_id IN ($1, $2)', [tenant1, tenant2]);
    await query('DELETE FROM users WHERE tenant_id IN ($1, $2)', [tenant1, tenant2]);
    await query('DELETE FROM tenants WHERE id IN ($1, $2)', [tenant1, tenant2]);
  });

  it('should not allow cross-tenant data access', async () => {
    // Create project in tenant 1
    const createResponse = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: 'Tenant 1 Project' });

    const projectId = createResponse.body.data.id;

    // Try to access from tenant 2 (should fail)
    const response = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(response.status).toBe(403);
  });

  it('should isolate data at database layer', async () => {
    // Verify user from tenant 1 cannot see user from tenant 2
    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token1}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].id).toBe(user1);
  });
});
