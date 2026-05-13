import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authMiddleware } from '../middleware/authMiddleware';
import { tenantMiddleware } from '../middleware/tenantMiddleware';
import { authorizationMiddleware } from '../middleware/authorizationMiddleware';

const router = Router();
const auditController = new AuditController();

router.get(
  '/audit-logs',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Project Manager', 'Tenant Admin']),
  (req, res) => auditController.list(req, res)
);

router.get(
  '/users/:user_id/activity',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Project Manager', 'Tenant Admin']),
  (req, res) => auditController.getUserActivity(req, res)
);

export default router;
