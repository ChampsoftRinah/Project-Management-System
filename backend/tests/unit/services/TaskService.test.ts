import { TaskService } from '../services/TaskService';

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
  });

  describe('createTask', () => {
    it('should validate title is required', async () => {
      await expect(
        taskService.createTask('tenant-1', 'project-1', 'user-1', { title: '' })
      ).rejects.toThrow('Task title is required');
    });

    it('should create task with initial version 1', async () => {
      const mockTask = {
        id: 'task-1',
        tenant_id: 'tenant-1',
        project_id: 'project-1',
        title: 'Test Task',
        description: 'Test description',
        status: 'Open',
        priority: 'Medium',
        reporter_id: 'user-1',
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock the repository method
      jest.spyOn(taskService as any, 'taskRepository', 'get').mockReturnValue({
        create: jest.fn().mockResolvedValue(mockTask),
      });

      const result = await taskService.createTask('tenant-1', 'project-1', 'user-1', {
        title: 'Test Task',
        description: 'Test description',
      });

      expect(result).toEqual(mockTask);
      expect(result.version).toBe(1);
      expect(result.status).toBe('Open');
    });
  });

  describe('updateTask', () => {
    it('should increment version on update', async () => {
      const existingTask = {
        id: 'task-1',
        tenant_id: 'tenant-1',
        project_id: 'project-1',
        title: 'Original Title',
        version: 2,
      };

      const updatedTask = {
        ...existingTask,
        title: 'Updated Title',
        version: 3,
      };

      // Mock repository methods
      jest.spyOn(taskService as any, 'taskRepository', 'get').mockReturnValue({
        findByIdAndTenant: jest.fn().mockResolvedValue(existingTask),
        updateWithVersion: jest.fn().mockResolvedValue(updatedTask),
      });

      const result = await taskService.updateTask(
        'tenant-1',
        'task-1',
        'user-1',
        { title: 'Updated Title' },
        2
      );

      expect(result.version).toBe(3);
      expect(result.title).toBe('Updated Title');
    });

    it('should validate status transitions', async () => {
      const existingTask = {
        id: 'task-1',
        tenant_id: 'tenant-1',
        version: 1,
      };

      jest.spyOn(taskService as any, 'taskRepository', 'get').mockReturnValue({
        findByIdAndTenant: jest.fn().mockResolvedValue(existingTask),
      });

      await expect(
        taskService.updateTask('tenant-1', 'task-1', 'user-1', { status: 'Invalid Status' }, 1)
      ).rejects.toThrow('Invalid status');
    });
  });
});
