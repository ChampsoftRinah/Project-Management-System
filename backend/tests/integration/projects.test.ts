import request from 'supertest';
import app from '../../../src/index';
import { query } from '../../../src/config/database';

describe('Projects Integration Tests', () => {
  let tenantId: string;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    // Create test tenant
    const tenantResult = await query(
      'INSERT INTO tenants (id, name, is_active) VALUES ($1, $2, $3) RETURNING id',
      ['test-tenant-001', 'Test Tenant', true]
    );
    tenantId = tenantResult.rows[0].id;

    // Create test user
    const userResult = await query(
      'INSERT INTO users (id, tenant_id, email, password_hash, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['test-user-001', tenantId, 'test@example.com', 'hashed_password', true]
    );
    userId = userResult.rows[0].id;

    // Generate test token
    token = 'test-jwt-token';
  });

  afterAll(async () => {
    // Cleanup
    await query('DELETE FROM projects WHERE tenant_id = $1', [tenantId]);
    await query('DELETE FROM users WHERE tenant_id = $1', [tenantId]);
    await query('DELETE FROM tenants WHERE id = $1', [tenantId]);
  });

  describe('POST /projects', () => {
    it('should create a new project under authenticated tenant', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Project',
          description: 'A test project',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.tenant_id).toBe(tenantId);
      expect(response.body.data.name).toBe('Test Project');
    });
  });

  describe('GET /projects', () => {
    it("should return only tenant's own projects", async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((project: any) => {
        expect(project.tenant_id).toBe(tenantId);
      });
    });
  });

  describe('GET /projects/:id', () => {
    it('should return project details for authenticated user', async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Detail Test Project' });

      const projectId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(projectId);
    });
  });
});
