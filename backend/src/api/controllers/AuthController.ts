import { Request, Response } from 'express';
import { TokenService } from '../../services/TokenService';
import { successResponse, errorResponse } from '../response';
import { validateEmail } from '../../utils/validators';

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

      // TODO: Validate credentials against database
      // For now, generate a mock token
      const user = {
        sub: 'user-uuid',
        email,
        tenant_id,
        roles: ['Developer'],
      };

      const token = TokenService.sign(user);
      return res.json(
        successResponse({
          token,
          user: { ...user, id: user.sub },
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
