import Link from 'next/link';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  projectId: string;
}

export default function TaskCard({ task, projectId }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      Open: 'bg-gray-100 text-gray-800',
      'Ready for Development': 'bg-blue-100 text-blue-800',
      'In Development': 'bg-yellow-100 text-yellow-800',
      'Development Completed': 'bg-purple-100 text-purple-800',
      'Ready for QA': 'bg-indigo-100 text-indigo-800',
      'In QA': 'bg-orange-100 text-orange-800',
      'QA Passed': 'bg-green-100 text-green-800',
      'QA Failed': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      Low: 'text-green-600',
      Medium: 'text-yellow-600',
      High: 'text-orange-600',
      Critical: 'text-red-600',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
          >
            {task.status}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className={`font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.assignee_id ? (
              <span className="text-gray-500">Assigned</span>
            ) : (
              <span className="text-gray-500">Unassigned</span>
            )}
          </div>
          <Link href={`/projects/${projectId}/tasks/${task.id}`}>
            <a className="text-primary hover:text-blue-700 text-sm font-medium">View Details →</a>
          </Link>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Created: {new Date(task.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
