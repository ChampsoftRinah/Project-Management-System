import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../hooks/useAuth';
import { useApi } from '../../../../hooks/useApi';
import { Task, TaskHistory } from '../../../../types';
import TaskDetail from '../../../../components/TaskDetail';

interface TaskDetailPageProps {
  projectId: string;
  taskId: string;
}

export default function TaskDetailPage({ projectId, taskId }: TaskDetailPageProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const {
    data: task,
    loading: taskLoading,
    error: taskError,
    refetch: fetchTask,
  } = useApi<Task>(`/projects/${projectId}/tasks/${taskId}`);
  const { data: history, loading: historyLoading } = useApi<TaskHistory[]>(
    `/projects/${projectId}/tasks/${taskId}/history`
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <button onClick={() => router.back()} className="mb-4 text-primary hover:text-blue-700">
        ← Back to Tasks
      </button>

      {taskLoading && <div>Loading task...</div>}
      {taskError && <div className="text-red-600">Error loading task</div>}

      {task && (
        <TaskDetail
          task={task}
          projectId={projectId}
          history={history || []}
          historyLoading={historyLoading}
          onUpdate={fetchTask}
        />
      )}
    </div>
  );
}

export async function getServerSideProps({ params }: any) {
  return {
    props: {
      projectId: params.projectId,
      taskId: params.taskId,
    },
  };
}
