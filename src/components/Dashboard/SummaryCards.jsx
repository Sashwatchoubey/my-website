import AnimatedCounter from '../UI/AnimatedCounter'
import { summaryStats } from '../../data/sampleData'
import { FolderKanban, Users, TrendingUp, TrendingDown, Banknote, IndianRupee } from 'lucide-react'

const cards = [
  {
    label: 'Total Active Projects',
    value: summaryStats.totalActiveProjects,
    icon: FolderKanban,
    color: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    text: 'text-indigo-600 dark:text-indigo-400',
    prefix: '',
    suffix: '',
    decimals: 0,
  },
  {
    label: 'Total Staff / Manpower',
    value: summaryStats.totalStaff,
    icon: Users,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    text: 'text-violet-600 dark:text-violet-400',
    prefix: '',
    suffix: '',
    decimals: 0,
  },
  {
    label: 'Total Income (FY)',
    value: summaryStats.totalIncome / 100000,
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-600 dark:text-emerald-400',
    prefix: '₹',
    suffix: ' L',
    decimals: 2,
  },
  {
    label: 'Total Expenses (FY)',
    value: summaryStats.totalExpenses / 100000,
    icon: TrendingDown,
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
    text: 'text-orange-600 dark:text-orange-400',
    prefix: '₹',
    suffix: ' L',
    decimals: 2,
  },
  {
    label: 'Total Receivables',
    value: summaryStats.totalReceivables / 100000,
    icon: Banknote,
    color: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/50',
    text: 'text-cyan-600 dark:text-cyan-400',
    prefix: '₹',
    suffix: ' L',
    decimals: 2,
  },
  {
    label: 'Net Profit (FY)',
    value: summaryStats.netProfit / 100000,
    icon: IndianRupee,
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50 dark:bg-pink-950/50',
    text: 'text-pink-600 dark:text-pink-400',
    prefix: '₹',
    suffix: ' L',
    decimals: 2,
  },
]

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
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
                  target={card.value}
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
