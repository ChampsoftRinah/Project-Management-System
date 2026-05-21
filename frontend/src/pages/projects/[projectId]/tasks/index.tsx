import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../hooks/useAuth';
import { useApi } from '../../../../hooks/useApi';
import { Task, User } from '../../../../types';
import TaskCard from '../../../../components/TaskCard';
import TaskForm from '../../../../components/TaskForm';
import TaskFilters from '../../../../components/TaskFilters';
import ProjectLayout from '../../../../components/ProjectLayout';

export default function TasksPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { projectId } = router.query;
  const projectIdString = Array.isArray(projectId) ? projectId[0] : projectId;
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
    assignee_id?: string;
    priority?: string;
    title_search?: string;
  }>({});

  const { data: users } = useApi<User[]>('/users');

  const buildUrl = () => {
    if (!projectIdString) return null;
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.assignee_id) params.append('assignee_id', filters.assignee_id);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.title_search) params.append('title_search', filters.title_search);
    const query = params.toString();
    return `/projects/${projectIdString}/tasks${query ? `?${query}` : ''}`;
  };

  const { data: tasks, loading, error, refetch } = useApi<Task[]>(buildUrl());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (projectIdString) {
      refetch();
    }
  }, [isAuthenticated, projectId, filters, refetch, router, projectIdString]);

  if (!isAuthenticated) {
    return <div className="p-6 text-center text-slate-600">Loading...</div>;
  }

  if (!projectIdString) {
    return <div className="p-6 text-center text-slate-600">Loading...</div>;
  }

  return (
    <ProjectLayout projectId={projectIdString} activeTab="tasks">
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage tasks for this project and open the Kanban board for workflow updates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                New Task
              </button>
              <button
                onClick={() => router.push(`/projects/${projectIdString}/kanban`)}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Open Kanban
              </button>
            </div>
          </div>
        </section>

        {users && <TaskFilters users={users} onFiltersChange={setFilters} />}

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            Loading tasks...
          </div>
        )}
        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            Error loading tasks.
          </div>
        )}

        {tasks?.length ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} projectId={projectIdString} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
              No tasks found. Create a new task to get started.
            </div>
          )
        )}

        {showForm && (
          <TaskForm
            projectId={projectIdString}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              refetch();
            }}
          />
        )}
      </div>
    </ProjectLayout>
  );
}
