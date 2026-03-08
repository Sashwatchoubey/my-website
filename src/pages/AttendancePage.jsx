import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  CalendarDays, Users, Plus, Trash2, Pencil, Save, Printer, X,
  ChevronRight, CheckCircle, AlertCircle, Clock, Calendar,
  Download, Upload, FileSpreadsheet,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const LS_STAFF      = 'aiilsg_staff'
const LS_HOLIDAYS   = 'aiilsg_holidays'
const LS_ATTENDANCE = 'aiilsg_attendance'

const STATUS_OPTIONS = [
  'PRESENT', 'REST DAY', 'HOLIDAY', 'CASUAL LEAVE',
  'SICK LEAVE', 'UNPAID LEAVE', 'HALF DAY', 'ABSENT', 'LOCAL HOLIDAY',
]

const SAMPLE_HOLIDAYS = [
  { id: 1, date: '2026-01-01', name: 'New Year\'s Day' },
  { id: 2, date: '2026-01-26', name: 'Republic Day' },
  { id: 3, date: '2026-08-15', name: 'Independence Day' },
  { id: 4, date: '2026-10-02', name: 'Gandhi Jayanti' },
  { id: 5, date: '2026-12-25', name: 'Christmas Day' },
]

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all'
const selectCls = inputCls + ' cursor-pointer'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDaysInMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

function getDateString(yearMonth, day) {
  const [year, month] = yearMonth.split('-')
  return `${year}-${month}-${String(day).padStart(2, '0')}`
}

function getDayName(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
}

