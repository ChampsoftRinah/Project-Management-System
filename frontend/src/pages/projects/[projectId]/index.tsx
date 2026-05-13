import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import RoleAssignmentForm from '../../../components/RoleAssignmentForm';
import { Project, User, Role } from '../../../types';
import apiClient from '../../../services/api';

const ProjectDetailPage: React.FC = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const { user } = useAuth();

  const {
    data: project,
    loading: projectLoading,
    error: projectError,
  } = useApi<Project>(`/projects/${projectId}`);
  const {
    data: users,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useApi<User[]>('/users');

  const handleAssignRole = async (userId: string, role: Role) => {
    await apiClient.post(`/users/${userId}/roles`, { role });
    refetchUsers();
  };

  if (projectLoading || usersLoading) return <div>Loading...</div>;
  if (projectError || usersError) return <div>Error loading data</div>;
  if (!project || !users) return <div>No data</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/projects" className="text-blue-500 hover:underline">
          ← Back to Projects
        </Link>
      </div>
      <div className="bg-white shadow rounded p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
        <p className="text-gray-600 mb-4">{project.description}</p>
        <div className="text-sm text-gray-500">
          Created: {new Date(project.created_at).toLocaleDateString()} | Updated:{' '}
          {new Date(project.updated_at).toLocaleDateString()}
        </div>
        <div className="mt-4">
          <Link
            href={`/projects/${projectId}/tasks`}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            View Tasks
          </Link>
          <Link
            href={`/projects/${projectId}/kanban`}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Kanban Board
          </Link>
          <Link
            href={`/projects/${projectId}/analytics`}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            View Analytics
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-bold mb-4">Team Members</h2>
        {user?.roles.includes('Tenant Admin') && (
          <RoleAssignmentForm users={users} onAssign={handleAssignRole} />
        )}
        <div className="space-y-2">
          {users.map((teamUser) => (
            <div key={teamUser.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="font-medium">
                  {teamUser.first_name} {teamUser.last_name}
                </div>
                <div className="text-sm text-gray-500">{teamUser.email}</div>
              </div>
              <div className="text-sm">Roles: {teamUser.roles.join(', ') || 'None'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
