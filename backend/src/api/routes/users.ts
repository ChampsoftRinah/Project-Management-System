import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/authMiddleware';
import { tenantMiddleware } from '../middleware/tenantMiddleware';
import { authorizationMiddleware } from '../middleware/authorizationMiddleware';

const router = Router();
const userController = new UserController();

router.get(
  '/users',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Project Manager', 'Tenant Admin']),
  (req, res) => userController.list(req, res)
);

router.post(
  '/users/:user_id/roles',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Tenant Admin']),
  (req, res) => userController.assignRole(req, res)
);

export default router;
