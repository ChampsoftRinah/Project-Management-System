interface BottleneckChartProps {
  bottlenecks: Array<{ status: string; count: number }>;
}

export default function BottleneckChart({ bottlenecks }: BottleneckChartProps) {
  if (bottlenecks.length === 0) {
    return <div className="text-sm text-gray-500">No bottleneck data available.</div>;
  }

  const maxCount = Math.max(...bottlenecks.map((b) => b.count));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Bottleneck Status</h3>
      <div className="space-y-4">
        {bottlenecks.map((bottleneck) => (
          <div key={bottleneck.status} className="space-y-2">
            <div className="flex justify-between text-sm text-gray-700">
              <span>{bottleneck.status}</span>
              <span>{bottleneck.count} tasks</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(bottleneck.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
