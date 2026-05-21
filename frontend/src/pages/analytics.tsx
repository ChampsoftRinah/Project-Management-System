import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { Task, Project, AnalyticsSummary } from '../types';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const AnalyticsPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    data: projects,
    loading: projectsLoading,
    error: projectsError,
  } = useApi<Project[]>('/projects');
  const { data: tasks, loading: tasksLoading, error: tasksError } = useApi<Task[]>('/tasks');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>
    );
  }

  const loading = projectsLoading || tasksLoading;
  const error = projectsError || tasksError;
  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((task) => task.status === 'QA Passed').length ?? 0;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const bottlenecks = Object.entries(
    tasks?.reduce<Record<string, number>>((acc, task) => {
      if (task.status !== 'QA Passed') {
        acc[task.status] = (acc[task.status] ?? 0) + 1;
      }
      return acc;
    }, {}) ?? {}
  )
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const teamVelocity = Object.entries(
    tasks
      ?.filter((task) => task.status === 'QA Passed')
      .reduce<Record<string, number>>((acc, task) => {
        const assignee = task.assignee_id || 'Unassigned';
        acc[assignee] = (acc[assignee] ?? 0) + 1;
        return acc;
      }, {}) ?? {}
  )
    .map(([assignee_id, completed_tasks]) => ({ assignee_id, completed_tasks }))
    .sort((a, b) => b.completed_tasks - a.completed_tasks)
    .slice(0, 5);

  const summary: AnalyticsSummary = {
    completion_rate: completionRate,
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    bottlenecks,
    team_velocity: teamVelocity,
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Workspace analytics
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Tenant performance</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              See cross-project completion, task throughput, and areas where your teams are slowing
              down.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-3xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Projects</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{projects?.length ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Tasks</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{totalTasks}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="mt-3 text-2xl font-semibold text-emerald-600">{completedTasks}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Active teams</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{teamVelocity.length}</p>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          Loading analytics...
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Error loading analytics.
        </div>
      )}

      {!loading && !error && <AnalyticsDashboard data={summary} />}
    </div>
  );
};

export default AnalyticsPage;
