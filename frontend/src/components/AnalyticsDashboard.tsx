import { AnalyticsSummary } from '../types';
import BottleneckChart from './BottleneckChart';
import TeamVelocity from './TeamVelocity';

interface AnalyticsDashboardProps {
  data: AnalyticsSummary;
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completion Rate</h3>
          <div className="text-4xl font-bold text-green-600">{data.completion_rate}%</div>
          <p className="text-sm text-gray-500 mt-3">
            {data.completed_tasks} of {data.total_tasks} tasks completed.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Tasks</h3>
          <div className="text-4xl font-bold text-primary">{data.total_tasks}</div>
          <p className="text-sm text-gray-500 mt-3">Current task count in this project.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Tasks</h3>
          <div className="text-4xl font-bold text-indigo-600">{data.completed_tasks}</div>
          <p className="text-sm text-gray-500 mt-3">Tasks finished with QA Passed.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BottleneckChart bottlenecks={data.bottlenecks} />
        <TeamVelocity teamVelocity={data.team_velocity} />
      </div>
    </div>
  );
}
