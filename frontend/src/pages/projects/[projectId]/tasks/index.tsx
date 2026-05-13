import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../hooks/useAuth';
import { useApi } from '../../../../hooks/useApi';
import { Task, User } from '../../../../types';
import Layout from '../../../../components/Layout';
import TaskCard from '../../../../components/TaskCard';
import TaskForm from '../../../../components/TaskForm';
import TaskFilters from '../../../../components/TaskFilters';

export default function TasksPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { projectId } = router.query;
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
    assignee_id?: string;
    priority?: string;
    title_search?: string;
  }>({});

  const { data: users } = useApi<User[]>('/users');

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.assignee_id) params.append('assignee_id', filters.assignee_id);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.title_search) params.append('title_search', filters.title_search);
    const query = params.toString();
    return `/projects/${projectId}/tasks${query ? `?${query}` : ''}`;
  };

  const { data: tasks, loading, error, refetch } = useApi<Task[]>(buildUrl());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (projectId) {
      refetch();
    }
  }, [isAuthenticated, projectId, filters, refetch, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage tasks for this project and open the Kanban board for workflow updates.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              New Task
            </button>
            <button
              onClick={() => router.push(`/projects/${projectId}/kanban`)}
              className="border border-primary text-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors"
            >
              Open Kanban
            </button>
          </div>
        </div>

        {users && <TaskFilters users={users} onFiltersChange={setFilters} />}

        {loading && <div>Loading tasks...</div>}
        {error && <div className="text-red-600">Error loading tasks</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks?.map((task) => (
            <TaskCard key={task.id} task={task} projectId={projectId as string} />
          ))}
        </div>

        {showForm && (
          <TaskForm
            projectId={projectId as string}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              refetch();
            }}
          />
        )}
      </div>
    </Layout>
  );
}
