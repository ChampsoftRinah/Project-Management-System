import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { authMiddleware } from '../middleware/authMiddleware';
import { tenantMiddleware } from '../middleware/tenantMiddleware';
import { authorizationMiddleware } from '../middleware/authorizationMiddleware';

const router = Router();
const projectController = new ProjectController();

router.get(
  '/projects',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Developer', 'QA Engineer', 'Project Manager']),
  (req, res) => projectController.list(req, res)
);

router.post(
  '/projects',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Project Manager']),
  (req, res) => projectController.create(req, res)
);

router.get(
  '/projects/:id',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Developer', 'QA Engineer', 'Project Manager']),
  (req, res) => projectController.findById(req, res)
);

router.patch(
  '/projects/:id',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Project Manager']),
  (req, res) => projectController.update(req, res)
);

router.delete(
  '/projects/:id',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Project Manager']),
  (req, res) => projectController.delete(req, res)
);

export default router;
