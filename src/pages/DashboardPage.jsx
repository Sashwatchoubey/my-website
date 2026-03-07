import { useAuth } from '../context/AuthContext'
import { todayFormatted } from '../utils/helpers'
import SummaryCards from '../components/Dashboard/SummaryCards'
import { ProjectExpenseChart, MonthlyFinancialChart, StaffPieChart } from '../components/Dashboard/Charts'
import RecentActivities from '../components/Dashboard/RecentActivities'
import QuickActions from '../components/Dashboard/QuickActions'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white shadow-xl">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -right-16 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute top-4 right-20 w-16 h-16 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold mb-1">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p className="text-indigo-200 text-sm">
              {todayFormatted()} · West Bengal Centre, Kolkata
            </p>
            <p className="text-indigo-300 text-xs mt-1">
              AIILSG Project Management System — FY 2024-25
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">
              {user?.role}
            </span>
            <span className="text-indigo-300 text-xs">Kolkata HQ</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ProjectExpenseChart />
        </div>
        <StaffPieChart />
      </div>

      <div>
        <MonthlyFinancialChart />
      </div>

      {/* Activities + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>
        <QuickActions />
      </div>
    </div>
  )
}
