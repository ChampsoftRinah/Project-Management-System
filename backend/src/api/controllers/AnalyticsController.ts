import { Request, Response } from 'express';
import { AnalyticsService } from '../../services/AnalyticsService';
import { successResponse, errorResponse } from '../response';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getSummary(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const { project_id } = req.params;
      const { date_from, date_to } = req.query;

      const summary = await analyticsService.getProjectSummary(tenantId, project_id, {
        date_from: date_from as string,
        date_to: date_to as string,
      });

      return res.json(successResponse(summary));
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }
}
