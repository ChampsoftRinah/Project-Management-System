import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Project } from '../../types';
import Layout from '../../components/Layout';
import ProjectCard from '../../components/ProjectCard';
import ProjectForm from '../../components/ProjectForm';

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: projects, loading, error, refetch } = useApi<Project[]>('/projects');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    refetch();
  }, [isAuthenticated, router, refetch]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-600 mt-1">
              View projects for your tenant and open the task board for each project.
            </p>
          </div>
          <ProjectForm onSuccess={refetch} />
        </div>

        {loading && <div>Loading projects...</div>}
        {error && <div className="text-red-600">Error loading projects</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
