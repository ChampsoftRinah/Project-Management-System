import { BaseService } from './BaseService';
import { UserRepository } from '../repositories/UserRepository';
import { UserRoleRepository } from '../repositories/UserRoleRepository';
import { validateRole } from '../utils/validators';
import { User, UserRole } from '../types/entities';

const userRepository = new UserRepository();
const userRoleRepository = new UserRoleRepository();

export class UserService extends BaseService {
  async getUser(tenantId: string, userId: string): Promise<User | null> {
    return userRepository.findByIdAndTenant(userId, tenantId);
  }

  async listUsers(tenantId: string, limit: number = 50, offset: number = 0): Promise<User[]> {
    return userRepository.listActiveByTenant(tenantId, limit, offset);
  }

  async assignRole(
    tenantId: string,
    userId: string,
    role: string,
    assignedBy?: string
  ): Promise<UserRole> {
    if (!validateRole(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    const user = await userRepository.findByIdAndTenant(userId, tenantId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const userRole = await userRoleRepository.assignRole(tenantId, userId, role, assignedBy);
    this.log(`Role assigned: ${role} to user ${userId}`);
    return userRole;
  }

  async getUserRoles(tenantId: string, userId: string): Promise<UserRole[]> {
    return userRoleRepository.listByUser(tenantId, userId);
  }

  async hasRole(tenantId: string, userId: string, role: string): Promise<boolean> {
    return userRoleRepository.hasRole(tenantId, userId, role);
  }
}
