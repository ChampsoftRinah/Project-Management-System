import { BaseService } from './BaseService';
import { TaskRepository } from '../repositories/TaskRepository';
import { TaskHistoryRepository } from '../repositories/TaskHistoryRepository';
import { validateStatus, validatePriority } from '../utils/validators';
import { isValidStatusTransition } from '../utils/workflowStateMachine';
import { Task, TaskHistory } from '../types/entities';

const taskRepository = new TaskRepository();
const taskHistoryRepository = new TaskHistoryRepository();

export class TaskService extends BaseService {
  async createTask(
    tenantId: string,
    projectId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      priority?: string;
      assignee_id?: string;
      labels?: string[];
    }
  ): Promise<Task> {
    const { requireString } = await import('../utils/validation');
    requireString(data.title, 'Task title');

    if (data.priority && !validatePriority(data.priority)) {
      throw new Error('Invalid priority');
    }

    const task = await taskRepository.create(tenantId, {
      ...data,
      project_id: projectId,
      reporter_id: userId,
      status: 'Open',
      version: 1,
    });

    // Create audit entry
    await taskHistoryRepository.createHistory(tenantId, task.id, userId, 'created', null, task);

    this.log(`Task created: ${task.id}`);
    return task;
  }

  async getTask(tenantId: string, taskId: string): Promise<Task | null> {
    return taskRepository.findByIdAndTenant(taskId, tenantId);
  }

  async listTasks(
    tenantId: string,
    projectId: string,
    filters?: {
      status?: string;
      assignee_id?: string;
      priority?: string;
      title_search?: string;
    },
    limit: number = 50,
    offset: number = 0
  ): Promise<Task[]> {
    if (filters && Object.keys(filters).length > 0) {
      return taskRepository.listByFilters(tenantId, projectId, filters, limit, offset);
    }

    return taskRepository.listByProject(tenantId, projectId, limit, offset);
  }

  async updateTask(
    tenantId: string,
    taskId: string,
    userId: string,
    data: Partial<Task>,
    expectedVersion: number
  ): Promise<Task> {
    const existingTask = await taskRepository.findByIdAndTenant(taskId, tenantId);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    if (data.status && !validateStatus(data.status)) {
      throw new Error('Invalid status');
    }

    if (data.status && !isValidStatusTransition(existingTask.status, data.status)) {
      throw new Error(`Invalid status transition from ${existingTask.status} to ${data.status}`);
    }

    if (data.priority && !validatePriority(data.priority)) {
      throw new Error('Invalid priority');
    }

    const updatedTask = await taskRepository.updateWithVersion(
      taskId,
      tenantId,
      {
        ...data,
        version: expectedVersion + 1,
      },
      expectedVersion
    );

    // Create audit entry
    await taskHistoryRepository.createHistory(
      tenantId,
      taskId,
      userId,
      'updated',
      existingTask,
      updatedTask
    );

    this.log(`Task updated: ${taskId}`);
    return updatedTask;
  }

  async deleteTask(tenantId: string, taskId: string, userId: string): Promise<void> {
    const existingTask = await taskRepository.findByIdAndTenant(taskId, tenantId);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    await taskRepository.softDelete(taskId, tenantId);

    // Create audit entry
    await taskHistoryRepository.createHistory(
      tenantId,
      taskId,
      userId,
      'deleted',
      existingTask,
      null
    );

    this.log(`Task deleted: ${taskId}`);
  }

  async getTaskHistory(
    tenantId: string,
    taskId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<TaskHistory[]> {
    return taskHistoryRepository.listByTask(tenantId, taskId, limit, offset);
  }
}
