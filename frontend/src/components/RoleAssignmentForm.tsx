import React, { useState } from 'react';
import { User, Role } from '../types';

interface RoleAssignmentFormProps {
  users: User[];
  onAssign: (userId: string, role: Role) => Promise<void>;
}

const RoleAssignmentForm: React.FC<RoleAssignmentFormProps> = ({ users, onAssign }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('Developer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await onAssign(selectedUserId, selectedRole);
      setSelectedUserId('');
      setSelectedRole('Developer');
    } catch (error) {
      console.error('Failed to assign role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-2">
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="border rounded px-2 py-1"
          required
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.last_name} ({user.email})
            </option>
          ))}
        </select>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as Role)}
          className="border rounded px-2 py-1"
        >
          <option value="Developer">Developer</option>
          <option value="QA Engineer">QA Engineer</option>
          <option value="Project Manager">Project Manager</option>
          <option value="Business Analyst">Business Analyst</option>
          <option value="Tenant Admin">Tenant Admin</option>
        </select>
        <button
          type="submit"
          disabled={loading || !selectedUserId}
          className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          {loading ? 'Assigning...' : 'Assign Role'}
        </button>
      </div>
    </form>
  );
};

export default RoleAssignmentForm;
