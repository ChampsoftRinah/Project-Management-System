import { BaseService } from './BaseService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { Project } from '../types/entities';

const projectRepository = new ProjectRepository();

export class ProjectService extends BaseService {
  async createProject(
    tenantId: string,
    userId: string,
    data: { name: string; description?: string }
  ): Promise<Project> {
    if (!data.name) {
      throw new Error('Project name is required');
    }

    const project = await projectRepository.create(tenantId, {
      ...data,
      created_by: userId,
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
    data: Partial<Project>
  ): Promise<Project> {
    const project = await projectRepository.update(projectId, tenantId, data);
    this.log(`Project updated: ${projectId}`);
    return project;
  }

  async deleteProject(tenantId: string, projectId: string): Promise<void> {
    await projectRepository.delete(projectId, tenantId);
    this.log(`Project deleted: ${projectId}`);
  }
}
