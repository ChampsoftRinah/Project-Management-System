import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApi } from '../hooks/useApi';
import { Project } from '../types';

interface ProjectLayoutProps {
  projectId: string;
  activeTab: 'overview' | 'tasks' | 'kanban' | 'analytics';
  children: React.ReactNode;
}

const tabs = [
  { label: 'Overview', href: (id: string) => `/projects/${id}`, key: 'overview' },
  { label: 'Tasks', href: (id: string) => `/projects/${id}/tasks`, key: 'tasks' },
  { label: 'Kanban', href: (id: string) => `/projects/${id}/kanban`, key: 'kanban' },
  { label: 'Analytics', href: (id: string) => `/projects/${id}/analytics`, key: 'analytics' },
] as const;

const tabClassName = (isActive: boolean) =>
  `rounded-full px-5 py-2 text-sm font-semibold transition duration-300 ${
    isActive
      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_20px_45px_-30px_rgba(59,130,246,0.8)]'
      : 'bg-slate-900/70 text-slate-300 hover:bg-slate-900'
  }`;

export default function ProjectLayout({ projectId, activeTab, children }: ProjectLayoutProps) {
  const {
    data: project,
    loading,
    error,
  } = useApi<Project>(projectId ? `/projects/${projectId}` : null);
  const router = useRouter();

  if (!projectId || loading) {
    return <div className="p-6 text-center text-slate-400">Loading project...</div>;
  }

  if (error || !project) {
    return (
      <div className="rounded-3xl border border-rose-600 bg-rose-950/70 p-6 text-center text-rose-200">
        Error loading project details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.8)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href="/projects"
              className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300 transition hover:text-white"
            >
              ← Back to Projects
            </Link>
            <div className="mt-4">
              <h1 className="text-4xl font-semibold text-white">{project.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                {project.description || 'Project overview and navigation for this project.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 shadow-inner shadow-slate-950/20">
              {project.is_active ? 'Active project' : 'Archived project'}
            </span>
            <span className="rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 shadow-inner shadow-slate-950/20">
              Updated {new Date(project.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href(projectId)}
              className={tabClassName(tab.key === activeTab)}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}
