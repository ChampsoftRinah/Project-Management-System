import { Request, Response } from 'express';
import { ProjectService } from '../../services/ProjectService';
import { successResponse, errorResponse } from '../response';

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const userId = (req as any).user?.sub;
      const { name, description } = req.body;

      const project = await projectService.createProject(tenantId, userId, { name, description });
      return res.status(201).json(successResponse(project));
    } catch (error: any) {
      return res.status(400).json(errorResponse('BAD_REQUEST', error.message));
    }
  }

  async list(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const offset = parseInt(req.query.offset as string) || 0;

      const projects = await projectService.listProjects(tenantId, limit, offset);
      return res.json(successResponse(projects, { has_more: projects.length === limit }));
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const { id } = req.params;

      const project = await projectService.getProject(tenantId, id);
      if (!project) {
        return res.status(404).json(errorResponse('RESOURCE_NOT_FOUND', 'Project not found'));
      }

      return res.json(successResponse(project));
    } catch (error: any) {
      return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', error.message));
    }
  }

  async update(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const userId = (req as any).user?.sub;
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      const project = await projectService.updateProject(tenantId, id, userId, {
        name,
        description,
        is_active,
      });
      return res.json(successResponse(project));
    } catch (error: any) {
      return res.status(400).json(errorResponse('BAD_REQUEST', error.message));
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenant_id;
      const userId = (req as any).user?.sub;
      const { id } = req.params;

      await projectService.deleteProject(tenantId, id, userId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json(errorResponse('BAD_REQUEST', error.message));
    }
  }
}
