import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface TaskFiltersProps {
  users: User[];
  onFiltersChange: (filters: {
    status?: string;
    assignee_id?: string;
    priority?: string;
    title_search?: string;
  }) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ users, onFiltersChange }) => {
  const [status, setStatus] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('');
  const [titleSearch, setTitleSearch] = useState('');

  useEffect(() => {
    onFiltersChange({
      status: status || undefined,
      assignee_id: assigneeId || undefined,
      priority: priority || undefined,
      title_search: titleSearch || undefined,
    });
  }, [status, assigneeId, priority, titleSearch, onFiltersChange]);

  const clearFilters = () => {
    setStatus('');
    setAssigneeId('');
    setPriority('');
    setTitleSearch('');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-medium mb-3">Filter Tasks</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Ready for Development">Ready for Development</option>
            <option value="In Development">In Development</option>
            <option value="Development Completed">Development Completed</option>
            <option value="Ready for QA">Ready for QA</option>
            <option value="In QA">In QA</option>
            <option value="QA Passed">QA Passed</option>
            <option value="QA Failed">QA Failed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          >
            <option value="">All Assignees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Title</label>
          <input
            type="text"
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
            placeholder="Search task titles..."
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="mt-3">
        <button
          onClick={clearFilters}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;
