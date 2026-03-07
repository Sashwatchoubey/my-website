import { useState, useMemo } from 'react'
import { projects } from '../data/sampleData'
import { formatCurrency, formatDate, progressColor } from '../utils/helpers'
import StatusBadge from '../components/UI/StatusBadge'
import {
  Search, SlidersHorizontal, Plus, MapPin, Calendar, Users,
  TrendingUp, ChevronRight, X,
} from 'lucide-react'

const ALL_STATUSES = ['All', 'Active', 'Completed', 'Upcoming', 'On Hold']

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedProject, setSelectedProject] = useState(null)

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.client.toLowerCase().includes(search.toLowerCase()) ||
        p.district.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage all projects under AIILSG West Bengal Centre
          </p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md hover:shadow-indigo-400/30 transition-all text-sm self-start sm:self-auto">
          <Plus size={16} />
          Add New Project
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by project name, client, district…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={15} className="text-gray-400 shrink-0" />
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
        Showing {filtered.length} of {projects.length} projects
      </p>

      {/* Project cards grid */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-sm font-medium">No projects found</p>
          <p className="text-xs mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  )
}

function ProjectCard({ project, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card p-5 cursor-pointer hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 flex-1">
          {project.name}
        </h3>
        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5" />
      </div>

      {/* Status */}
      <div className="mb-3">
        <StatusBadge status={project.status} />
      </div>

      {/* Meta info */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Users size={12} className="shrink-0" />
          <span className="truncate">{project.client}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <MapPin size={12} className="shrink-0" />
          <span>{project.location}, {project.district}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={12} className="shrink-0" />
          <span>{formatDate(project.startDate)} → {formatDate(project.endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <TrendingUp size={12} className="shrink-0" />
          <span>Budget: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(project.budget, true)}</span></span>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full progress-animate ${progressColor(project.progress)}`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Staff */}
      <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>👤 {project.staff} staff assigned</span>
        <span className="font-medium text-gray-500 dark:text-gray-400">
          Spent: {formatCurrency(project.spent, true)}
        </span>
      </div>
    </div>
  )
}

function ProjectModal({ project, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-t-3xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-white font-bold text-base leading-snug">{project.name}</h2>
              <p className="text-indigo-200 text-sm mt-1">{project.client}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1 shrink-0">
              <X size={20} />
            </button>
          </div>
          <div className="mt-3">
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Location', value: `${project.location}, ${project.district}` },
              { label: 'Manager', value: project.manager },
              { label: 'Start Date', value: formatDate(project.startDate) },
              { label: 'End Date', value: formatDate(project.endDate) },
              { label: 'Budget', value: formatCurrency(project.budget) },
              { label: 'Spent', value: formatCurrency(project.spent) },
              { label: 'Receivable', value: formatCurrency(project.budget - project.spent) },
              { label: 'Staff', value: `${project.staff} members` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Overall Progress</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{project.progress}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full progress-animate ${progressColor(project.progress)}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
              Edit Project
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
