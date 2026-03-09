import { useAuth } from '../context/AuthContext'
import { todayFormatted } from '../utils/helpers'
import SummaryCards from '../components/Dashboard/SummaryCards'
import { ProjectExpenseChart, MonthlyFinancialChart, StaffPieChart } from '../components/Dashboard/Charts'
import RecentActivities from '../components/Dashboard/RecentActivities'
import QuickActions from '../components/Dashboard/QuickActions'
import AiilsgLogo from '../components/UI/AiilsgLogo'

const KEY_SERVICES = [
  'Urban Planning & Development',
  'Municipal Administration Training',
  'Water Supply & Sanitation',
  'Smart City Consulting',
  'Capacity Building & Training',
  'Research & Documentation',
  'Project Management & Consultancy',
  'Solid Waste Management',
  'E-Governance Solutions',
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 p-6 text-white shadow-xl">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -right-16 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute top-4 right-20 w-16 h-16 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold mb-1">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p className="text-orange-200 text-sm">
              {todayFormatted()} · West Bengal Centre, Kolkata
            </p>
            <p className="text-orange-300 text-xs mt-1">
              AIILSG Project Management System — FY 2024-25
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">
              {user?.role}
            </span>
            <span className="text-orange-300 text-xs">Kolkata HQ</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards />

      {/* About AIILSG */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-900/50 shadow-lg p-6">
        {/* Decorative gradient blob */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
            <AiilsgLogo size={56} />
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  All India Institute of Local Self Government
                </h3>
                <span className="bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-700">
                  Est. 1926
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Headquarters: Mumbai, Maharashtra ·{' '}
                <a
                  href="https://www.aiilsg.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
                >
                  www.aiilsg.org
                </a>
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-1 italic">
                "Strengthening Local Self-Governance for Sustainable Development"
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            AIILSG is a premier national institute dedicated to strengthening local self-governance across India.
            Established in 1926, it is one of the oldest institutions working in urban and rural local governance,
            municipal administration, urban planning, capacity building, research, and consultancy. The Institute
            serves Municipal Corporations, Urban Local Bodies, State Governments, Central Government, and
            international organisations.
          </p>

          {/* West Bengal Centre callout */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-0.5 uppercase tracking-wide">
              West Bengal Centre · Kolkata
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manages multiple projects across West Bengal including urban development, municipal training,
              water supply, sanitation, smart city initiatives, and capacity building programmes.
            </p>
          </div>

          {/* Key services */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Key Services
            </p>
            <div className="flex flex-wrap gap-2">
              {KEY_SERVICES.map((service) => (
                <span
                  key={service}
                  className="bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-xs font-medium px-3 py-1 rounded-full"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

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
