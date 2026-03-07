import { recentActivities } from '../../data/sampleData'

export default function RecentActivities() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Recent Activities</h3>
        <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</button>
      </div>
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform">
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{activity.text}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
