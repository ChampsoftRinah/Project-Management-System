import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { TokenService } from '../../services/TokenService';
import { successResponse, errorResponse } from '../response';
import { validateEmail } from '../../utils/validators';
import { UserRepository } from '../../repositories/UserRepository';
import { UserService } from '../../services/UserService';

const userRepository = new UserRepository();
const userService = new UserService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password, tenant_id } = req.body;

      if (!email || !password || !tenant_id) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Missing required fields'));
      }

      if (!validateEmail(email)) {
        return res.status(400).json(errorResponse('VALIDATION_ERROR', 'Invalid email format'));
      }

      const user = await userRepository.findByEmailAndTenant(email, tenant_id);
      if (!user || !user.is_active) {
        return res.status(404).json(errorResponse('RESOURCE_NOT_FOUND', 'User not found'));
      }

      const passwordMatches = bcrypt.compareSync(password, user.password_hash);
      if (!passwordMatches) {
        return res.status(401).json(errorResponse('UNAUTHORIZED', 'Invalid credentials'));
      }

      const userRoles = await userService.getUserRoles(tenant_id, user.id);
      const roles = userRoles.map((role) => role.role);
      const tokenPayload = {
        sub: user.id,
        email: user.email,
        tenant_id,
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
            tenant_id,
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
