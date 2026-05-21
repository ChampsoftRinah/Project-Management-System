import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src/index';
import { query } from '../../src/config/database';

describe('Auth Integration Tests', () => {
  const tenantId = 'test-tenant-auth';
  const signupEmail = 'newuser@example.com';
  const existingEmail = 'existinguser@example.com';
  const existingPassword = 'Password123!';
  const tenantName = 'Auth Test Tenant';

  beforeAll(async () => {
    await query('INSERT INTO tenants (id, name, is_active) VALUES ($1, $2, $3)', [
      tenantId,
      tenantName,
      true,
    ]);

    const passwordHash = bcrypt.hashSync(existingPassword, 10);
    await query(
      'INSERT INTO users (id, tenant_id, email, password_hash, is_active, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      ['test-user-auth-01', tenantId, existingEmail, passwordHash, true, 'Existing', 'User']
    );
  });

  afterAll(async () => {
    await query('DELETE FROM user_roles WHERE tenant_id = $1', [tenantId]);
    await query('DELETE FROM users WHERE tenant_id = $1', [tenantId]);
    await query('DELETE FROM tenants WHERE id = $1', [tenantId]);
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user and return an access token', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        email: signupEmail,
        password: 'NewUserPass1!',
        first_name: 'New',
        last_name: 'User',
        tenant_id: tenantId,
        role: 'Developer',
      });

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(signupEmail);
      expect(response.body.data.user.tenant_id).toBe(tenantId);
      expect(Array.isArray(response.body.data.user.roles)).toBe(true);
      expect(response.body.data.user.roles).toContain('Developer');
    });

    it('should reject duplicate signups for the same email and tenant', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        email: signupEmail,
        password: 'NewUserPass1!',
        tenant_id: tenantId,
      });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('RESOURCE_EXISTS');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate an existing user and return a token', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: existingEmail,
        password: existingPassword,
        tenant_id: tenantId,
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(existingEmail);
      expect(response.body.data.user.tenant_id).toBe(tenantId);
      expect(Array.isArray(response.body.data.user.roles)).toBe(true);
    });

    it('should reject invalid login credentials', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: existingEmail,
        password: 'WrongPassword',
        tenant_id: tenantId,
      });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
