import { BaseService } from './BaseService';
import { TaskRepository } from '../repositories/TaskRepository';

const taskRepository = new TaskRepository();

export class AnalyticsService extends BaseService {
  async getProjectSummary(
    tenantId: string,
    projectId: string,
    filters?: { date_from?: string; date_to?: string }
  ) {
    // Get all tasks for the project
    let tasks = await taskRepository.listByProject(tenantId, projectId);

    if (filters?.date_from || filters?.date_to) {
      const from = filters.date_from
        ? new Date(filters.date_from).getTime()
        : Number.NEGATIVE_INFINITY;
      const to = filters.date_to ? new Date(filters.date_to).getTime() : Number.POSITIVE_INFINITY;
      tasks = tasks.filter((task) => {
        const createdAt = new Date(task.created_at).getTime();
        return createdAt >= from && createdAt <= to;
      });
    }

    // Calculate completion rate: QA Passed tasks / total tasks
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === 'QA Passed').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Simple bottleneck detection: status with most tasks
    const statusCounts: Record<string, number> = {};
    tasks.forEach((task) => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });
    const bottleneck = Object.entries(statusCounts).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
      ['', 0]
    );

    // Team velocity: tasks completed per assignee
    const velocityByAssignee: Record<string, number> = {};
    tasks
      .filter((task) => task.status === 'QA Passed')
      .forEach((task) => {
        if (task.assignee_id) {
          velocityByAssignee[task.assignee_id] = (velocityByAssignee[task.assignee_id] || 0) + 1;
        }
      });

    return {
      completion_rate: Math.round(completionRate * 100) / 100, // to 2 decimal places
      bottlenecks: [{ status: bottleneck[0], count: bottleneck[1] }],
      team_velocity: Object.entries(velocityByAssignee).map(([assignee, count]) => ({
        assignee_id: assignee,
        completed_tasks: count,
      })),
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
    };
  }
}
