import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { Project, Task } from '../types';
export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { data: projects, loading: projectsLoading } = useApi<Project[]>('/projects');
  const { data: tasks, loading: tasksLoading } = useApi<Task[]>('/tasks');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const activeProjects = projects?.filter((project) => project.is_active) || [];
  const recentTasks =
    tasks
      ?.slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5) || [];
  const openTasks = tasks?.filter((task) => task.status === 'Open') || [];
  const completedTasks = tasks?.filter((task) => task.status === 'QA Passed') || [];
  const inProgressTasks =
    tasks?.filter((task) => task.status !== 'Open' && task.status !== 'QA Passed') || [];
  const completionRate = tasks?.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Overview</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Welcome back, {user?.first_name || 'there'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Your tenant workspace is ready to manage projects, review progress, and keep teams
              synced.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-3xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Projects</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{activeProjects.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Tasks</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{tasks?.length || 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Open</p>
              <p className="mt-3 text-2xl font-semibold text-orange-600">{openTasks.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Done</p>
              <p className="mt-3 text-2xl font-semibold text-emerald-600">
                {completedTasks.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Active projects</h2>
              <p className="text-sm text-slate-500 mt-1">
                Projects currently in progress for your tenant.
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {activeProjects.length} active
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {projectsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : activeProjects.length > 0 ? (
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block rounded-3xl border border-slate-200 px-5 py-4 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900 truncate">{project.name}</p>
                      <span className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Updated {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                      {project.description || 'No description yet.'}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No active projects yet. Head to the Projects page to get started.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Completion rate</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Your completion progress across all tasks.
                </p>
              </div>
              <div className="text-3xl font-semibold text-emerald-600">{completionRate}%</div>
            </div>
            <div className="mt-6 rounded-full bg-slate-100 h-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Task breakdown</h2>
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Open tasks</span>
                  <span>{openTasks.length}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${tasks?.length ? (openTasks.length / tasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>In progress</span>
                  <span>{inProgressTasks.length}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{
                      width: `${tasks?.length ? (inProgressTasks.length / tasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Completed</span>
                  <span>{completedTasks.length}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{
                      width: `${tasks?.length ? (completedTasks.length / tasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
            <p className="text-sm text-slate-500 mt-1">Latest task updates across your projects.</p>
          </div>
          <Link
            href="/projects"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all projects →
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {tasksLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <Link
                key={task.id}
                href={`/projects/${task.project_id}/tasks/${task.id}`}
                className="block rounded-3xl border border-slate-200 px-5 py-4 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500 truncate">
                      {task.description || 'No description provided.'}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {task.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(task.updated_at).toLocaleDateString()}</span>
                  <span>{task.priority} priority</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No recent task activity yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
