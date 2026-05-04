import { Request, Response } from 'express';
import { UserService } from '../../services/UserService';
import { successResponse, errorResponse } from '../response';

const userService = new UserService();

export class UserController {
  async list(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const offset = parseInt(req.query.offset as string) || 0;

      const users = await userService.listUsers(tenantId, limit, offset);
      return res.json(successResponse(users, { has_more: users.length === limit }));
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }

  async assignRole(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const userId = req.params.user_id;
      const { role } = req.body;
      const assignedBy = (req as any).user?.sub;

      const userRole = await userService.assignRole(tenantId, userId, role, assignedBy);
      return res.status(201).json(successResponse(userRole));
    } catch (error: any) {
      return res.status(400).json(errorResponse('BAD_REQUEST', error.message));
    }
  }
}
