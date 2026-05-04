export interface Tenant {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  assigned_at: string;
  assigned_by?: string;
}

export interface Project {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Task {
  id: string;
  tenant_id: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: string;
  reporter_id: string;
  labels?: string[];
  version: number;
  created_at: string;
  updated_at: string;
}

export interface TaskHistory {
  id: string;
  tenant_id: string;
  task_id: string;
  changed_by: string;
  action: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  changed_at: string;
}

export interface TaskComment {
  id: string;
  tenant_id: string;
  task_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface TaskMetrics {
  id: string;
  tenant_id: string;
  project_id: string;
  metric_date: string;
  status: string;
  count: number;
  avg_cycle_time_hours?: number;
  updated_at: string;
}
