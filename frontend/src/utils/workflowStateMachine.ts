export type TaskStatus =
  | 'Open'
  | 'Ready for Development'
  | 'In Development'
  | 'Development Completed'
  | 'Ready for QA'
  | 'In QA'
  | 'QA Passed'
  | 'QA Failed';

const transitions: Record<TaskStatus, TaskStatus[]> = {
  Open: ['Ready for Development'],
  'Ready for Development': ['In Development', 'Open'],
  'In Development': ['Development Completed', 'Ready for QA', 'QA Failed'],
  'Development Completed': ['Ready for QA', 'QA Failed'],
  'Ready for QA': ['In QA', 'Open'],
  'In QA': ['QA Passed', 'QA Failed'],
  'QA Passed': [],
  'QA Failed': ['In Development', 'Open'],
};

export function getValidNextStatuses(status: TaskStatus): TaskStatus[] {
  return transitions[status] || [];
}

export function isValidStatusTransition(currentStatus: string, nextStatus: string): boolean {
  if (!currentStatus || !nextStatus) {
    return false;
  }

  return getValidNextStatuses(currentStatus as TaskStatus).includes(nextStatus as TaskStatus);
}
