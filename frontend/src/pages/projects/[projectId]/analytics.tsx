import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { useApi } from '../../../hooks/useApi';
import AnalyticsDashboard from '../../../components/AnalyticsDashboard';
import DateRangePicker from '../../../components/DateRangePicker';
import ProjectLayout from '../../../components/ProjectLayout';
import { AnalyticsSummary } from '../../../types';

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { projectId } = router.query;
  const projectIdString = Array.isArray(projectId) ? projectId[0] : projectId;
  const [range, setRange] = useState({ from: '', to: '' });

  const analyticsUrl = useMemo(() => {
    if (!projectIdString) return null;
    const params = new URLSearchParams();
    if (range.from) params.set('date_from', range.from);
    if (range.to) params.set('date_to', range.to);
    const query = params.toString();
    return `/projects/${projectIdString}/analytics/summary${query ? `?${query}` : ''}`;
  }, [projectIdString, range]);

  const { data: analytics, loading, error } = useApi<AnalyticsSummary>(analyticsUrl);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div className="p-6 text-center text-slate-600">Loading...</div>;
  }

  if (!projectIdString) {
    return <div className="p-6 text-center text-slate-600">Loading project...</div>;
  }

  return (
    <ProjectLayout projectId={projectIdString} activeTab="analytics">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Analytics</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track completion, bottlenecks, and velocity across your project.
              </p>
            </div>
            <button
              onClick={() => router.push(`/projects/${projectIdString}/tasks`)}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Tasks →
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
        </section>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            Loading analytics...
          </div>
        )}
        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            Error loading analytics.
          </div>
        )}

        {analytics && <AnalyticsDashboard data={analytics} />}
      </div>
    </ProjectLayout>
  );
}
