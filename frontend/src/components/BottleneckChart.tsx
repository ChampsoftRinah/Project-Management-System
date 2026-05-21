interface BottleneckChartProps {
  bottlenecks: Array<{ status: string; count: number }>;
}

export default function BottleneckChart({ bottlenecks }: BottleneckChartProps) {
  if (bottlenecks.length === 0) {
    return <div className="text-sm text-slate-400">No bottleneck data available.</div>;
  }

  const maxCount = Math.max(...bottlenecks.map((b) => b.count));

  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.9)]">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Bottleneck Status</h3>
      <div className="space-y-4">
        {bottlenecks.map((bottleneck) => (
          <div key={bottleneck.status} className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>{bottleneck.status}</span>
              <span>{bottleneck.count} tasks</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${(bottleneck.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
