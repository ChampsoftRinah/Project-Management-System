import { TaskHistory } from '../types';

interface ActivityTimelineProps {
  activities: TaskHistory[];
  loading?: boolean;
}

const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return '✨';
      case 'updated':
        return '📝';
      case 'deleted':
        return '🗑️';
      case 'status_changed':
        return '📋';
      case 'assigned':
        return '👤';
      default:
        return '•';
    }
  };

  const getActionLabel = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No activity history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="relative flex gap-4">
          {/* Timeline line */}
          {index !== activities.length - 1 && (
            <div className="absolute left-3 top-10 w-0.5 h-12 bg-gray-200"></div>
          )}

          {/* Activity dot */}
          <div className="flex-shrink-0 relative z-10">
            <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-sm">
              {getActionIcon(activity.action)}
            </div>
          </div>

          {/* Activity content */}
          <div className="flex-1 pt-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getActionLabel(activity.action)}
                  </p>
                  <p className="text-xs text-gray-600">
                    by{' '}
                    <span className="font-mono">
                      {activity.changed_by.slice(0, 8).toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDistanceToNow(new Date(activity.changed_at))}
                </div>
              </div>

              {/* Changes detail */}
              {(activity.old_value || activity.new_value) && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs space-y-1">
                  {activity.old_value &&
                    Object.entries(activity.old_value).map(([key, value]) => (
                      <div key={`old-${key}`} className="text-gray-600">
                        <span className="font-medium">{key}:</span> {String(value)} →
                      </div>
                    ))}
                  {activity.new_value &&
                    Object.entries(activity.new_value).map(([key, value]) => (
                      <div key={`new-${key}`} className="text-gray-700 font-medium">
                        {String(value)}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
