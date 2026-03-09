import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { monthlyFinancials } from '../../data/sampleData'

const DEPT_COLORS = [
  '#FF7B1C', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6',
  '#f43f5e', '#6366f1', '#84cc16', '#ec4899', '#14b8a6',
]

function getProjectsFromLS() {
  try {
    const data = JSON.parse(localStorage.getItem('aiilsg_projects') || '[]')
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

function getStaffFromLS() {
  try {
    const data = JSON.parse(localStorage.getItem('aiilsg_staff') || '[]')
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

const fmtL = (v) => `₹${(v / 100000).toFixed(1)}L`

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600 dark:text-gray-400">{p.name}:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{fmtL(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function ProjectExpenseChart() {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const projects = getProjectsFromLS()
    const data = projects
      .filter(p => Number(p.budget) > 0 || Number(p.spent) > 0)
      .map(p => ({
        name: p.name || 'Unknown',
        budget: Number(p.budget) || 0,
        spent: Number(p.spent) || 0,
      }))
    setChartData(data)
  }, [])

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Project-wise Budget vs Spent</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 4, right: 10, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis tickFormatter={fmtL} tick={{ fontSize: 10, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="budget" name="Budget" fill="#FED7AA" radius={[4, 4, 0, 0]} />
          <Bar dataKey="spent"  name="Spent"  fill="#FF7B1C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonthlyFinancialChart() {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Monthly Income vs Expenses (FY 2024-25)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={monthlyFinancials} margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tickFormatter={fmtL} tick={{ fontSize: 10, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone" dataKey="income" name="Income"
            stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }}
          />
          <Line
            type="monotone" dataKey="expense" name="Expense"
            stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3, fill: '#f43f5e' }} activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function StaffTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-gray-800 dark:text-gray-200">{d.name}</p>
      <p className="text-gray-500 dark:text-gray-400">{d.value} members</p>
    </div>
  )
}

export function StaffPieChart() {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const staff = getStaffFromLS()
    const deptMap = {}
    staff.forEach(s => {
      const dept = s.department || 'Other'
      deptMap[dept] = (deptMap[dept] || 0) + 1
    })
    const data = Object.entries(deptMap).map(([name, value], i) => ({
      name,
      value,
      color: DEPT_COLORS[i % DEPT_COLORS.length],
    }))
    setChartData(data)
  }, [])

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Staff Distribution by Department</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="45%"
            innerRadius={60} outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<StaffTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
