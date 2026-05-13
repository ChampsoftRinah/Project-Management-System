import Link from 'next/link';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}/tasks`}>
      <a className="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
          <span className="text-sm text-gray-500">
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          {project.description || 'No description provided.'}
        </p>
        <div className="mt-4 text-sm font-medium text-primary">View tasks →</div>
      </a>
    </Link>
  );
}
