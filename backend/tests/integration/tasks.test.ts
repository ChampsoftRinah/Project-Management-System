import request from 'supertest';
import app from '../../../src/index';
import { query } from '../../../src/config/database';

describe('Tasks Integration Tests', () => {
  let tenantId: string;
  let projectId: string;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    // Create test tenant
    const tenantResult = await query(
      'INSERT INTO tenants (id, name, is_active) VALUES ($1, $2, $3) RETURNING id',
      ['test-tenant-tasks', 'Test Tenant', true]
    );
    tenantId = tenantResult.rows[0].id;

    // Create test project
    const projectResult = await query(
      'INSERT INTO projects (id, tenant_id, name, is_active) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test-project-001', tenantId, 'Test Project', true]
    );
    projectId = projectResult.rows[0].id;

    // Create test user
    const userResult = await query(
      'INSERT INTO users (id, tenant_id, email, password_hash, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['test-user-tasks', tenantId, 'test@example.com', 'hashed_password', true]
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

  describe('POST /projects/{project_id}/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'A test task description',
          priority: 'High',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.tenant_id).toBe(tenantId);
      expect(response.body.data.project_id).toBe(projectId);
      expect(response.body.data.title).toBe('Test Task');
      expect(response.body.data.status).toBe('Open');
      expect(response.body.data.version).toBe(1);
    });
  });

  describe('PATCH /projects/{project_id}/tasks/{task_id}', () => {
    it('should update task with optimistic locking', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post(`/api/v1/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Update Test Task' });

      const taskId = createResponse.body.data.id;
      const initialVersion = createResponse.body.data.version;

      const response = await request(app)
        .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Task Title',
          status: 'In Development',
          version: initialVersion,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Task Title');
      expect(response.body.data.status).toBe('In Development');
      expect(response.body.data.version).toBe(initialVersion + 1);
    });

    it('should return 409 on version conflict', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post(`/api/v1/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Conflict Test Task' });

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/v1/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          version: 999, // Wrong version
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('DELETE /projects/{project_id}/tasks/{task_id}', () => {
    it('should soft delete task', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post(`/api/v1/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Delete Test Task' });

      const taskId = createResponse.body.data.id;

      const deleteResponse = await request(app)
        .delete(`/api/v1/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(204);

      // Verify task is soft deleted (not returned in queries)
      const getResponse = await request(app)
        .get(`/api/v1/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
