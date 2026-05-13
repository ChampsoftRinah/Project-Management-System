interface TeamVelocityProps {
  teamVelocity: Array<{ assignee_id: string; completed_tasks: number }>;
}

export default function TeamVelocity({ teamVelocity }: TeamVelocityProps) {
  if (teamVelocity.length === 0) {
    return <div className="text-sm text-gray-500">No velocity data available.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Team Velocity</h3>
      <div className="space-y-3">
        {teamVelocity.map((item) => (
          <div key={item.assignee_id} className="flex justify-between text-sm text-gray-700">
            <span>Assignee {item.assignee_id.slice(0, 8)}</span>
            <span className="font-semibold">{item.completed_tasks} tasks</span>
          </div>
        ))}
      </div>
    </div>
  );
}
