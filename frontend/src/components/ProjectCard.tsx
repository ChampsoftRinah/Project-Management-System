import Link from 'next/link';
import { Project } from '../types';
import Badge from './ui/Badge';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/95 p-6 shadow-[0_30px_60px_-35px_rgba(59,130,246,0.75)] transition duration-300 hover:-translate-y-1 hover:border-blue-500/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{project.name}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 line-clamp-2">
            {project.description || 'No description provided yet.'}
          </p>
        </div>
        <Badge
          label={project.is_active ? 'Active' : 'Archived'}
          variant={project.is_active ? 'success' : 'neutral'}
        />
      </div>

      <div className="mt-6 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
        <span className="font-semibold text-sky-300 transition group-hover:text-sky-200">
          View project →
        </span>
      </div>
    </Link>
  );
}
