import Link from 'next/link';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  projectId: string;
}

export default function TaskCard({ task, projectId }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      Open: 'bg-slate-800 text-slate-200',
      'Ready for Development': 'bg-blue-900 text-blue-200',
      'In Development': 'bg-sky-900 text-sky-200',
      'Development Completed': 'bg-violet-900 text-violet-200',
      'Ready for QA': 'bg-indigo-900 text-indigo-200',
      'In QA': 'bg-slate-800 text-slate-200',
      'QA Passed': 'bg-emerald-900 text-emerald-200',
      'QA Failed': 'bg-rose-900 text-rose-200',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-800 text-slate-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      Low: 'text-sky-300',
      Medium: 'text-blue-300',
      High: 'text-cyan-300',
      Critical: 'text-sky-100',
    };
    return colors[priority as keyof typeof colors] || 'text-slate-300';
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/95 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.9)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_-30px_rgba(59,130,246,0.45)]">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-sm leading-6 text-slate-400 line-clamp-2">{task.description}</p>
            )}
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(task.status)}`}
          >
            {task.status}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3 text-slate-300">
            <span className={`font-semibold ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              {task.assignee_id ? 'Assigned' : 'Unassigned'}
            </span>
          </div>
          <Link
            href={`/projects/${projectId}/tasks/${task.id}`}
            className="text-sky-300 transition hover:text-sky-100 text-sm font-semibold"
          >
            View Details →
          </Link>
        </div>

        <div className="mt-4 text-xs text-slate-500">
          Created: {new Date(task.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
