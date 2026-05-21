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
    <div className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.9)] mb-4">
      <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h3 className="text-lg font-semibold text-white">Filter Tasks</h3>
          <p className="mt-1 text-sm text-slate-400">
            Refine the task list with status, assignee, priority, or title.
          </p>
        </div>
        <button
          onClick={clearFilters}
          className="rounded-full bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          Clear Filters
        </button>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
          <label className="block text-sm font-semibold text-slate-300 mb-2">Assignee</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
          <label className="block text-sm font-semibold text-slate-300 mb-2">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Search Title</label>
          <input
            type="text"
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
            placeholder="Search task titles..."
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
