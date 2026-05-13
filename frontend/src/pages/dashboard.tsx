import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { Project, Task } from '../types';
import Layout from '../components/Layout';

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

  const activeProjects = projects?.filter((p) => p.is_active) || [];
  const recentTasks =
    tasks
      ?.slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5) || [];
  const openTasks = tasks?.filter((t) => t.status === 'Open') || [];
  const completedTasks = tasks?.filter((t) => t.status === 'QA Passed') || [];

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.first_name || 'User'}! Here's a quick overview of your projects and
            tasks.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Active Projects</h3>
            <div className="text-3xl font-bold text-primary mt-2">{activeProjects.length}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Total Tasks</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">{tasks?.length || 0}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Open Tasks</h3>
            <div className="text-3xl font-bold text-orange-600 mt-2">{openTasks.length}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
            <div className="text-3xl font-bold text-green-600 mt-2">{completedTasks.length}</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
            </div>
            <div className="px-6 py-4">
              {projectsLoading ? (
                <div>Loading projects...</div>
              ) : activeProjects.length > 0 ? (
                <div className="space-y-3">
                  {activeProjects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <a className="block p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors">
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{project.description}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          Updated: {new Date(project.updated_at).toLocaleDateString()}
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No active projects yet</p>
                  <Link href="/projects">
                    <a className="text-primary hover:text-blue-700 text-sm mt-2 inline-block">
                      View all projects →
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Completion Rate</h2>
            </div>
            <div className="px-6 py-8">
              {tasksLoading ? (
                <div>Loading...</div>
              ) : tasks && tasks.length > 0 ? (
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {Math.round((completedTasks.length / tasks.length) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {completedTasks.length} of {tasks.length} tasks completed
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500">No tasks to track</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recently Updated Tasks</h2>
          </div>
          <div className="px-6 py-4">
            {tasksLoading ? (
              <div>Loading tasks...</div>
            ) : recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <Link key={task.id} href={`/projects/${task.project_id}/tasks/${task.id}`}>
                    <a className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                        <p className="text-xs text-gray-500">
                          Status: {task.status} • Updated:{' '}
                          {new Date(task.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                          task.status === 'QA Passed'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'Open'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No tasks yet</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
