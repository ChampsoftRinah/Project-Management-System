import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '../types';
import SortableTaskCard from './SortableTaskCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  projectId: string;
  isDropAllowed?: boolean;
}

export default function KanbanColumn({
  id,
  title,
  tasks,
  projectId,
  isDropAllowed = true,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: !isDropAllowed,
  });

  const getColumnBg = () => {
    const colors: Record<string, string> = {
      Open: 'bg-slate-900/80 border-slate-800',
      'Ready for Development': 'bg-slate-900/80 border-sky-700',
      'In Development': 'bg-slate-900/80 border-sky-600',
      'Development Completed': 'bg-slate-900/80 border-violet-700',
      'Ready for QA': 'bg-slate-900/80 border-indigo-700',
      'In QA': 'bg-slate-900/80 border-slate-800',
      'QA Passed': 'bg-slate-900/80 border-emerald-700',
      'QA Failed': 'bg-slate-900/80 border-rose-700',
    };
    return colors[title] ?? 'bg-slate-900/80 border-slate-800';
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 rounded-[28px] border-2 p-0 transition duration-300 ${
        isOver
          ? 'border-blue-400/50 bg-slate-900/90 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
          : isDropAllowed
            ? getColumnBg()
            : 'border-slate-800 bg-slate-950/90 opacity-80'
      }`}
    >
      <div className="rounded-t-[26px] border-b border-slate-800 bg-slate-950/95 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
            {title}
          </h3>
          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-300">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="p-4 min-h-[420px] space-y-3">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} projectId={projectId} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex h-full items-center justify-center rounded-3xl bg-slate-950/70 p-4 text-center text-sm text-slate-500">
            {isDropAllowed
              ? `No tasks in ${title.toLowerCase()}`
              : `Cannot move current task to ${title.toLowerCase()}`}
          </div>
        )}
      </div>
    </div>
  );
}
