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

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  roles: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type Role =
  | 'Developer'
  | 'QA Engineer'
  | 'Project Manager'
  | 'Business Analyst'
  | 'Tenant Admin';

export interface AnalyticsMetrics {
  completion_rate: number;
  bottlenecks: Array<{ status: string; count: number; avg_time_hours: number }>;
  team_velocity: Array<{ developer: string; tasks_completed: number }>;
}

export interface AnalyticsSummary {
  completion_rate: number;
  bottlenecks: Array<{ status: string; count: number }>;
  team_velocity: Array<{ assignee_id: string; completed_tasks: number }>;
  total_tasks: number;
  completed_tasks: number;
}
