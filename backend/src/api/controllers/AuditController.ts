import { Request, Response } from 'express';
import AuditService from '../../services/AuditService';
import { successResponse, errorResponse } from '../response';

export class AuditController {
  async list(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const { user_id, entity_type, action } = req.query;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const offset = parseInt(req.query.offset as string) || 0;

      const logs = await AuditService.listAuditLogs(
        tenantId,
        {
          user_id: user_id as string,
          entity_type: entity_type as string,
          action: action as string,
        },
        limit,
        offset
      );

      return res.json(successResponse(logs, { has_more: logs.length === limit }));
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }

  async getUserActivity(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const { user_id } = req.params;
      const days = parseInt(req.query.days as string) || 7;

      const summary = await AuditService.getUserActivitySummary(tenantId, user_id, days);
      return res.json(successResponse(summary));
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }
}
