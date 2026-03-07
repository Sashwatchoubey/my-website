import { useState, useMemo, useEffect, useCallback } from 'react'
import { projects as sampleProjects } from '../data/sampleData'
import { formatCurrency, formatDate, progressColor } from '../utils/helpers'
import StatusBadge from '../components/UI/StatusBadge'
import {
  Search, SlidersHorizontal, Plus, MapPin, Calendar, Users,
  TrendingUp, ChevronRight, X, Pencil, Trash2, Eye,
  CheckCircle, AlertCircle, Phone, Mail, Building2, FileText,
  IndianRupee, User, StickyNote,
} from 'lucide-react'

const ALL_STATUSES = ['All', 'Active', 'Completed', 'Upcoming', 'On Hold']
const LS_KEY = 'aiilsg_projects'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcProjectPeriod(startDate, endDate) {
  if (!startDate || !endDate) return ''
  const s = new Date(startDate)
  const e = new Date(endDate)
  if (isNaN(s) || isNaN(e) || e < s) return ''
  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (years === 0) return `${rem} month${rem !== 1 ? 's' : ''}`
  if (rem === 0) return `${years} year${years !== 1 ? 's' : ''}`
  return `${years} yr ${rem} mo`
}

const EMPTY_FORM = {
  name: '',
  client: '',
  clientOrganization: '',
  clientContact: '',
  clientEmail: '',
  clientAddress: '',
  description: '',
  location: '',
  state: 'West Bengal',
  budget: '',
  startDate: '',
  endDate: '',
  status: 'Active',
  manager: '',
  progress: 0,
  remarks: '',
  staff: 0,
  spent: 0,
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-fade-in
            ${t.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'}`}
        >
          {t.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ─── Form field helper ────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 tracking-wide uppercase">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all'

// ─── Project Form Modal ───────────────────────────────────────────────────────
function ProjectFormModal({ initial, onSave, onClose }) {
  const isEdit = !!initial
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_FORM })
  const [errors, setErrors] = useState({})

  const period = calcProjectPeriod(form.startDate, form.endDate)

  const set = useCallback((field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }, [])

  function validate() {
    const req = ['name', 'client', 'clientOrganization', 'description', 'location', 'budget', 'startDate', 'endDate', 'status']
    const errs = {}
    req.forEach(k => {
      if (!form[k] && form[k] !== 0) errs[k] = 'Required'
    })
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      errs.endDate = 'End date must be after start date'
    }
    if (form.budget && isNaN(Number(form.budget))) errs.budget = 'Must be a number'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSave({
      ...form,
      budget: Number(form.budget),
      progress: Number(form.progress) || 0,
      staff: Number(form.staff) || 0,
      spent: Number(form.spent) || 0,
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-t-3xl shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">{isEdit ? 'Edit Project' : 'Add New Project'}</h2>
              <p className="text-indigo-200 text-sm mt-0.5">
                {isEdit ? 'Update project details below' : 'Fill in the project details below'}
              </p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Section: Project Info */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">Project Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Project Name" required>
                  <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Kolkata Smart City Phase III" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Project Description" required>
                  <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of the project scope…" />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </Field>
              </div>
              <Field label="District / Location" required>
                <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Kolkata" />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </Field>
              <Field label="State" required>
                <input className={inputCls} value={form.state} onChange={e => set('state', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Section: Client Info */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">Client Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Client Name" required>
                <input className={inputCls} value={form.client} onChange={e => set('client', e.target.value)} placeholder="e.g. Kolkata Municipal Corporation" />
                {errors.client && <p className="text-xs text-red-500 mt-1">{errors.client}</p>}
              </Field>
              <Field label="Client Organization" required>
                <input className={inputCls} value={form.clientOrganization} onChange={e => set('clientOrganization', e.target.value)} placeholder="e.g. KMC" />
                {errors.clientOrganization && <p className="text-xs text-red-500 mt-1">{errors.clientOrganization}</p>}
              </Field>
              <Field label="Contact Number">
                <input className={inputCls} value={form.clientContact} onChange={e => set('clientContact', e.target.value)} placeholder="e.g. 033-2286-1000" />
              </Field>
              <Field label="Email">
                <input className={inputCls} type="email" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} placeholder="e.g. info@kmc.gov.in" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Client Address">
                  <textarea className={`${inputCls} resize-none`} rows={2} value={form.clientAddress} onChange={e => set('clientAddress', e.target.value)} placeholder="Full mailing address…" />
                </Field>
              </div>
            </div>
          </div>

          {/* Section: Finance & Dates */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">Finance & Timeline</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Project Budget (₹)" required>
                <input className={inputCls} type="number" min={0} value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. 18500000" />
                {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
              </Field>
              <Field label="Amount Spent (₹)">
                <input className={inputCls} type="number" min={0} value={form.spent} onChange={e => set('spent', e.target.value)} placeholder="e.g. 0" />
              </Field>
              <Field label="Start Date" required>
                <input className={inputCls} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
              </Field>
              <Field label="End Date" required>
                <input className={inputCls} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
              </Field>
              {period && (
                <div className="sm:col-span-2">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <Calendar size={14} className="text-indigo-500" />
                    <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Project Period: <strong>{period}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Status & Progress */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">Status & Progress</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Project Status" required>
                <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                  {['Upcoming', 'Active', 'On Hold', 'Completed'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Project Manager / Officer">
                <input className={inputCls} value={form.manager} onChange={e => set('manager', e.target.value)} placeholder="e.g. Smt. Priya Ghosh" />
              </Field>
              <Field label="Staff Assigned">
                <input className={inputCls} type="number" min={0} value={form.staff} onChange={e => set('staff', e.target.value)} placeholder="0" />
              </Field>
              <Field label={`Progress: ${form.progress}%`}>
                <input
                  type="range" min={0} max={100} value={form.progress}
                  onChange={e => set('progress', e.target.value)}
                  className="w-full accent-indigo-600 mt-1"
                />
              </Field>
            </div>
          </div>

          {/* Section: Remarks */}
          <div>
            <Field label="Remarks / Notes">
              <textarea className={`${inputCls} resize-none`} rows={2} value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="Any additional notes or remarks…" />
            </Field>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 dark:border-gray-700 shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md hover:shadow-indigo-400/30 transition-all"
          >
            {isEdit ? 'Save Changes' : 'Add Project'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────
function ConfirmDialog({ project, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <Trash2 size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Delete Project?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{project.name}</strong>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-md"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Detail View Modal ────────────────────────────────────────────────────────
function ProjectDetailModal({ project, onClose, onEdit, onDelete }) {
  const period = calcProjectPeriod(project.startDate, project.endDate)

  const infoRow = (label, value, icon) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-0.5">
        {icon && <span className="shrink-0">{icon}</span>}
        {label}
      </div>
      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value || '—'}</div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-t-3xl shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-white font-bold text-base leading-snug">{project.name}</h2>
              <p className="text-indigo-200 text-sm mt-1 truncate">{project.client}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 shrink-0">
              <X size={20} />
            </button>
          </div>
          <div className="mt-3">
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{project.description}</p>

          {/* Client Details */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">Client Details</p>
            <div className="grid grid-cols-2 gap-3">
              {infoRow('Client Name', project.client, <Building2 size={11} />)}
              {infoRow('Organization', project.clientOrganization, <Building2 size={11} />)}
              {infoRow('Contact', project.clientContact, <Phone size={11} />)}
              {infoRow('Email', project.clientEmail, <Mail size={11} />)}
              {project.clientAddress && (
                <div className="col-span-2">
                  {infoRow('Address', project.clientAddress, <MapPin size={11} />)}
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">Project Details</p>
            <div className="grid grid-cols-2 gap-3">
              {infoRow('Location', `${project.location}, ${project.district}`, <MapPin size={11} />)}
              {infoRow('State', project.state || 'West Bengal', <MapPin size={11} />)}
              {infoRow('Start Date', formatDate(project.startDate), <Calendar size={11} />)}
              {infoRow('End Date', formatDate(project.endDate), <Calendar size={11} />)}
              {infoRow('Project Period', period, <Calendar size={11} />)}
              {infoRow('Manager', project.manager, <User size={11} />)}
              {infoRow('Budget', formatCurrency(project.budget), <IndianRupee size={11} />)}
              {infoRow('Spent', formatCurrency(project.spent), <IndianRupee size={11} />)}
              {infoRow('Receivable', formatCurrency((project.budget || 0) - (project.spent || 0)), <IndianRupee size={11} />)}
              {infoRow('Staff Assigned', `${project.staff || 0} members`, <Users size={11} />)}
            </div>
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

          {/* Remarks */}
          {project.remarks && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <StickyNote size={14} className="text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Remarks</span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-300">{project.remarks}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 dark:border-gray-700 shrink-0 flex gap-3">
          <button
            onClick={() => onDelete(project)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 font-medium rounded-xl text-sm transition-colors border border-red-100 dark:border-red-800"
          >
            <Trash2 size={15} /> Delete
          </button>
          <button
            onClick={() => onEdit(project)}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md transition-all"
          >
            <Pencil size={15} /> Edit Project
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onView, onEdit, onDelete }) {
  return (
    <div className="card p-5 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-200 group relative flex flex-col">
      {/* Action buttons — hover on desktop, always visible on mobile */}
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); onEdit(project) }}
          title="Edit"
          className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(project) }}
          title="Delete"
          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Clickable content */}
      <div onClick={() => onView(project)} className="cursor-pointer flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-2 mb-3 pr-16 sm:pr-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 flex-1">
            {project.name}
          </h3>
          <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5 hidden sm:block" />
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
        <div className="mt-auto">
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

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1"><Eye size={11} /> View details</span>
          <span className="font-medium text-gray-500 dark:text-gray-400">
            Spent: {formatCurrency(project.spent, true)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [allProjects, setAllProjects] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      return stored ? JSON.parse(stored) : sampleProjects
    } catch {
      return sampleProjects
    }
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewProject, setViewProject] = useState(null)
  const [editProject, setEditProject] = useState(null)    // null = closed, {} = new, {...} = edit
  const [deleteProject, setDeleteProject] = useState(null)
  const [toasts, setToasts] = useState([])

  // Persist to localStorage whenever projects change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(allProjects))
    } catch { /* ignore */ }
  }, [allProjects])

  function showToast(message, type = 'success') {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  function handleSave(data) {
    if (data.id) {
      // Edit existing
      setAllProjects(ps => ps.map(p => p.id === data.id ? data : p))
      showToast('Project updated successfully!')
      setViewProject(data)
    } else {
      // Create new
      const newProject = { ...data, id: Date.now() }
      setAllProjects(ps => [newProject, ...ps])
      showToast('Project added successfully!')
    }
    setEditProject(null)
  }

  function handleDelete(project) {
    setAllProjects(ps => ps.filter(p => p.id !== project.id))
    setDeleteProject(null)
    setViewProject(null)
    showToast(`"${project.name}" has been deleted.`)
  }

  function openEdit(project) {
    setViewProject(null)
    setEditProject(project)
  }

  function openDelete(project) {
    setViewProject(null)
    setDeleteProject(project)
  }

  const filtered = useMemo(() => {
    return allProjects.filter(p => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.client.toLowerCase().includes(search.toLowerCase()) ||
        (p.district || '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter, allProjects])

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
        <button
          onClick={() => setEditProject({ ...EMPTY_FORM })}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md hover:shadow-indigo-400/30 transition-all text-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          Add New Project
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
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
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
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
        Showing {filtered.length} of {allProjects.length} projects
      </p>

      {/* Grid */}
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
              onView={setViewProject}
              onEdit={openEdit}
              onDelete={setDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {viewProject && (
        <ProjectDetailModal
          project={viewProject}
          onClose={() => setViewProject(null)}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      )}

      {editProject !== null && (
        <ProjectFormModal
          initial={editProject.id ? editProject : null}
          onSave={handleSave}
          onClose={() => setEditProject(null)}
        />
      )}

      {deleteProject && (
        <ConfirmDialog
          project={deleteProject}
          onConfirm={() => handleDelete(deleteProject)}
          onCancel={() => setDeleteProject(null)}
        />
      )}

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </div>
  )
}

