import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '../types';
import apiClient from '../services/api';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import {
  getValidNextStatuses,
  isValidStatusTransition,
  TaskStatus,
} from '../utils/workflowStateMachine';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  onTaskUpdate: () => void;
}

const statusColumns: TaskStatus[] = [
  'Open',
  'Ready for Development',
  'In Development',
  'Development Completed',
  'Ready for QA',
  'In QA',
  'QA Passed',
  'QA Failed',
];

export default function KanbanBoard({ tasks, projectId, onTaskUpdate }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [updating, setUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    if (!isValidStatusTransition(task.status, newStatus)) {
      alert(`Cannot move task from ${task.status} to ${newStatus}.`);
      return;
    }

    setUpdating(true);
    try {
      await apiClient.patch(`/projects/${projectId}/tasks/${taskId}`, {
        status: newStatus,
        version: task.version,
      });
      onTaskUpdate();
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please refresh and try again.');
    } finally {
      setUpdating(false);
    }
  };

  const validNextStatuses = activeTask
    ? getValidNextStatuses(activeTask.status as TaskStatus)
    : (statusColumns as TaskStatus[]);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4 mb-4">
        {activeTask && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Drag "{activeTask.title}" to one of: {validNextStatuses.join(', ')}.
          </div>
        )}
      </div>
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {statusColumns.map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            title={status}
            tasks={getTasksByStatus(status)}
            projectId={projectId}
            isDropAllowed={activeTask ? validNextStatuses.includes(status) : true}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} projectId={projectId} />
          </div>
        ) : null}
      </DragOverlay>

      {updating && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Updating task...</span>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
