import { BaseService } from './BaseService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import AuditService from './AuditService';
import { Project } from '../types/entities';
import { requireString } from '../utils/validation';

const projectRepository = new ProjectRepository();

export class ProjectService extends BaseService {
  async createProject(
    tenantId: string,
    userId: string,
    data: { name: string; description?: string }
  ): Promise<Project> {
    requireString(data.name, 'Project name');

    const project = await projectRepository.create(tenantId, {
      ...data,
      created_by: userId,
    });

    // Log audit entry
    await AuditService.logAction(tenantId, userId, 'create', 'project', project.id, {
      name: data.name,
      description: data.description,
    });

    this.log(`Project created: ${project.id}`);
    return project;
  }

  async getProject(tenantId: string, projectId: string): Promise<Project | null> {
    return projectRepository.findByIdAndTenant(projectId, tenantId);
  }

  async listProjects(tenantId: string, limit: number = 50, offset: number = 0): Promise<Project[]> {
    return projectRepository.listByTenant(tenantId, limit, offset);
  }

  async updateProject(
    tenantId: string,
    projectId: string,
    userId: string,
    data: Partial<Project>
  ): Promise<Project> {
    const project = await projectRepository.update(projectId, tenantId, data);

    // Log audit entry
    await AuditService.logAction(tenantId, userId, 'update', 'project', projectId, data);

    this.log(`Project updated: ${projectId}`);
    return project;
  }

  async deleteProject(tenantId: string, projectId: string, userId: string): Promise<void> {
    const project = await projectRepository.findByIdAndTenant(projectId, tenantId);

    await projectRepository.softDelete(projectId, tenantId);

    // Log audit entry
    if (project) {
      await AuditService.logAction(tenantId, userId, 'delete', 'project', projectId, {
        name: project.name,
        description: project.description,
      });
    }

    this.log(`Project deleted: ${projectId}`);
  }
}
