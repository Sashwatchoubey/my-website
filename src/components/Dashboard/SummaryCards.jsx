import { useState, useEffect } from 'react'
import AnimatedCounter from '../UI/AnimatedCounter'
import { FolderKanban, Users, TrendingUp, TrendingDown, Banknote, IndianRupee } from 'lucide-react'

function getStaffFromLS() {
  try {
    const data = JSON.parse(localStorage.getItem('aiilsg_staff') || '[]')
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

function getProjectsFromLS() {
  try {
    const data = JSON.parse(localStorage.getItem('aiilsg_projects') || '[]')
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

function getSalaryFromLS() {
  try {
    const data = JSON.parse(localStorage.getItem('aiilsg_salary') || '{}')
    return typeof data === 'object' && data !== null ? data : {}
  } catch { return {} }
}

const CARD_CONFIGS = [
  {
    key: 'totalActiveProjects',
    label: 'Total Active Projects',
    icon: FolderKanban,
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
    text: 'text-orange-600 dark:text-orange-400',
    prefix: '',
    suffix: '',
    decimals: 0,
  },
  {
    key: 'totalStaff',
    label: 'Total Staff / Manpower',
    icon: Users,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    text: 'text-violet-600 dark:text-violet-400',
    prefix: '',
    suffix: '',
    decimals: 0,
  },
  {
    key: 'totalIncome',
    label: 'Total Income (FY)',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-600 dark:text-emerald-400',
    prefix: '₹',
    suffix: ' L',
    decimals: 2,
    divisor: 100000,
  },
  {
    key: 'totalExpenses',
    label: 'Total Expenses (FY)',
    icon: TrendingDown,
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
    text: 'text-orange-600 dark:text-orange-400',
    prefix: '₹',
    suffix: ' L',
    decimals: 2,
    divisor: 100000,
  },
  {
    key: 'totalReceivables',
    label: 'Total Receivables',
    icon: Banknote,
    color: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/50',
    text: 'text-cyan-600 dark:text-cyan-400',
    prefix: '₹',
    suffix: ' L',
    decimals: 2,
    divisor: 100000,
  },
  {
    key: 'netProfit',
    label: 'Net Profit (FY)',
    icon: IndianRupee,
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50 dark:bg-pink-950/50',
    text: 'text-pink-600 dark:text-pink-400',
    prefix: '₹',
    suffix: ' L',
    decimals: 2,
    divisor: 100000,
  },
]

export default function SummaryCards() {
  const [stats, setStats] = useState({
    totalActiveProjects: 0,
    totalStaff: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalReceivables: 0,
    netProfit: 0,
  })

  useEffect(() => {
    const projects = getProjectsFromLS()
    const staff = getStaffFromLS()
    const salary = getSalaryFromLS()

    const activeProjects = projects.filter(p => p.status === 'Active').length
    const totalStaff = staff.length

    const totalIncome = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0)
    const totalSpent = projects.reduce((sum, p) => sum + (Number(p.spent) || 0), 0)

    const salaryEntries = Object.values(salary)
    const totalSalaryExpense = salaryEntries.reduce((sum, s) => sum + (Number(s.netSalary) || 0), 0)

    const totalExpenses = totalSpent + totalSalaryExpense
    const totalReceivables = totalIncome - totalSpent

    setStats({
      totalActiveProjects: activeProjects,
      totalStaff,
      totalIncome,
      totalExpenses,
      totalReceivables: totalReceivables > 0 ? totalReceivables : 0,
      netProfit: totalIncome - totalExpenses,
    })
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {CARD_CONFIGS.map((card) => {
        const Icon = card.icon
        const rawValue = stats[card.key]
        const displayValue = card.divisor ? rawValue / card.divisor : rawValue
        return (
          <div
            key={card.label}
            className={`card p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200 ${card.bg}`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md shrink-0`}>
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <div className={`text-2xl font-bold ${card.text}`}>
                <AnimatedCounter
                  target={displayValue}
                  prefix={card.prefix}
                  suffix={card.suffix}
                  decimals={card.decimals}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{card.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
