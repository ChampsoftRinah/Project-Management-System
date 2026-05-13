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

  const getColumnColor = (status: string) => {
    const colors = {
      Open: 'border-gray-300',
      'Ready for Development': 'border-blue-300',
      'In Development': 'border-yellow-300',
      'Development Completed': 'border-purple-300',
      'Ready for QA': 'border-indigo-300',
      'In QA': 'border-orange-300',
      'QA Passed': 'border-green-300',
      'QA Failed': 'border-red-300',
    };
    return colors[status as keyof typeof colors] || 'border-gray-300';
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 bg-gray-50 rounded-lg border-2 ${
        isOver
          ? 'border-primary bg-blue-50'
          : isDropAllowed
            ? getColumnColor(title)
            : 'border-gray-200 bg-gray-100 opacity-70'
      } transition-colors`}
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 flex items-center justify-between">
          {title}
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </h3>
      </div>

      <div className="p-4 space-y-3 min-h-[400px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} projectId={projectId} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            {isDropAllowed
              ? `No tasks in ${title.toLowerCase()}`
              : `Cannot move current task to ${title.toLowerCase()}`}
          </div>
        )}
      </div>
    </div>
  );
}
