import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { TokenService } from '../../services/TokenService';
import { successResponse, errorResponse } from '../response';
import { validateEmail } from '../../utils/validators';
import { UserRepository } from '../../repositories/UserRepository';
import { UserService } from '../../services/UserService';
import { getConnection, query } from '../../config/database';

const userRepository = new UserRepository();
const userService = new UserService();

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const { tenant_name, admin_first_name, admin_last_name, email, password } = req.body;

      if (!tenant_name || !admin_first_name || !email || !password) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Missing required fields'));
      }

      if (!validateEmail(email)) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Invalid email format'));
      }

      const existingTenant = await query('SELECT id FROM tenants WHERE name = $1', [tenant_name]);
      if (existingTenant.rows.length > 0) {
        return res.status(409).json(errorResponse('CONFLICT', 'Tenant name already exists'));
      }

      const tenantId = randomUUID();
      const userId = randomUUID();
      const passwordHash = bcrypt.hashSync(password, 10);

      const client = await getConnection();
      try {
        await client.query('BEGIN');
        await client.query(
          'INSERT INTO tenants (id, name, created_at, updated_at, is_active) VALUES ($1, $2, NOW(), NOW(), true)',
          [tenantId, tenant_name]
        );
        await client.query(
          'INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())',
          [
            userId,
            tenantId,
            email.toLowerCase(),
            passwordHash,
            admin_first_name,
            admin_last_name || null,
          ]
        );
        await client.query(
          'INSERT INTO user_roles (id, tenant_id, user_id, role, assigned_at) VALUES ($1, $2, $3, $4, NOW())',
          [randomUUID(), tenantId, userId, 'Tenant Admin']
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      const tokenPayload = {
        sub: userId,
        email: email.toLowerCase(),
        tenant_id: tenantId,
        roles: ['Tenant Admin'],
      };
      const token = TokenService.sign(tokenPayload);

      return res.status(201).json(
        successResponse({
          token,
          user: {
            id: userId,
            email: email.toLowerCase(),
            first_name: admin_first_name,
            last_name: admin_last_name,
            roles: ['Tenant Admin'],
            tenant_id: tenantId,
          },
          expires_in: 86400,
        })
      );
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password, tenant_id, tenant_name } = req.body;

      if (!email || !password || (!tenant_id && !tenant_name)) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Missing required fields'));
      }

      if (!validateEmail(email)) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Invalid email format'));
      }

      // Resolve tenant_id from tenant_name if provided
      let resolvedTenantId = tenant_id;
      if (!resolvedTenantId && tenant_name) {
        // Try flexible matching: exact (case-insensitive) or dash-normalized names
        const tenantRes = await query(
          `SELECT id FROM tenants WHERE LOWER(name) = LOWER($1) OR REPLACE(LOWER(name),' ', '-') = LOWER($1) LIMIT 1`,
          [tenant_name]
        );
        if (tenantRes.rows.length === 0) {
          return res.status(404).json(errorResponse('RESOURCE_NOT_FOUND', 'Tenant not found'));
        }
        resolvedTenantId = tenantRes.rows[0].id;
      }

      const user = await userRepository.findByEmailAndTenant(email, resolvedTenantId as string);
      if (!user || !user.is_active) {
        return res.status(404).json(errorResponse('RESOURCE_NOT_FOUND', 'User not found'));
      }

      const passwordMatches = bcrypt.compareSync(password, user.password_hash);
      if (!passwordMatches) {
        return res.status(401).json(errorResponse('UNAUTHORIZED', 'Invalid credentials'));
      }

      const userRoles = await userService.getUserRoles(resolvedTenantId as string, user.id);
      const roles = userRoles.map((role) => role.role);
      const tokenPayload = {
        sub: user.id,
        email: user.email,
        tenant_id: resolvedTenantId,
        roles,
      };
      const token = TokenService.sign(tokenPayload);

      return res.json(
        successResponse({
          token,
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            tenant_id: resolvedTenantId,
            roles,
          },
          expires_in: 86400,
        })
      );
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Missing refresh token'));
      }

      // TODO: Validate refresh token
      const newToken = TokenService.sign({ sub: 'user-uuid' });
      return res.json(successResponse({ token: newToken, expires_in: 86400 }));
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }
}
