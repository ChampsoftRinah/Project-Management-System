import request from 'supertest';
import app from '../../../src/index';
import { query } from '../../../src/config/database';

describe('Task Audit Integration Tests', () => {
  let tenantId: string;
  let projectId: string;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    const tenantResult = await query(
      'INSERT INTO tenants (id, name, is_active) VALUES ($1, $2, $3) RETURNING id',
      ['test-tenant-audit', 'Test Tenant', true]
    );
    tenantId = tenantResult.rows[0].id;

    const projectResult = await query(
      'INSERT INTO projects (id, tenant_id, name, is_active) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test-project-audit', tenantId, 'Test Project', true]
    );
    projectId = projectResult.rows[0].id;

    const userResult = await query(
      'INSERT INTO users (id, tenant_id, email, password_hash, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['test-user-audit', tenantId, 'test@example.com', 'hashed_password', true]
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

  it('should create audit entry for task creation', async () => {
    const response = await request(app)
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Audit Test Task',
        description: 'Testing audit logging',
      });

    expect(response.status).toBe(201);
    const taskId = response.body.data.id;

    // Check audit history
    const historyResponse = await request(app)
      .get(`/api/v1/projects/${projectId}/tasks/${taskId}/history`)
      .set('Authorization', `Bearer ${token}`);

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body.data.length).toBe(1);
    expect(historyResponse.body.data[0].action).toBe('created');
    expect(historyResponse.body.data[0].changed_by).toBe(userId);
    expect(historyResponse.body.data[0].new_value).toBeTruthy();
    expect(historyResponse.body.data[0].old_value).toBeNull();
  });

  it('should create audit entry for task updates', async () => {
    // Create task
    const createResponse = await request(app)
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Update Audit Task' });

    const taskId = createResponse.body.data.id;
    const initialVersion = createResponse.body.data.version;

    // Update task
    await request(app)
      .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'In Development',
        version: initialVersion,
      });

    // Check audit history
    const historyResponse = await request(app)
      .get(`/api/v1/projects/${projectId}/tasks/${taskId}/history`)
      .set('Authorization', `Bearer ${token}`);

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body.data.length).toBe(2); // created + updated

    const updateEntry = historyResponse.body.data.find((entry: any) => entry.action === 'updated');
    expect(updateEntry).toBeTruthy();
    expect(updateEntry.changed_by).toBe(userId);
    expect(updateEntry.old_value).toBeTruthy();
    expect(updateEntry.new_value).toBeTruthy();
  });

  it('should return history in reverse chronological order', async () => {
    // Create task
    const createResponse = await request(app)
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'History Order Task' });

    const taskId = createResponse.body.data.id;
    const initialVersion = createResponse.body.data.version;

    // Multiple updates
    await request(app)
      .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'In Development', version: initialVersion });

    await request(app)
      .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ priority: 'High', version: initialVersion + 1 });

    // Check history order
    const historyResponse = await request(app)
      .get(`/api/v1/projects/${projectId}/tasks/${taskId}/history`)
      .set('Authorization', `Bearer ${token}`);

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body.data.length).toBe(3);

    // Should be in reverse chronological order (newest first)
    const actions = historyResponse.body.data.map((entry: any) => entry.action);
    expect(actions).toEqual(['updated', 'updated', 'created']);
  });
});
