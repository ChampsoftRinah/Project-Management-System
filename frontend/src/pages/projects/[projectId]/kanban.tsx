import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { useApi } from '../../../hooks/useApi';
import { Task } from '../../../types';
import KanbanBoard from '../../../components/KanbanBoard';
import ProjectLayout from '../../../components/ProjectLayout';

export default function KanbanPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { projectId } = router.query;
  const projectIdString = Array.isArray(projectId) ? projectId[0] : projectId;
  const {
    data: tasks,
    loading,
    error,
    refetch,
  } = useApi<Task[]>(projectIdString ? `/projects/${projectIdString}/tasks` : null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (projectIdString) {
      refetch();
    }
  }, [isAuthenticated, projectIdString, refetch, router]);

  if (!isAuthenticated) {
    return <div className="p-6 text-center text-slate-600">Loading...</div>;
  }

  if (!projectIdString) {
    return <div className="p-6 text-center text-slate-600">Loading project...</div>;
  }

  return (
    <ProjectLayout projectId={projectIdString} activeTab="kanban">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Kanban Board</h1>
              <p className="text-sm text-slate-500 mt-1">
                Drag tasks along the workflow to update status and keep the team moving.
              </p>
            </div>
            <button
              onClick={() => router.push(`/projects/${projectIdString}/tasks`)}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              View as List →
            </button>
          </div>
        </section>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            Loading tasks...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            Error loading task board.
          </div>
        )}

        {tasks && tasks.length > 0 ? (
          <KanbanBoard tasks={tasks} projectId={projectIdString} onTaskUpdate={refetch} />
        ) : (
          !loading &&
          !error && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
              No tasks available for this project.
            </div>
          )
        )}
      </div>
    </ProjectLayout>
  );
}
