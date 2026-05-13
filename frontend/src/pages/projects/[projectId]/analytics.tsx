import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { useApi } from '../../../hooks/useApi';
import Layout from '../../../components/Layout';
import AnalyticsDashboard from '../../../components/AnalyticsDashboard';
import DateRangePicker from '../../../components/DateRangePicker';
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
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track completion, bottlenecks, and velocity across your project.
            </p>
          </div>
          <button
            onClick={() => router.push(`/projects/${projectId}/tasks`)}
            className="text-primary hover:text-blue-700"
          >
            Back to Tasks →
          </button>
        </div>

        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />

        {loading && <div>Loading analytics...</div>}
        {error && <div className="text-red-600">Error loading analytics</div>}

        {analytics && <AnalyticsDashboard data={analytics} />}
      </div>
    </Layout>
  );
}
