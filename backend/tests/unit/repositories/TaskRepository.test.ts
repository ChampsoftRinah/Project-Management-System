import { TaskRepository } from '../repositories/TaskRepository';

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;

  beforeEach(() => {
    taskRepository = new TaskRepository();
  });

  describe('updateWithVersion', () => {
    it('should update task with version check', async () => {
      const updatedTask = {
        id: 'task-1',
        tenant_id: 'tenant-1',
        title: 'Updated Task',
        version: 2,
      };

      // Mock the query method
      jest.spyOn(taskRepository as any, 'query').mockResolvedValue({
        rows: [updatedTask],
      });

      const result = await taskRepository.updateWithVersion(
        'task-1',
        'tenant-1',
        { title: 'Updated Task' },
        1
      );

      expect(result).toEqual(updatedTask);
      expect(result.version).toBe(2);
    });

    it('should return empty array when version mismatch', async () => {
      // Mock the query method to return no rows (version mismatch)
      jest.spyOn(taskRepository as any, 'query').mockResolvedValue({
        rows: [],
      });

      await expect(
        taskRepository.updateWithVersion('task-1', 'tenant-1', { title: 'Updated Task' }, 999)
      ).rejects.toThrow('Task not found or version mismatch');
    });
  });
});
