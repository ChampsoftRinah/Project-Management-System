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
        <div className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.9)]">
          <h3 className="text-lg font-semibold text-slate-100 mb-2">Completion Rate</h3>
          <div className="text-4xl font-bold text-sky-300">{data.completion_rate}%</div>
          <p className="text-sm text-slate-400 mt-3">
            {data.completed_tasks} of {data.total_tasks} tasks completed.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.9)]">
          <h3 className="text-lg font-semibold text-slate-100 mb-2">Total Tasks</h3>
          <div className="text-4xl font-bold text-sky-300">{data.total_tasks}</div>
          <p className="text-sm text-slate-400 mt-3">Current task count for this project.</p>
        </div>

        <div className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.9)]">
          <h3 className="text-lg font-semibold text-slate-100 mb-2">Completed Tasks</h3>
          <div className="text-4xl font-bold text-cyan-300">{data.completed_tasks}</div>
          <p className="text-sm text-slate-400 mt-3">Tasks finished with QA Passed.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BottleneckChart bottlenecks={data.bottlenecks} />
        <TeamVelocity teamVelocity={data.team_velocity} />
      </div>
    </div>
  );
}
