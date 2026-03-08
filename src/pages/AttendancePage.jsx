import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  CalendarDays, Users, Save, Printer, Plus, Trash2, Pencil, X,
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Calendar,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const LS_STAFF      = 'aiilsg_staff'
const LS_HOLIDAYS   = 'aiilsg_holidays'
const LS_ATTENDANCE = 'aiilsg_attendance'

/** Casual Leave accrual: 1 day per calendar month. */
const CL_PER_MONTH = 1

const STATUS_OPTIONS = [
  'PRESENT', 'REST DAY', 'HOLIDAY', 'CASUAL LEAVE',
  'SICK LEAVE', 'UNPAID LEAVE', 'HALF DAY', 'ABSENT', 'LOCAL HOLIDAY',
]

const DAY_NAMES  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const DAY_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// ─── Fallback sample staff (mirrors StaffPage SAMPLE_STAFF roster fields) ────
const SAMPLE_STAFF = [
  {
    id: 'AIILSG-001',
    fullName: 'Dr. Subrata Banerjee',
    designation: 'Centre Director',
    department: 'Management',
    employmentStatus: 'Active',
    assignedProject: 'Urban Local Body Staff Training Programme – Batch 12',
    projectSiteLocation: 'Kolkata',
    rosterType: 'Monday to Friday',
    customDays: [],
    shiftStart: '09:00',
    shiftEnd: '18:00',
    localHolidays: [],
  },
  {
    id: 'AIILSG-002',
    fullName: 'Smt. Priya Ghosh',
    designation: 'Senior Project Manager',
    department: 'Projects',
    employmentStatus: 'Active',
    assignedProject: 'Kolkata Smart City Mission – Phase II',
    projectSiteLocation: 'Kolkata',
    rosterType: 'Monday to Saturday',
    customDays: [],
    shiftStart: '09:00',
    shiftEnd: '18:00',
    localHolidays: [],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function pad(n) { return String(n).padStart(2, '0') }

function toDateStr(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

/** "2025-01-05" → "05 Jan 2025" */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d} ${MONTH_NAMES[parseInt(m, 10) - 1].slice(0, 3)} ${y}`
}

/** "09:00" + "17:30" → "8h 30m" */
function computeTotalHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return ''
  const [ih, im] = clockIn.split(':').map(Number)
  const [oh, om] = clockOut.split(':').map(Number)
  const mins = (oh * 60 + om) - (ih * 60 + im)
  if (mins <= 0) return ''
  return `${Math.floor(mins / 60)}h ${pad(mins % 60)}m`
}

function parseMins(totalHours) {
  if (!totalHours) return 0
  const m = totalHours.match(/(\d+)h\s*(\d+)m/)
  return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 0
}

function formatMins(total) {
  if (total <= 0) return '0h 00m'
  return `${Math.floor(total / 60)}h ${pad(total % 60)}m`
}

function isRestDay(dateStr, staff) {
  const dow = new Date(dateStr).getDay() // 0=Sun
  const roster = staff.rosterType || 'Monday to Friday'
  if (roster === 'Monday to Friday') return dow === 0 || dow === 6
  if (roster === 'Monday to Saturday') return dow === 0
  if (roster === 'Custom') {
    return !(staff.customDays || []).includes(DAY_NAMES[dow])
  }
  // default to Mon-Fri
  return dow === 0 || dow === 6
}

function getShiftName(staff) {
  if (!staff) return ''
  const roster = staff.rosterType || 'Monday to Friday'
  const end = staff.shiftEnd || '18:00'
  return `${roster} | ${staff.shiftStart || '09:00'} – ${end}`
}

function getRowBg(status) {
  switch (status) {
    case 'REST DAY':      return 'bg-gray-100 dark:bg-gray-700/60'
    case 'HOLIDAY':       return 'bg-green-50 dark:bg-green-900/20'
    case 'LOCAL HOLIDAY': return 'bg-yellow-50 dark:bg-yellow-900/20'
    case 'ABSENT':        return 'bg-red-50 dark:bg-red-900/20'
    case 'HALF DAY':      return 'bg-orange-50 dark:bg-orange-900/20'
    case 'CASUAL LEAVE':
    case 'SICK LEAVE':
    case 'UNPAID LEAVE':  return 'bg-blue-50 dark:bg-blue-900/20'
    default:              return ''
  }
}

function generateRows(year, month, staff, globalHolidays) {
  const days = getDaysInMonth(year, month)
  return Array.from({ length: days }, (_, i) => {
    const d = i + 1
    const dateStr = toDateStr(year, month, d)
    const dow     = new Date(dateStr).getDay()
    let status    = 'PRESENT'
    if (isRestDay(dateStr, staff)) {
      status = 'REST DAY'
    } else if ((globalHolidays || []).some(h => h.date === dateStr)) {
      status = 'HOLIDAY'
    } else if ((staff.localHolidays || []).some(h => h.date === dateStr)) {
      status = 'LOCAL HOLIDAY'
    }
    return { date: dateStr, day: DAY_SHORT[dow], clockIn: '', clockOut: '', totalHours: '', status }
  })
}

function readLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

function getStaffId(s) { return s.employeeID || s.id }

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg
      text-white text-sm animate-fade-in
      ${type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
        <X size={13} />
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AttendancePage() {
  const [activeTab, setActiveTab]           = useState('attendance')
  const [toast, setToast]                   = useState(null)

  // Attendance tab state
  const [staffList, setStaffList]           = useState([])
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedYear, setSelectedYear]     = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth]   = useState(new Date().getMonth())
  const [record, setRecord]                 = useState(null)   // loaded attendance record
  const [isLoaded, setIsLoaded]             = useState(false)

  // Global holidays
  const [globalHolidays, setGlobalHolidays] = useState([])

  // Holiday management tab state
  const [isAdding, setIsAdding]             = useState(false)
  const [newHol, setNewHol]                 = useState({ date: '', name: '' })
  const [editingId, setEditingId]           = useState(null)
  const [editData, setEditData]             = useState({ date: '', name: '' })

  // ── Load from localStorage on mount ────────────────────────────────────────
  useEffect(() => {
    const staff = readLS(LS_STAFF, null)
    setStaffList(Array.isArray(staff) && staff.length ? staff : SAMPLE_STAFF)
    setGlobalHolidays(readLS(LS_HOLIDAYS, []))
  }, [])

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), [])

  const selectedStaff = useMemo(
    () => staffList.find(s => getStaffId(s) === selectedStaffId) || null,
    [staffList, selectedStaffId]
  )

  // ── Attendance handlers ─────────────────────────────────────────────────────
  const handleLoad = useCallback(() => {
    if (!selectedStaff) { showToast('Please select a staff member.', 'error'); return }
    const key   = `${getStaffId(selectedStaff)}_${selectedYear}_${selectedMonth + 1}`
    const all   = readLS(LS_ATTENDANCE, {})
    if (all[key]) {
      setRecord(all[key])
    } else {
      setRecord({
        staffId: getStaffId(selectedStaff),
        year:    selectedYear,
        month:   selectedMonth + 1,
        rows:    generateRows(selectedYear, selectedMonth, selectedStaff, globalHolidays),
        remarks: '',
      })
    }
    setIsLoaded(true)
  }, [selectedStaff, selectedYear, selectedMonth, globalHolidays, showToast])

  const handleSave = useCallback(() => {
    if (!record) { showToast('Nothing to save.', 'error'); return }
    try {
      const key = `${record.staffId}_${record.year}_${record.month}`
      const all = readLS(LS_ATTENDANCE, {})
      all[key]  = record
      localStorage.setItem(LS_ATTENDANCE, JSON.stringify(all))
      showToast('Attendance saved successfully!')
    } catch {
      showToast('Failed to save attendance.', 'error')
    }
  }, [record, showToast])

  const handleRowChange = useCallback((idx, field, value) => {
    setRecord(prev => {
      if (!prev) return prev
      const rows = prev.rows.map((r, i) => {
        if (i !== idx) return r
        const updated = { ...r, [field]: value }
        if (field === 'clockIn' || field === 'clockOut') {
          const ci = field === 'clockIn'  ? value : r.clockIn
          const co = field === 'clockOut' ? value : r.clockOut
          updated.totalHours = computeTotalHours(ci, co)
        }
        return updated
      })
      return { ...prev, rows }
    })
  }, [])

  // ── Summary ────────────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    if (!record) return null
    const rows = record.rows
    const count = st => rows.filter(r => r.status === st).length
    const totalPresent   = count('PRESENT') + count('HALF DAY')
    const totalHolidays  = count('HOLIDAY') + count('LOCAL HOLIDAY')
    const totalRestDays  = count('REST DAY')
    const casualLeave    = count('CASUAL LEAVE')
    const sickLeave      = count('SICK LEAVE')
    const unpaidLeave    = count('UNPAID LEAVE')
    const totalWorkingDays = rows.length - totalRestDays - totalHolidays
    const availableCL    = CL_PER_MONTH
    const remainingCL    = availableCL - casualLeave
    const totalMins      = rows.reduce((s, r) => s + parseMins(r.totalHours), 0)
    return {
      totalPresent, totalHolidays, totalRestDays,
      casualLeave, sickLeave, unpaidLeave,
      totalWorkingDays, availableCL,
      remainingCL,
      totalWorkingHours: formatMins(totalMins),
    }
  }, [record])

  // ── Holidays in selected month ─────────────────────────────────────────────
  const monthPrefix = `${selectedYear}-${pad(selectedMonth + 1)}`

  const holidaysInMonth = useMemo(() => {
    const g = globalHolidays
      .filter(h => h.date?.startsWith(monthPrefix))
      .map(h => ({ ...h, isLocal: false }))
    const l = (selectedStaff?.localHolidays || [])
      .filter(h => h.date?.startsWith(monthPrefix))
      .map(h => ({ ...h, id: h.date, isLocal: true }))
    return [...g, ...l].sort((a, b) => a.date.localeCompare(b.date))
  }, [globalHolidays, selectedStaff, monthPrefix])

  // ── Holiday management handlers ────────────────────────────────────────────
  const persistHolidays = useCallback(list => {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date))
    localStorage.setItem(LS_HOLIDAYS, JSON.stringify(sorted))
    setGlobalHolidays(sorted)
  }, [])

  const handleAddHoliday = useCallback(() => {
    if (!newHol.date || !newHol.name.trim()) {
      showToast('Date and name are required.', 'error'); return
    }
    persistHolidays([...globalHolidays, { id: `hol_${Date.now()}`, date: newHol.date, name: newHol.name.trim() }])
    setNewHol({ date: '', name: '' })
    setIsAdding(false)
    showToast('Holiday added.')
  }, [newHol, globalHolidays, persistHolidays, showToast])

  const handleDeleteHoliday = useCallback(id => {
    persistHolidays(globalHolidays.filter(h => h.id !== id))
    showToast('Holiday deleted.')
  }, [globalHolidays, persistHolidays, showToast])

  const handleStartEdit = useCallback(hol => {
    setEditingId(hol.id)
    setEditData({ date: hol.date, name: hol.name })
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editData.date || !editData.name.trim()) {
      showToast('Date and name are required.', 'error'); return
    }
    persistHolidays(globalHolidays.map(h =>
      h.id === editingId ? { ...h, date: editData.date, name: editData.name.trim() } : h
    ))
    setEditingId(null)
    showToast('Holiday updated.')
  }, [editData, editingId, globalHolidays, persistHolidays, showToast])

  // ── Misc ───────────────────────────────────────────────────────────────────
  const isNonEditable = status => ['REST DAY', 'HOLIDAY', 'LOCAL HOLIDAY'].includes(status)

  const years = useMemo(() => {
    const cy = new Date().getFullYear()
    return Array.from({ length: 6 }, (_, i) => cy - 2 + i)
  }, [])

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl ' +
    'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-500/40'

  const inlineInputCls = 'px-2.5 py-1.5 text-sm border border-indigo-200 dark:border-indigo-700 rounded-lg ' +
    'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-400/40'

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Page title */}
      <div className="mb-5 print-hide">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          AIILSG WB Centre – Staff Attendance Tracker
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 print-hide">
        {[
          { key: 'attendance', icon: <CalendarDays size={15} />, label: 'Attendance Entry' },
          { key: 'holidays',   icon: <Calendar size={15} />,     label: 'Holiday List' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${activeTab === t.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════ TAB 1 – Attendance Entry ══════════════════════ */}
      {activeTab === 'attendance' && (
        <div>
          {/* Report Header */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-2xl p-6 mb-6 text-white text-center">
            <h2 className="text-xl font-bold tracking-widest uppercase">Monthly Attendance Report</h2>
            <p className="text-indigo-200 text-sm mt-1">
              All India Institute of Local Self Government – WB Centre
            </p>
            {isLoaded && selectedStaff && (
              <p className="text-indigo-100 text-sm font-medium mt-1">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6 print-hide">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Staff */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  <Users size={11} className="inline mr-1" />Staff Member
                </label>
                <select
                  value={selectedStaffId}
                  onChange={e => { setSelectedStaffId(e.target.value); setIsLoaded(false) }}
                  className={inputCls}
                >
                  <option value="">— Select Staff —</option>
                  {staffList.map(s => (
                    <option key={getStaffId(s)} value={getStaffId(s)}>
                      {s.fullName} ({getStaffId(s)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  <CalendarDays size={11} className="inline mr-1" />Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={e => { setSelectedMonth(parseInt(e.target.value)); setIsLoaded(false) }}
                  className={inputCls}
                >
                  {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>

              {/* Year */}
              <div className="w-28">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Year</label>
                <select
                  value={selectedYear}
                  onChange={e => { setSelectedYear(parseInt(e.target.value)); setIsLoaded(false) }}
                  className={inputCls}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleLoad}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <CalendarDays size={14} />Load / New
                </button>
                {isLoaded && (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <Save size={14} />Save
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <Printer size={14} />Print / PDF
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Loaded content ── */}
          {isLoaded && record && selectedStaff ? (
            <div className="print-area">

              {/* Employee info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                  {[
                    { label: 'Employee Name',    value: selectedStaff.fullName },
                    { label: 'Designation',      value: selectedStaff.designation },
                    { label: 'ULB / Location',   value: selectedStaff.projectSiteLocation || '—' },
                    { label: 'Assigned Project', value: selectedStaff.assignedProject || '—' },
                    { label: 'Shift / Roster',   value: getShiftName(selectedStaff) },
                    { label: 'Period',           value: `${MONTH_NAMES[selectedMonth]} ${selectedYear}` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
                      <p className="text-gray-900 dark:text-white font-medium mt-0.5 text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance Table */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                        {['SL No.','Date','Day','Clock In','Clock Out','Total Hours','Status'].map(h => (
                          <th
                            key={h}
                            className="px-3 py-3 text-left text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide whitespace-nowrap"
                          >{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {record.rows.map((row, idx) => {
                        const locked = isNonEditable(row.status)
                        const rowBg  = getRowBg(row.status)
                        return (
                          <tr
                            key={row.date}
                            className={`border-t border-gray-100 dark:border-gray-700/60 ${rowBg} transition-colors`}
                          >
                            <td className="px-3 py-2 text-gray-400 dark:text-gray-500 text-center text-xs w-10">{idx + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap text-xs">
                              {formatDate(row.date)}
                            </td>
                            <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs">{row.day}</td>

                            {/* Clock In */}
                            <td className="px-3 py-2">
                              <input
                                type="time"
                                value={row.clockIn}
                                onChange={e => handleRowChange(idx, 'clockIn', e.target.value)}
                                disabled={locked}
                                className={`w-[105px] px-2 py-1.5 text-xs border rounded-lg transition-colors
                                  ${locked
                                    ? 'bg-transparent border-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40'}`}
                              />
                            </td>

                            {/* Clock Out */}
                            <td className="px-3 py-2">
                              <input
                                type="time"
                                value={row.clockOut}
                                onChange={e => handleRowChange(idx, 'clockOut', e.target.value)}
                                disabled={locked}
                                className={`w-[105px] px-2 py-1.5 text-xs border rounded-lg transition-colors
                                  ${locked
                                    ? 'bg-transparent border-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40'}`}
                              />
                            </td>

                            {/* Total Hours */}
                            <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {row.totalHours || (locked ? '' : '—')}
                            </td>

                            {/* Status */}
                            <td className="px-3 py-2">
                              <select
                                value={row.status}
                                onChange={e => handleRowChange(idx, 'status', e.target.value)}
                                disabled={locked}
                                className={`text-xs px-2 py-1.5 border rounded-lg min-w-[130px] transition-colors
                                  ${locked
                                    ? 'bg-transparent border-transparent font-semibold cursor-not-allowed text-gray-600 dark:text-gray-400'
                                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40'}`}
                              >
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                          </tr>
                        )
                      })}

                      {/* Subtotal row */}
                      {summary && (
                        <tr className="border-t-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 font-semibold">
                          <td colSpan={5} className="px-3 py-3 text-right text-indigo-700 dark:text-indigo-300 text-xs uppercase tracking-wide">
                            Employee Subtotal
                          </td>
                          <td className="px-3 py-3 text-indigo-700 dark:text-indigo-300 font-mono text-sm">
                            {summary.totalWorkingHours}
                          </td>
                          <td className="px-3 py-3 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                            {summary.totalPresent} day{summary.totalPresent !== 1 ? 's' : ''} present
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Color legend */}
              <div className="flex flex-wrap gap-2 mb-5 print-hide">
                {[
                  { label: 'Present',      cls: 'bg-white border-gray-300 text-gray-700' },
                  { label: 'Rest Day',     cls: 'bg-gray-100 text-gray-600' },
                  { label: 'Holiday',      cls: 'bg-green-100 text-green-700' },
                  { label: 'Local Holiday',cls: 'bg-yellow-100 text-yellow-700' },
                  { label: 'Absent',       cls: 'bg-red-100 text-red-700' },
                  { label: 'Half Day',     cls: 'bg-orange-100 text-orange-700' },
                  { label: 'Leave',        cls: 'bg-blue-100 text-blue-700' },
                ].map(({ label, cls }) => (
                  <span key={label} className={`px-3 py-1 rounded-full text-xs font-medium border border-gray-200 ${cls}`}>
                    {label}
                  </span>
                ))}
              </div>

              {/* Summary section */}
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  {/* Left – stats */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                      Attendance Summary
                    </h3>
                    <table className="w-full">
                      <tbody className="text-sm">
                        {[
                          { label: 'Total Present Days',         value: summary.totalPresent },
                          { label: 'Total Holidays',             value: summary.totalHolidays },
                          { label: 'Total Rest Days',            value: summary.totalRestDays },
                          { label: 'Casual Leave',               value: summary.casualLeave },
                          { label: 'Available CL (per month)',   value: summary.availableCL },
                          { label: 'Sick Leave',                 value: summary.sickLeave },
                          { label: 'Unpaid Leave',               value: summary.unpaidLeave },
                          { label: 'Remaining CL',               value: summary.remainingCL,       bold: true },
                          { label: 'Total Working Days',         value: summary.totalWorkingDays,  bold: true },
                        ].map(({ label, value, bold }) => (
                          <tr key={label} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                            <td className={`py-2 ${bold ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                              {label}
                            </td>
                            <td className={`py-2 text-right font-mono ${bold ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Right – public holiday list for month */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                      Public Holiday List — {MONTH_NAMES[selectedMonth]} {selectedYear}
                    </h3>
                    {holidaysInMonth.length === 0 ? (
                      <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6">No holidays this month</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700/40">
                            {['Date','Holiday Name','Type'].map(h => (
                              <th key={h} className="py-2 px-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {holidaysInMonth.map((h, i) => (
                            <tr
                              key={i}
                              className={`border-t border-gray-50 dark:border-gray-700/50
                                ${h.isLocal ? 'bg-yellow-50/60 dark:bg-yellow-900/10' : 'bg-green-50/40 dark:bg-green-900/10'}`}
                            >
                              <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">
                                {formatDate(h.date)}
                              </td>
                              <td className="py-2 px-3 text-gray-600 dark:text-gray-400 text-xs">{h.name}</td>
                              <td className="py-2 px-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold
                                  ${h.isLocal
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                  {h.isLocal ? 'Local' : 'Public'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
                {/* Remarks */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={record.remarks}
                    onChange={e => setRecord(prev => prev ? { ...prev, remarks: e.target.value } : prev)}
                    rows={3}
                    placeholder="Enter any remarks or notes…"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* Signature blocks */}
                <div className="grid grid-cols-2 gap-10 pt-4 border-t border-gray-100 dark:border-gray-700">
                  {/* Left – Checked & Prepared By */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
                      Checked and Prepared By
                    </p>
                    <div className="border-t-2 border-gray-400 dark:border-gray-500 pt-3">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{selectedStaff.fullName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedStaff.designation}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedStaff.projectSiteLocation || ''}</p>
                    </div>
                  </div>

                  {/* Right – Authorized Signatory */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
                      Authorized Signatory
                    </p>
                    <div className="border-t-2 border-gray-400 dark:border-gray-500 pt-3 space-y-3">
                      {[1, 2, 3].map(n => (
                        <div key={n} className="h-4 border-b border-dashed border-gray-300 dark:border-gray-600" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : !isLoaded ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center">
              <CalendarDays size={52} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Select a staff member and period, then click <strong className="text-indigo-600 dark:text-indigo-400">Load / New</strong>
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Existing records will be loaded; otherwise a new attendance sheet is created.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* ══════════════════════ TAB 2 – Holiday List ══════════════════════════ */}
      {activeTab === 'holidays' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Holiday List Management</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Global holidays apply to all staff members
              </p>
            </div>
            <button
              onClick={() => { setIsAdding(true); setEditingId(null) }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={14} />Add Holiday
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/40">
                  {['SL','Date','Holiday Name','Actions'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide
                        ${i === 3 ? 'text-right' : 'text-left'}`}
                    >{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Add row */}
                {isAdding && (
                  <tr className="border-t border-gray-100 dark:border-gray-700 bg-indigo-50/50 dark:bg-indigo-900/10">
                    <td className="px-4 py-2.5 text-gray-400 text-xs">—</td>
                    <td className="px-4 py-2.5">
                      <input
                        type="date"
                        value={newHol.date}
                        onChange={e => setNewHol(p => ({ ...p, date: e.target.value }))}
                        className={inlineInputCls}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        placeholder="Holiday name…"
                        value={newHol.name}
                        onChange={e => setNewHol(p => ({ ...p, name: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddHoliday()}
                        className={`${inlineInputCls} w-full`}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleAddHoliday}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          <Save size={11} />Save
                        </button>
                        <button
                          onClick={() => { setIsAdding(false); setNewHol({ date: '', name: '' }) }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors"
                        >
                          <X size={11} />Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Empty state */}
                {globalHolidays.length === 0 && !isAdding && (
                  <tr>
                    <td colSpan={4} className="px-4 py-14 text-center text-gray-400 dark:text-gray-500">
                      <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium text-sm">No holidays added yet</p>
                      <p className="text-xs mt-1">Click "Add Holiday" to get started</p>
                    </td>
                  </tr>
                )}

                {/* Holiday rows */}
                {[...globalHolidays]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((hol, idx) => (
                    <tr
                      key={hol.id}
                      className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{idx + 1}</td>

                      {editingId === hol.id ? (
                        <>
                          <td className="px-4 py-2">
                            <input
                              type="date"
                              value={editData.date}
                              onChange={e => setEditData(p => ({ ...p, date: e.target.value }))}
                              className={inlineInputCls}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={editData.name}
                              onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                              className={`${inlineInputCls} w-full`}
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={handleSaveEdit}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                              >
                                <Save size={11} />Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors"
                              >
                                <X size={11} />Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {formatDate(hol.date)}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{hol.name}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleStartEdit(hol)}
                                title="Edit"
                                className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteHoliday(hol.id)}
                                title="Delete"
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {globalHolidays.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/20">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {globalHolidays.length} holiday{globalHolidays.length !== 1 ? 's' : ''} in the list
              </p>
            </div>
          )}
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          .print-hide { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-area { page-break-inside: avoid; }
          * { box-shadow: none !important; }
          input, select, textarea { border: 1px solid #ccc !important; }
        }
      `}</style>
    </div>
  )
}
