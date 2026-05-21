import { useRouter } from 'next/router';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import RoleAssignmentForm from '../../../components/RoleAssignmentForm';
import ProjectLayout from '../../../components/ProjectLayout';
import { Project, User, Role } from '../../../types';
import apiClient from '../../../services/api';

const ProjectDetailPage = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const projectIdString = Array.isArray(projectId) ? projectId[0] : projectId;
  const { user } = useAuth();

  const {
    data: project,
    loading: projectLoading,
    error: projectError,
  } = useApi<Project>(projectIdString ? `/projects/${projectIdString}` : null);
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

  if (!projectIdString) return <div className="p-6 text-center text-slate-600">Loading...</div>;
  if (projectLoading || usersLoading)
    return <div className="p-6 text-center text-slate-600">Loading...</div>;
  if (projectError || usersError)
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
        Error loading data
      </div>
    );
  if (!project || !users) return <div className="p-6 text-center text-slate-600">No data</div>;

  return (
    <ProjectLayout projectId={projectIdString} activeTab="overview">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Project summary</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                High-level details and team assignments for this project.
              </p>
            </div>
            <div className="space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>Status</span>
                <span className="font-semibold text-slate-900">
                  {project.is_active ? 'Active' : 'Archived'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>Created</span>
                <span className="font-semibold text-slate-900">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>Updated</span>
                <span className="font-semibold text-slate-900">
                  {new Date(project.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Team Members</h2>
              <p className="mt-2 text-sm text-slate-600">
                Assign roles and manage who has access to this project.
              </p>
            </div>
          </div>

          {user?.roles.includes('Tenant Admin') && (
            <div className="mt-6">
              <RoleAssignmentForm users={users} onAssign={handleAssignRole} />
            </div>
          )}

          <div className="mt-6 space-y-3">
            {users.map((teamUser) => (
              <div
                key={teamUser.id}
                className="flex flex-col gap-2 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {teamUser.first_name} {teamUser.last_name}
                  </p>
                  <p className="text-sm text-slate-500">{teamUser.email}</p>
                </div>
                <div className="text-sm text-slate-700">
                  Roles: {teamUser.roles.join(', ') || 'None'}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ProjectLayout>
  );
};

export default ProjectDetailPage;
