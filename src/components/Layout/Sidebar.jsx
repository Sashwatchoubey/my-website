import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, FolderKanban, Users, Wallet, CalendarDays,
  FileText, Receipt, TrendingUp, BarChart3, LineChart,
  CalendarCheck, Settings, LogOut, X, ChevronRight,
} from 'lucide-react'
import AiilsgLogo from '../UI/AiilsgLogo'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',            path: '/dashboard',   active: true },
  { icon: FolderKanban,    label: 'Projects',             path: '/projects',    active: true },
  { icon: Users,           label: 'Manpower / Staff',     path: '/staff',       active: true },
  { icon: CalendarDays,    label: 'Attendance',           path: '/attendance',  active: true },
  { icon: Wallet,          label: 'Salary Management',    path: '/salary',      active: true },
  { icon: FileText,        label: 'Payslip',              path: '/payslip',     active: false },
  { icon: Receipt,         label: 'Invoicing',            path: '/invoicing',   active: false },
  { icon: TrendingUp,      label: 'Income & Receivables', path: '/income',      active: false },
  { icon: BarChart3,       label: 'Expenses',             path: '/expenses',    active: false },
  { icon: LineChart,       label: 'Profit & Loss',        path: '/pnl',         active: false },
  { icon: CalendarCheck,   label: 'Activities & Events',  path: '/activities',  active: false },
  { icon: Settings,        label: 'Settings',             path: '/settings',    active: false },
]

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64
          bg-[#1B2A3D]
          shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AiilsgLogo size={40} />
            <div>
              <div className="text-white font-bold text-sm leading-tight">AIILSG</div>
              <div className="text-orange-300 text-xs leading-tight">WB Centre · PMS</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-orange-300 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(({ icon: Icon, label, path, active }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-orange-500/20 text-orange-400 shadow-lg'
                  : active
                    ? 'text-gray-300 hover:bg-[#2D3E52] hover:text-white'
                    : 'text-gray-500 cursor-default opacity-60'
                }
              `}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {!active && (
                <span className="text-xs bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full">Soon</span>
              )}
              {active && (
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.avatar}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
              <div className="text-gray-400 text-xs truncate">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
