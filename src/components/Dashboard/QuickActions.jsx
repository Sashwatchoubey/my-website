import { useNavigate } from 'react-router-dom'
import { FolderPlus, UserPlus, Receipt, BarChart3, CalendarCheck, Download } from 'lucide-react'

const actions = [
  { icon: FolderPlus,    label: 'New Project',  color: 'from-orange-500 to-orange-600', path: '/projects' },
  { icon: UserPlus,      label: 'Add Staff',    color: 'from-emerald-500 to-teal-600',  path: '/manpower' },
  { icon: Receipt,       label: 'New Invoice',  color: 'from-orange-500 to-amber-500',  path: '/invoicing' },
  { icon: BarChart3,     label: 'Expenses',     color: 'from-pink-500 to-rose-600',     path: '/expenses' },
  { icon: CalendarCheck, label: 'Attendance',   color: 'from-cyan-500 to-blue-600',     path: '/attendance' },
  { icon: Download,      label: 'Reports',      color: 'from-orange-500 to-orange-600', path: '/pnl' },
]

export default function QuickActions() {
  const navigate = useNavigate()
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map(({ icon: Icon, label, color, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
              <Icon size={18} />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
