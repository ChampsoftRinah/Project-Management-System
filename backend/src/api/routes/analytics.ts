import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authMiddleware } from '../middleware/authMiddleware';
import { tenantMiddleware } from '../middleware/tenantMiddleware';
import { authorizationMiddleware } from '../middleware/authorizationMiddleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.get(
  '/projects/:project_id/analytics/summary',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Developer', 'QA Engineer', 'Project Manager']),
  (req, res) => analyticsController.getSummary(req, res)
);

export default router;
