import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { authMiddleware } from '../middleware/authMiddleware';
import { tenantMiddleware } from '../middleware/tenantMiddleware';
import { authorizationMiddleware } from '../middleware/authorizationMiddleware';

const router = Router();
const taskController = new TaskController();

// GET /projects/{project_id}/tasks
router.get(
  '/projects/:project_id/tasks',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Developer', 'QA Engineer', 'Project Manager']),
  taskController.list
);

// POST /projects/{project_id}/tasks
router.post(
  '/projects/:project_id/tasks',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Developer', 'QA Engineer', 'Project Manager']),
  taskController.create
);

// GET /projects/{project_id}/tasks/{task_id}
router.get(
  '/projects/:project_id/tasks/:task_id',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Developer', 'QA Engineer', 'Project Manager']),
  taskController.findById
);

// PATCH /projects/{project_id}/tasks/{task_id}
router.patch(
  '/projects/:project_id/tasks/:task_id',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Developer', 'QA Engineer', 'Project Manager']),
  taskController.update
);

// DELETE /projects/{project_id}/tasks/{task_id}
router.delete(
  '/projects/:project_id/tasks/:task_id',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Project Manager']),
  taskController.delete
);

// GET /projects/{project_id}/tasks/{task_id}/history
router.get(
  '/projects/:project_id/tasks/:task_id/history',
  authMiddleware,
  tenantMiddleware,
  authorizationMiddleware(['Developer', 'QA Engineer', 'Project Manager']),
  taskController.getHistory
);

export default router;
