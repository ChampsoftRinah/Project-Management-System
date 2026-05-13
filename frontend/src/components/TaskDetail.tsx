import { useState } from 'react';
import { Task, TaskHistory } from '../types';
import apiClient from '../services/api';
import ActivityTimeline from './ActivityTimeline';

interface TaskDetailProps {
  task: Task;
  projectId: string;
  history: TaskHistory[];
  historyLoading: boolean;
  onUpdate: () => void;
}

export default function TaskDetail({
  task,
  projectId,
  history,
  historyLoading,
  onUpdate,
}: TaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    assignee_id: task.assignee_id || '',
    labels: task.labels || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statuses = [
    'Open',
    'Ready for Development',
    'In Development',
    'Development Completed',
    'Ready for QA',
    'In QA',
    'QA Passed',
    'QA Failed',
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      await apiClient.patch(`/projects/${projectId}/tasks/${task.id}`, {
        ...editData,
        labels: editData.labels.length > 0 ? editData.labels : undefined,
        version: task.version,
      });
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Task was modified by another user. Please refresh and try again.');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to update task');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLabelsChange = (value: string) => {
    const labelArray = value
      .split(',')
      .map((label) => label.trim())
      .filter((label) => label);
    setEditData({ ...editData, labels: labelArray });
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="text-2xl font-bold text-gray-900 border-gray-300 rounded px-2 py-1 w-full"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          )}

          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-blue-700"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{task.description || 'No description'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              {isEditing ? (
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {task.status}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              {isEditing ? (
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`text-sm font-medium ${
                    task.priority === 'Critical'
                      ? 'text-red-600'
                      : task.priority === 'High'
                        ? 'text-orange-600'
                        : task.priority === 'Medium'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                  }`}
                >
                  {task.priority}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Assignee</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.assignee_id}
                  onChange={(e) => setEditData({ ...editData, assignee_id: e.target.value })}
                  placeholder="user-uuid"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{task.assignee_id || 'Unassigned'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Labels</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.labels.join(', ')}
                  onChange={(e) => handleLabelsChange(e.target.value)}
                  placeholder="bug, feature, urgent"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
              ) : (
                <div className="mt-1 flex flex-wrap gap-1">
                  {task.labels?.map((label: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {label}
                    </span>
                  )) || 'No labels'}
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500">
              <p>Created: {new Date(task.created_at).toLocaleString()}</p>
              <p>Updated: {new Date(task.updated_at).toLocaleString()}</p>
              <p>Version: {task.version}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity History</h3>
        <ActivityTimeline activities={history} loading={historyLoading} />
      </div>
    </div>
  );
}
