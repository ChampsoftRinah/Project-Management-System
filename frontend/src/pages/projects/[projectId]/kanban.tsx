import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { useApi } from '../../../hooks/useApi';
import { Task } from '../../../types';
import Layout from '../../../components/Layout';
import KanbanBoard from '../../../components/KanbanBoard';

export default function KanbanPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { projectId } = router.query;
  const { data: tasks, loading, error, refetch } = useApi<Task[]>(`/projects/${projectId}/tasks`);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (projectId) {
      refetch();
    }
  }, [isAuthenticated, projectId, refetch, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <button
            onClick={() => router.push(`/projects/${projectId}/tasks`)}
            className="text-primary hover:text-blue-700"
          >
            View as List →
          </button>
        </div>

        {loading && <div>Loading tasks...</div>}
        {error && <div className="text-red-600">Error loading tasks</div>}

        {tasks && (
          <KanbanBoard tasks={tasks} projectId={projectId as string} onTaskUpdate={refetch} />
        )}
      </div>
    </Layout>
  );
}
