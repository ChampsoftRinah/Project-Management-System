import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Project } from '../../types';
import ProjectCard from '../../components/ProjectCard';
import ProjectForm from '../../components/ProjectForm';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: projects, loading, error, refetch } = useApi<Project[]>('/projects');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    refetch();
  }, [isAuthenticated, router, refetch]);

  if (!isAuthenticated) {
    return <div className="p-6 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Projects</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">All projects</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              A polished home for your tenant's project portfolio. Create a new project and keep
              teams aligned with modern status boards.
            </p>
          </div>
          <ProjectForm
            onSuccess={() => {
              refetch();
              setToastMessage('Project created successfully.');
            }}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-3xl bg-white p-6 shadow-sm" />
          ))}
        </div>
      ) : projects?.length ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            No projects yet
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">Launch your first project</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Add a project to start organizing tasks, tracking progress, and aligning your team.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              type="button"
              onClick={() => document.getElementById('open-new-project-button')?.click()}
            >
              New Project
            </Button>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} variant="success" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