function getDayShort(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}-${m}-${y}`
}

function calcTotalHours(clockIn, clockOut) {
  if (!clockIn || !clockOut || clockIn === '00:00' || clockOut === '00:00') return '0:00'
  const [ih, im] = clockIn.split(':').map(Number)
  const [oh, om] = clockOut.split(':').map(Number)
  let totalMins = (oh * 60 + om) - (ih * 60 + im)
  if (totalMins <= 0) return '0:00'
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

function getSaturdayOccurrence(dateStr) {
  // Returns 1 for the 1st Saturday of the month, 2 for 2nd, etc.
  const date = new Date(dateStr + 'T00:00:00')
  const year  = date.getFullYear()
  const month = date.getMonth()
  const dayOfMonth = date.getDate()
  let satCount = 0
  for (let d = 1; d <= dayOfMonth; d++) {
    if (new Date(year, month, d).getDay() === 6) satCount++
  }
  return satCount
}

function isRestDay(dateStr, workingDays, customWorkingDays) {
  const day = getDayShort(dateStr) // MON TUE WED THU FRI SAT SUN
  if (workingDays === 'Mon-Fri') return day === 'SAT' || day === 'SUN'
  if (workingDays === 'Mon-Sat') return day === 'SUN'
  if (workingDays === 'Mon-Sat-2nd4thOff') {
    if (day === 'SUN') return true
    if (day === 'SAT') {
      const occ = getSaturdayOccurrence(dateStr)
      return occ === 2 || occ === 4
    }
    return false
  }
  if (workingDays === 'Mon-Sat-1st3rdOff') {
    if (day === 'SUN') return true
    if (day === 'SAT') {
      const occ = getSaturdayOccurrence(dateStr)
      return occ === 1 || occ === 3
    }
    return false
  }
  if (workingDays === 'Custom') {
    const map = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' }
    return !(customWorkingDays || []).includes(map[day])
  }
  return day === 'SAT' || day === 'SUN'
}

function getShiftLabel(workingDays) {
  if (workingDays === 'Mon-Sat') return 'MONDAY TO SATURDAY'
  if (workingDays === 'Mon-Sat-2nd4thOff') return 'MON TO SAT (2ND & 4TH SATURDAY OFF)'
  if (workingDays === 'Mon-Sat-1st3rdOff') return 'MON TO SAT (1ST & 3RD SATURDAY OFF)'
  if (workingDays === 'Custom') return 'CUSTOM SCHEDULE'
  return 'MONDAY TO FRIDAY'
}

function monthLabel(yearMonth) {
  if (!yearMonth) return ''
  const [y, m] = yearMonth.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
}

function sumHours(rows) {
  let total = 0
  rows.forEach(r => {
    const [h, m] = calcTotalHours(r.clockIn, r.clockOut).split(':').map(Number)
    total += h * 60 + m
  })
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium
          ${t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {t.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ─── Holiday Modal ─────────────────────────────────────────────────────────────
function HolidayModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { date: '', name: '' })
  function handleSubmit(e) {
    e.preventDefault()
    if (!form.date || !form.name.trim()) return
    onSave(form)
  }
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {initial ? 'Edit Holiday' : 'Add Holiday'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Holiday Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Republic Day"
              className={inputCls}
              required
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors">
              {initial ? 'Save Changes' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('attendance')
  const [toasts, setToasts] = useState([])

  // ── Attendance state ──
  const [staffList, setStaffList] = useState([])
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [reportData, setReportData] = useState(null) // null = not generated yet

  // ── Holiday state ──
  const [holidays, setHolidays] = useState([])
  const [holidayModal, setHolidayModal] = useState(null) // null | 'add' | holiday-object

  // ── Bulk upload state ──
  const [bulkMonth, setBulkMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [uploadSummary, setUploadSummary] = useState(null) // null | { pending, updatedData }
  const fileInputRef = useRef(null)

  // ── Load from localStorage ──
  useEffect(() => {
    const raw = localStorage.getItem(LS_STAFF)
    setStaffList(raw ? JSON.parse(raw) : [])

    const rawH = localStorage.getItem(LS_HOLIDAYS)
    if (rawH) {
      setHolidays(JSON.parse(rawH))
    } else {
      setHolidays(SAMPLE_HOLIDAYS)
      localStorage.setItem(LS_HOLIDAYS, JSON.stringify(SAMPLE_HOLIDAYS))
    }
  }, [])

  function toast(message, type = 'success') {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  // ─── Attendance Tab Handlers ───────────────────────────────────────────────

  const selectedStaff = useMemo(
    () => staffList.find(s => String(s.id) === String(selectedStaffId)) || null,
    [staffList, selectedStaffId]
  )

  function buildDefaultRows(staff, yearMonth, publicHolidays) {
    const days = getDaysInMonth(yearMonth)
    const wd = staff.workingDays || 'Mon-Fri'
    const custom = staff.customWorkingDays || []
    const localHols = (staff.localHolidays || []).map(h => h.date)
    const pubHolDates = publicHolidays.map(h => h.date)
    const shiftStart = staff.shiftStart || '10:00'
    const shiftEnd = staff.shiftEnd || '18:00'

    return Array.from({ length: days }, (_, i) => {
      const day = i + 1
      const date = getDateString(yearMonth, day)
      let status
      if (isRestDay(date, wd, custom)) {
        status = 'REST DAY'
      } else if (pubHolDates.includes(date)) {
        status = 'HOLIDAY'
      } else if (localHols.includes(date)) {
        status = 'LOCAL HOLIDAY'
      } else {
        status = 'PRESENT'
      }
      const isWorking = status === 'PRESENT' || status === 'HALF DAY'
      return {
        date,
        clockIn:  isWorking ? shiftStart : '00:00',
        clockOut: isWorking ? shiftEnd   : '00:00',
        status,
      }
    })
  }

  const handleGenerate = useCallback(() => {
    if (!selectedStaffId || !selectedMonth) {
      toast('Please select a staff member and month.', 'error')
      return
    }
    const staff = staffList.find(s => String(s.id) === String(selectedStaffId))
    if (!staff) return

    const key = `${selectedStaffId}_${selectedMonth}`
    const raw = localStorage.getItem(LS_ATTENDANCE)
    const allData = raw ? JSON.parse(raw) : {}
    const existing = allData[key]

    if (existing) {
      setReportData(existing)
    } else {
      setReportData({
        staffId: staff.id,
        month: selectedMonth,
        ulbName: '',
        project: staff.assignedProject || '',
        remarks: '',
        rows: buildDefaultRows(staff, selectedMonth, holidays),
      })
    }
  }, [selectedStaffId, selectedMonth, staffList, holidays])

  const handleSave = useCallback(() => {
    if (!reportData) return
    const key = `${reportData.staffId}_${reportData.month}`
    const raw = localStorage.getItem(LS_ATTENDANCE)
    const allData = raw ? JSON.parse(raw) : {}
    allData[key] = reportData
    localStorage.setItem(LS_ATTENDANCE, JSON.stringify(allData))
    toast('Attendance saved successfully!')
  }, [reportData])

  const handlePrint = useCallback(() => window.print(), [])

  const updateRow = useCallback((idx, field, value) => {
    setReportData(prev => {
      if (!prev) return prev
      const rows = prev.rows.map((r, i) => {
        if (i !== idx) return r
        const updated = { ...r, [field]: value }
        if (field === 'status') {
          const staff = staffList.find(s => String(s.id) === String(prev.staffId))
          const shiftStart = staff?.shiftStart || '10:00'
          const shiftEnd   = staff?.shiftEnd   || '18:00'
          const isWorking  = value === 'PRESENT' || value === 'HALF DAY'
          if (!isWorking) {
            updated.clockIn  = '00:00'
            updated.clockOut = '00:00'
          } else if (r.clockIn === '00:00' && r.clockOut === '00:00') {
            updated.clockIn  = shiftStart
            updated.clockOut = shiftEnd
          }
        }
        return updated
      })
      return { ...prev, rows }
    })
  }, [staffList])

  // ─── Summary Calculations ──────────────────────────────────────────────────
  const summary = useMemo(() => {
    if (!reportData) return null
    const counts = {}
    STATUS_OPTIONS.forEach(s => { counts[s] = 0 })
    reportData.rows.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++ })
    const totalDays = reportData.rows.length
    const restDays  = counts['REST DAY']
    const holidays  = counts['HOLIDAY']
    const localHols = counts['LOCAL HOLIDAY']
    const totalWorking = totalDays - restDays - holidays - localHols
    const availableCL  = 1
    const remainingCL  = Math.max(0, availableCL - counts['CASUAL LEAVE'])
    return { counts, totalWorking, availableCL, remainingCL }
  }, [reportData])

  const holidaysInMonth = useMemo(() => {
    if (!reportData) return []
    const prefix = reportData.month
    return holidays.filter(h => h.date.startsWith(prefix))
  }, [reportData, holidays])

  // ─── Holiday Tab Handlers ──────────────────────────────────────────────────
  function saveHolidays(updated) {
    setHolidays(updated)
    localStorage.setItem(LS_HOLIDAYS, JSON.stringify(updated))
  }

  function handleAddHoliday(form) {
    const newH = { id: Date.now(), date: form.date, name: form.name.trim() }
    const updated = [...holidays, newH].sort((a, b) => a.date.localeCompare(b.date))
    saveHolidays(updated)
    setHolidayModal(null)
    toast('Holiday added!')
  }

  function handleEditHoliday(form) {
    const updated = holidays.map(h =>
      h.id === holidayModal.id ? { ...h, date: form.date, name: form.name.trim() } : h
    ).sort((a, b) => a.date.localeCompare(b.date))
    saveHolidays(updated)
    setHolidayModal(null)
    toast('Holiday updated!')
  }

  function handleDeleteHoliday(id) {
    const updated = holidays.filter(h => h.id !== id)
    saveHolidays(updated)
    toast('Holiday deleted.')
  }

  // ─── Bulk Upload Handlers ──────────────────────────────────────────────────

  function handleDownloadTemplate() {
    if (staffList.length === 0) {
      toast('No staff members found. Please add staff first.', 'error')
      return
    }
    const [year, month] = bulkMonth.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    const rows = ['Employee ID,Employee Name,Date (DD-MM-YYYY),Clock In (HH:MM),Clock Out (HH:MM)']
    staffList.forEach(staff => {
      for (let d = 1; d <= daysInMonth; d++) {
        const dd = String(d).padStart(2, '0')
        const mm = String(month).padStart(2, '0')
        rows.push(`${staff.employeeID || staff.id},${staff.fullName},${dd}-${mm}-${year},,`)
      }
    })
    const csv = rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Attendance_Template_${String(month).padStart(2,'0')}_${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('Template downloaded!')
  }

  function handleUploadCSV(e) {
    const file = e.target.files[0]
    if (!e.target.files || !file) return
    // Reset the input so the same file can be re-uploaded if needed
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const text = ev.target.result
        const lines = text.split(/\r?\n/).filter(l => l.trim())
        if (lines.length < 2) {
          toast('CSV file is empty or has no data rows.', 'error')
          return
        }
        // Skip header row
        const dataRows = lines.slice(1)
        const raw = localStorage.getItem(LS_ATTENDANCE)
        const allData = raw ? JSON.parse(raw) : {}
        let updatedCount = 0
        let errorRows = 0

        dataRows.forEach(line => {
          // Robust CSV field parse: handles fields optionally wrapped in double-quotes
          const cols = []
          let current = ''
          let inQuote = false
          for (let ci = 0; ci < line.length; ci++) {
            const ch = line[ci]
            if (ch === '"') { inQuote = !inQuote }
            else if (ch === ',' && !inQuote) { cols.push(current.trim()); current = '' }
            else { current += ch }
          }
          cols.push(current.trim())

          if (cols.length < 5) { errorRows++; return }
          const [empId, , dateDMY, clockIn, clockOut] = cols
          if (!empId || !dateDMY) { errorRows++; return }

          // Parse date DD-MM-YYYY → YYYY-MM-DD
          const parts = dateDMY.split('-')
          if (parts.length !== 3) { errorRows++; return }
          const [dd, mm, yyyy] = parts
          const dateISO = `${yyyy}-${mm}-${dd}`
          const yearMonth = `${yyyy}-${mm}`

          // Find matching staff by employeeID or id
          const staff = staffList.find(s =>
            String(s.employeeID) === String(empId) || String(s.id) === String(empId)
          )
          if (!staff) { errorRows++; return }

          const key = `${staff.id}_${yearMonth}`
          if (!allData[key]) {
            // Build default rows if not yet generated for this month
            allData[key] = {
              staffId: staff.id,
              month: yearMonth,
              ulbName: '',
              project: staff.assignedProject || '',
              remarks: '',
              rows: buildDefaultRows(staff, yearMonth, holidays),
            }
          }

          const rowIdx = allData[key].rows.findIndex(r => r.date === dateISO)
          if (rowIdx === -1) return

          // Only update times if values are provided and match HH:MM format
          const validTime = t => t && /^\d{1,2}:\d{2}$/.test(t)
          const hasIn  = validTime(clockIn)
          const hasOut = validTime(clockOut)
          if (hasIn || hasOut) {
            const existing = allData[key].rows[rowIdx]
            allData[key].rows[rowIdx] = {
              ...existing,
              ...(hasIn  ? { clockIn }  : {}),
              ...(hasOut ? { clockOut } : {}),
            }
            updatedCount++
          }
        })

        setUploadSummary({ pending: allData, updatedCount, errorRows })
      } catch {
        toast('Failed to parse CSV file. Please check the format.', 'error')
      }
    }
    reader.readAsText(file)
  }

  function handleConfirmUpload() {
    if (!uploadSummary) return
    localStorage.setItem(LS_ATTENDANCE, JSON.stringify(uploadSummary.pending))
    toast(`Upload confirmed! ${uploadSummary.updatedCount} record(s) updated.`)
    setUploadSummary(null)
    // Refresh current report view if open
    if (reportData) {
      const key = `${reportData.staffId}_${reportData.month}`
      const existing = uploadSummary.pending[key]
      if (existing) setReportData(existing)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toast toasts={toasts} />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <CalendarDays size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Attendance Management</h1>
              <p className="text-indigo-200 text-xs mt-0.5">Monthly attendance reports & holiday calendar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="max-w-7xl mx-auto flex gap-1 pt-2">
          {[
            { key: 'attendance', label: 'Attendance', icon: <CalendarDays size={15} /> },
            { key: 'holidays',   label: 'Holidays',   icon: <Calendar size={15} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors
                ${activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'attendance' ? (
          <AttendanceTab
            staffList={staffList}
            selectedStaffId={selectedStaffId}
            setSelectedStaffId={id => { setSelectedStaffId(id); setReportData(null) }}
            selectedMonth={selectedMonth}
            setSelectedMonth={m => { setSelectedMonth(m); setReportData(null) }}
            reportData={reportData}
            setReportData={setReportData}
            selectedStaff={selectedStaff}
            summary={summary}
            holidaysInMonth={holidaysInMonth}
            holidays={holidays}
            onGenerate={handleGenerate}
            onSave={handleSave}
            onPrint={handlePrint}
            updateRow={updateRow}
            bulkMonth={bulkMonth}
            setBulkMonth={setBulkMonth}
            uploadSummary={uploadSummary}
            setUploadSummary={setUploadSummary}
            fileInputRef={fileInputRef}
            onDownloadTemplate={handleDownloadTemplate}
            onUploadCSV={handleUploadCSV}
            onConfirmUpload={handleConfirmUpload}
          />
        ) : (
          <HolidaysTab
            holidays={holidays}
            onAdd={() => setHolidayModal('add')}
            onEdit={h => setHolidayModal(h)}
            onDelete={handleDeleteHoliday}
          />
        )}
      </div>

      {/* Holiday Modal */}
      {holidayModal && (
        <HolidayModal
          initial={holidayModal === 'add' ? null : holidayModal}
          onSave={holidayModal === 'add' ? handleAddHoliday : handleEditHoliday}
          onClose={() => setHolidayModal(null)}
        />
      )}
    </div>
  )
}

// ─── Attendance Tab ────────────────────────────────────────────────────────────
function AttendanceTab({
  staffList, selectedStaffId, setSelectedStaffId,
  selectedMonth, setSelectedMonth,
  reportData, setReportData,
  selectedStaff, summary,
  holidaysInMonth, holidays,
  onGenerate, onSave, onPrint, updateRow,
  bulkMonth, setBulkMonth,
  uploadSummary, setUploadSummary,
  fileInputRef,
  onDownloadTemplate, onUploadCSV, onConfirmUpload,
}) {
  return (
    <div className="space-y-5">
      {/* Controls Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Select Staff
            </label>
            <select
              value={selectedStaffId}
              onChange={e => setSelectedStaffId(e.target.value)}
              className={selectCls}
            >
              <option value="">— Choose Staff Member —</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} — {s.designation || ''}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className={inputCls}
            />
          </div>

          <button
            onClick={onGenerate}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <CalendarDays size={15} />
            Generate / Load
          </button>

          {reportData && (
            <>
              <button
                onClick={onSave}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                <Save size={15} />
                Save
              </button>
              <button
                onClick={onPrint}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors shadow-sm"
              >
                <Printer size={15} />
                Print
              </button>
            </>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!reportData && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <CalendarDays size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-base font-semibold text-gray-500 dark:text-gray-400">No Report Generated</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Select a staff member and month, then click "Generate / Load".
          </p>
        </div>
      )}

      {/* Report */}
      {reportData && selectedStaff && (
        <div className="attendance-print-area">
          <ReportView
            reportData={reportData}
            setReportData={setReportData}
            staff={selectedStaff}
            summary={summary}
            holidaysInMonth={holidaysInMonth}
            updateRow={updateRow}
          />
        </div>
      )}

      {/* ── Bulk Upload Section ── */}
      <div className="no-print bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/40 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-white" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Bulk Upload — Clock In / Clock Out Data
          </h3>
        </div>

        <div className="p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Download the CSV template, fill in the Clock In &amp; Clock Out times in Excel or any
            spreadsheet app, then upload it here to update all staff attendance at once.
          </p>

          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div className="min-w-[160px]">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Month
              </label>
              <input
                type="month"
                value={bulkMonth}
                onChange={e => setBulkMonth(e.target.value)}
                className={inputCls}
              />
            </div>

            <button
              onClick={onDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-colors"
            >
              <Download size={15} />
              Download Template
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-colors"
            >
              <Upload size={15} />
              Upload CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onUploadCSV}
            />
          </div>

          {/* Upload Preview / Confirm */}
          {uploadSummary && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                    ✅ Preview ready — {uploadSummary.updatedCount} clock-in/out record(s) found
                    {uploadSummary.errorRows > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 ml-2">
                        ({uploadSummary.errorRows} row(s) skipped)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Click Confirm to save all updates to localStorage. Existing status values are preserved.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={onConfirmUpload}
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setUploadSummary(null)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Report View ───────────────────────────────────────────────────────────────
function ReportView({ reportData, setReportData, staff, summary, holidaysInMonth, updateRow }) {
  const shiftLabel = getShiftLabel(staff.workingDays || 'Mon-Fri')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Report Header */}
      <div className="bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900 px-6 py-5 text-center print-header">
        <p className="text-xs font-semibold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-0.5">
          Monthly Attendance Report
        </p>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          All India Institute of Local Self Government
        </h2>
        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mt-1">
          [ MONTH : {monthLabel(reportData.month)} ]
        </p>
      </div>

      {/* Employee Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border-b border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
        {[
          ['EMPLOYEE NAME',  staff.fullName],
          ['DESIGNATION',    staff.designation || '—'],
        ].map(([label, val]) => (
          <div key={label} className="flex items-start gap-3 bg-white dark:bg-gray-800 px-5 py-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-36 shrink-0 pt-0.5">{label}</span>
            <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 mt-0.5 shrink-0" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{val}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-5 py-3">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-36 shrink-0">ULB NAME</span>
          <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 shrink-0" />
          <input
            type="text"
            value={reportData.ulbName}
            onChange={e => setReportData(prev => ({ ...prev, ulbName: e.target.value }))}
            placeholder="Enter ULB Name"
            className="text-sm font-semibold text-gray-800 dark:text-gray-100 bg-transparent border-none outline-none focus:ring-0 w-full placeholder-gray-300 dark:placeholder-gray-600"
          />
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-5 py-3">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-36 shrink-0">PROJECT</span>
          <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 shrink-0" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{reportData.project || '—'}</span>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-5 py-3 sm:col-span-2">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-36 shrink-0">SHIFT NAME</span>
          <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 shrink-0" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{shiftLabel}</span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-indigo-600 text-white">
              {['SL NO.', 'DATE', 'DAY', 'CLOCK IN', 'CLOCK OUT', 'TOTAL HOUR', 'STATUS'].map(h => (
                <th key={h} className="px-3 py-2.5 text-center font-bold tracking-wide whitespace-nowrap border border-indigo-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.rows.map((row, idx) => {
              const isOdd      = idx % 2 === 0
              const isRest     = row.status === 'REST DAY'
              const isHoliday  = row.status === 'HOLIDAY' || row.status === 'LOCAL HOLIDAY'
              const isLeave    = ['CASUAL LEAVE', 'SICK LEAVE', 'UNPAID LEAVE'].includes(row.status)
              const isAbsent   = row.status === 'ABSENT'
              const totalHour  = (isRest || isHoliday) ? '0:00' : calcTotalHours(row.clockIn, row.clockOut)

              const rowBg = isRest
                ? 'bg-gray-100 dark:bg-gray-700/60'
                : isHoliday
                  ? 'bg-amber-50 dark:bg-amber-900/20'
                  : isLeave
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : isAbsent
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : isOdd
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-gray-50/60 dark:bg-gray-750'

              return (
                <tr key={row.date} className={`${rowBg} border-b border-gray-100 dark:border-gray-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors`}>
                  <td className="px-3 py-1.5 text-center font-medium text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-1.5 text-center font-medium text-gray-700 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700 whitespace-nowrap">
                    {formatDateDisplay(row.date)}
                  </td>
                  <td className="px-3 py-1.5 text-center font-medium text-gray-600 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700">
                    {getDayName(row.date)}
                  </td>
                  <td className="px-2 py-1 text-center border-r border-gray-100 dark:border-gray-700">
                    <input
                      type="time"
                      value={row.clockIn}
                      onChange={e => updateRow(idx, 'clockIn', e.target.value)}
                      disabled={isRest || isHoliday}
                      className="text-xs text-center bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-1.5 py-1 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 w-24"
                    />
                  </td>
                  <td className="px-2 py-1 text-center border-r border-gray-100 dark:border-gray-700">
                    <input
                      type="time"
                      value={row.clockOut}
                      onChange={e => updateRow(idx, 'clockOut', e.target.value)}
                      disabled={isRest || isHoliday}
                      className="text-xs text-center bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-1.5 py-1 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 w-24"
                    />
                  </td>
                  <td className="px-3 py-1.5 text-center font-mono font-semibold text-gray-700 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700">
                    {totalHour}
                  </td>
                  <td className="px-2 py-1 text-center">
                    <select
                      value={row.status}
                      onChange={e => updateRow(idx, 'status', e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer transition-colors
                        ${row.status === 'PRESENT'       ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                        : row.status === 'REST DAY'      ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-500'
                        : row.status === 'HOLIDAY'       ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
                        : row.status === 'LOCAL HOLIDAY' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700'
                        : row.status === 'ABSENT'        ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                        : row.status === 'HALF DAY'      ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700'
                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'}`}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}

            {/* Subtotal Row */}
            <tr className="bg-indigo-600 text-white font-bold">
              <td colSpan={5} className="px-4 py-2.5 text-right text-xs tracking-wide border-r border-indigo-500">
                EMPLOYEE SUBTOTAL
              </td>
              <td className="px-3 py-2.5 text-center text-xs font-mono border-r border-indigo-500">
                {sumHours(reportData.rows.filter(r => r.status !== 'REST DAY' && r.status !== 'HOLIDAY' && r.status !== 'LOCAL HOLIDAY'))}
              </td>
              <td className="px-3 py-2.5 text-center text-xs">
                {summary?.counts['PRESENT'] ?? 0} PRESENT
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary + Holiday List */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-gray-100 dark:border-gray-700">
          {/* Attendance Summary */}
          <div className="border-r-0 lg:border-r border-gray-100 dark:border-gray-700">
            <div className="bg-indigo-600 px-5 py-2.5">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">Attendance Summary</h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-5 py-2 text-left font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-2 text-center font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['TOTAL PRESENT DAYS',  summary.counts['PRESENT'],       'text-emerald-600 dark:text-emerald-400'],
                  ['TOTAL HOLIDAYS',      summary.counts['HOLIDAY'],        'text-amber-600 dark:text-amber-400'],
                  ['TOTAL REST DAYS',     summary.counts['REST DAY'],       'text-gray-500 dark:text-gray-400'],
                  ['CASUAL LEAVE',        summary.counts['CASUAL LEAVE'],   'text-blue-600 dark:text-blue-400'],
                  ['SICK LEAVE',          summary.counts['SICK LEAVE'],     'text-blue-600 dark:text-blue-400'],
                  ['UNPAID LEAVE',        summary.counts['UNPAID LEAVE'],   'text-red-600 dark:text-red-400'],
                  ['HALF DAY',            summary.counts['HALF DAY'],       'text-purple-600 dark:text-purple-400'],
                  ['ABSENT',              summary.counts['ABSENT'],         'text-red-600 dark:text-red-400'],
                  ['LOCAL HOLIDAY',       summary.counts['LOCAL HOLIDAY'],  'text-orange-600 dark:text-orange-400'],
                  ['AVAILABLE CL',        summary.availableCL,              'text-indigo-600 dark:text-indigo-400'],
                  ['REMAINING CL',        summary.remainingCL,              'text-indigo-600 dark:text-indigo-400'],
                  ['TOTAL WORKING DAYS',  summary.totalWorking,             'text-gray-800 dark:text-white font-bold'],
                ].map(([label, val, cls], i) => (
                  <tr key={label} className={`border-b border-gray-100 dark:border-gray-700 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/30'}`}>
                    <td className="px-5 py-2 font-medium text-gray-700 dark:text-gray-300">{label}</td>
                    <td className={`px-5 py-2 text-center font-bold ${cls}`}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Public Holidays List */}
          <div>
            <div className="bg-indigo-600 px-5 py-2.5">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">Public Holidays This Month</h3>
            </div>
            {holidaysInMonth.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                No public holidays this month.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-5 py-2 text-left font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Date</th>
                    <th className="px-5 py-2 text-left font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Holiday Name</th>
                  </tr>
                </thead>
                <tbody>
                  {holidaysInMonth.map((h, i) => (
                    <tr key={h.id} className={`border-b border-gray-100 dark:border-gray-700 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/30'}`}>
                      <td className="px-5 py-2 font-mono font-semibold text-amber-600 dark:text-amber-400">
                        {formatDateDisplay(h.date).slice(0, 5)}
                      </td>
                      <td className="px-5 py-2 font-medium text-gray-700 dark:text-gray-300">{h.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Footer / Remarks + Signatures */}
      <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-5 space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
            Remarks
          </label>
          <textarea
            rows={2}
            value={reportData.remarks}
            onChange={e => setReportData(prev => ({ ...prev, remarks: e.target.value }))}
            placeholder="Enter remarks if any..."
            className={inputCls + ' resize-none'}
          />
        </div>

        <div className="grid grid-cols-2 gap-10 pt-2">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
              Checked & Prepared By
            </p>
            <div className="h-10 border-b border-dashed border-gray-300 dark:border-gray-600" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 pt-1">{staff.fullName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{staff.designation}</p>
            {reportData.ulbName && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{reportData.ulbName}</p>
            )}
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
              Authorized Signatory
            </p>
            <div className="h-10 border-b border-dashed border-gray-300 dark:border-gray-600" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 pt-1">
              {reportData.project || reportData.ulbName || 'Project / ULB'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Holidays Tab ──────────────────────────────────────────────────────────────
function HolidaysTab({ holidays, onAdd, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(null)

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Public Holiday Calendar</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{holidays.length} holidays configured</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} />
          Add Holiday
        </button>
      </div>

      {/* Holiday Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {holidays.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No holidays added yet.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click "Add Holiday" to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Holiday Name</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Day</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h, i) => (
                <tr key={h.id} className={`border-b border-gray-100 dark:border-gray-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40 dark:bg-gray-700/20'}`}>
                  <td className="px-6 py-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatDateDisplay(h.date)}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-500 shrink-0" />
                      {h.name}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center text-gray-500 dark:text-gray-400">
                    {getDayName(h.date)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(h)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {confirmDelete === h.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { onDelete(h.id); setConfirmDelete(null) }}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(h.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 px-1">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Public holiday (applies to all staff)</span>
        <span className="flex items-center gap-1.5"><Clock size={11} />Dates shown as DD-MM-YYYY</span>
      </div>
    </div>
  )
}
