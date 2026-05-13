import { Request, Response } from 'express';
import { TaskService } from '../../services/TaskService';
import { successResponse, errorResponse } from '../response';

const taskService = new TaskService();

export class TaskController {
  async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const userId = (req as any).user?.sub;
      const { project_id } = req.params;
      const { title, description, priority, assignee_id, labels } = req.body;

      const task = await taskService.createTask(tenantId, project_id, userId, {
        title,
        description,
        priority,
        assignee_id,
        labels,
      });

      return res.status(201).json(successResponse(task));
    } catch (error: any) {
      return res.status(400).json(errorResponse('BAD_REQUEST', error.message));
    }
  }

  async list(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const { project_id } = req.params;
      const { status, assignee_id, priority, title_search } = req.query;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const offset = parseInt(req.query.offset as string) || 0;

      const tasks = await taskService.listTasks(
        tenantId,
        project_id,
        {
          status: status as string,
          assignee_id: assignee_id as string,
          priority: priority as string,
          title_search: title_search as string,
        },
        limit,
        offset
      );

      return res.json(successResponse(tasks, { has_more: tasks.length === limit }));
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const { task_id } = req.params;

      const task = await taskService.getTask(tenantId, task_id);
      if (!task) {
        return res.status(404).json(errorResponse('RESOURCE_NOT_FOUND', 'Task not found'));
      }

      return res.json(successResponse(task));
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }

  async update(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const userId = (req as any).user?.sub;
      const { task_id } = req.params;
      const { title, description, status, priority, assignee_id, labels, version } = req.body;

      if (!version) {
        return res
          .status(400)
          .json(errorResponse('VALIDATION_ERROR', 'Version is required for optimistic locking'));
      }

      const task = await taskService.updateTask(
        tenantId,
        task_id,
        userId,
        {
          title,
          description,
          status,
          priority,
          assignee_id,
          labels,
        },
        version
      );

      return res.json(successResponse(task));
    } catch (error: any) {
      if (error.message.includes('version mismatch')) {
        return res
          .status(409)
          .json(
            errorResponse(
              'CONFLICT',
              'Task was modified by another user. Please refresh and try again.'
            )
          );
      }

      if (error.message.includes('Invalid status transition')) {
        return res.status(400).json(errorResponse('INVALID_STATUS_TRANSITION', error.message));
      }

      return res.status(400).json(errorResponse('BAD_REQUEST', error.message));
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const userId = (req as any).user?.sub;
      const { task_id } = req.params;

      await taskService.deleteTask(tenantId, task_id, userId);

      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json(errorResponse('BAD_REQUEST', error.message));
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const { task_id } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const offset = parseInt(req.query.offset as string) || 0;

      const history = await taskService.getTaskHistory(tenantId, task_id, limit, offset);

      return res.json(successResponse(history, { has_more: history.length === limit }));
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }
}
