import { statusColor } from '../../utils/helpers'

export default function StatusBadge({ status }) {
  const dots = {
    Active:    'bg-emerald-400',
    Completed: 'bg-blue-400',
    Upcoming:  'bg-amber-400',
    'On Hold': 'bg-red-400',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(status)}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-gray-400'}`} />
      {status}
    </span>
  )
}
