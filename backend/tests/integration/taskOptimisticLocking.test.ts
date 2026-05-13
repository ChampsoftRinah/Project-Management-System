import request from 'supertest';
import app from '../../../src/index';
import { query } from '../../../src/config/database';

describe('Task Optimistic Locking Integration Tests', () => {
  let tenantId: string;
  let projectId: string;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    const tenantResult = await query(
      'INSERT INTO tenants (id, name, is_active) VALUES ($1, $2, $3) RETURNING id',
      ['test-tenant-lock', 'Test Tenant', true]
    );
    tenantId = tenantResult.rows[0].id;

    const projectResult = await query(
      'INSERT INTO projects (id, tenant_id, name, is_active) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test-project-lock', tenantId, 'Test Project', true]
    );
    projectId = projectResult.rows[0].id;

    const userResult = await query(
      'INSERT INTO users (id, tenant_id, email, password_hash, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['test-user-lock', tenantId, 'test@example.com', 'hashed_password', true]
    );
    userId = userResult.rows[0].id;

    token = 'test-jwt-token';
  });

  afterAll(async () => {
    await query('DELETE FROM task_history WHERE tenant_id = $1', [tenantId]);
    await query('DELETE FROM tasks WHERE tenant_id = $1', [tenantId]);
    await query('DELETE FROM projects WHERE tenant_id = $1', [tenantId]);
    await query('DELETE FROM users WHERE tenant_id = $1', [tenantId]);
    await query('DELETE FROM tenants WHERE id = $1', [tenantId]);
  });

  it('should handle concurrent updates with optimistic locking', async () => {
    // Create a task
    const createResponse = await request(app)
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Concurrent Update Task' });

    const taskId = createResponse.body.data.id;
    const initialVersion = createResponse.body.data.version;

    // First update succeeds
    const update1Response = await request(app)
      .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'In Development',
        version: initialVersion,
      });

    expect(update1Response.status).toBe(200);
    expect(update1Response.body.data.version).toBe(initialVersion + 1);

    // Second update with stale version fails
    const update2Response = await request(app)
      .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        priority: 'High',
        version: initialVersion, // Stale version
      });

    expect(update2Response.status).toBe(409);
    expect(update2Response.body.error.code).toBe('CONFLICT');

    // Third update with correct version succeeds
    const update3Response = await request(app)
      .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        priority: 'High',
        version: initialVersion + 1, // Correct version
      });

    expect(update3Response.status).toBe(200);
    expect(update3Response.body.data.version).toBe(initialVersion + 2);
    expect(update3Response.body.data.priority).toBe('High');
  });

  it('should prevent lost updates with version checking', async () => {
    // Create a task
    const createResponse = await request(app)
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Lost Update Prevention Task' });

    const taskId = createResponse.body.data.id;
    const initialVersion = createResponse.body.data.version;

    // Simulate two users trying to update simultaneously
    const updateA = request(app)
      .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated by User A',
        version: initialVersion,
      });

    const updateB = request(app)
      .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated by User B',
        version: initialVersion,
      });

    const [responseA, responseB] = await Promise.all([updateA, updateB]);

    // One should succeed, one should fail
    const successCount = [responseA, responseB].filter((r) => r.status === 200).length;
    const conflictCount = [responseA, responseB].filter((r) => r.status === 409).length;

    expect(successCount).toBe(1);
    expect(conflictCount).toBe(1);

    // Verify final state
    const finalResponse = await request(app)
      .get(`/api/v1/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(finalResponse.status).toBe(200);
    expect(finalResponse.body.data.version).toBe(initialVersion + 1);
  });
});
