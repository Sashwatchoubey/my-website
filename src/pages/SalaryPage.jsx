import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  IndianRupee, Users, Printer, Save, Eye, Trash2, Plus, X,
  CheckCircle, AlertCircle, Calculator, FileText, Calendar,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const LS_STAFF      = 'aiilsg_staff'
const LS_ATTENDANCE = 'aiilsg_attendance'
const LS_SALARY     = 'aiilsg_salary'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const SAMPLE_STAFF = [
  {
    id: 1, fullName: 'Dr. Subrata Banerjee', designation: 'Centre Director',
    department: 'Management', employeeID: 'AIILSG-001',
    basicSalary: 60000, hra: 18000, da: 9000, conveyance: 2000,
    medical: 1250, specialAllowance: 3000, otherAllowances: 1750,
    pfDeduction: 7200, esiDeduction: 0, professionalTax: 200, tds: 3000, otherDeductions: 0,
    rosterType: 'Monday to Friday',
    assignedProject: 'Urban Local Body Staff Training', projectSiteLocation: 'Kolkata',
    bankName: 'SBI', accountNumber: '30012345678', ifscCode: 'SBIN0004631', branchName: 'Lake Town',
  },
  {
    id: 2, fullName: 'Smt. Priya Ghosh', designation: 'Senior Project Manager',
    department: 'Projects', employeeID: 'AIILSG-002',
    basicSalary: 48000, hra: 14400, da: 7200, conveyance: 1600,
    medical: 1250, specialAllowance: 1800, otherAllowances: 750,
    pfDeduction: 5760, esiDeduction: 0, professionalTax: 200, tds: 1500, otherDeductions: 0,
    rosterType: 'Monday to Friday',
    assignedProject: 'Kolkata Smart City Mission', projectSiteLocation: 'Kolkata',
    bankName: 'HDFC Bank', accountNumber: '50100234567890', ifscCode: 'HDFC0001234', branchName: 'Ballygunge',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtInt = (n) =>
  Number(n || 0).toLocaleString('en-IN')

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

/** Parse a numeric value safely */
const num = (v) => parseFloat(v) || 0

/** Build a salary slip from staff + attendance data */
function calculateSlip(staff, year, month) {
  // AttendancePage stores keys with 1-based month (selectedMonth + 1)
  const attKey = `${staff.id}_${year}_${month + 1}`
  const raw    = localStorage.getItem(LS_ATTENDANCE)
  const allAtt = raw ? JSON.parse(raw) : {}
  const attData = allAtt[attKey] || null

  // --- Earnings ---
  const earnings = {
    basicSalary:      num(staff.basicSalary),
    hra:              num(staff.hra),
    da:               num(staff.da),
    conveyance:       num(staff.conveyance),
    medical:          num(staff.medical),
    specialAllowance: num(staff.specialAllowance),
    otherAllowances:  num(staff.otherAllowances),
  }
  const gross = Object.values(earnings).reduce((s, v) => s + v, 0)

  // --- Attendance ---
  let workingDays, presentDays, absentDays, halfDays, casualLeave, sickLeave, unpaidLeave, holidays, restDays

  if (attData && attData.rows && attData.rows.length > 0) {
    const rows = attData.rows
    restDays     = rows.filter(r => r.status === 'REST DAY').length
    holidays     = rows.filter(r => r.status === 'HOLIDAY' || r.status === 'LOCAL HOLIDAY').length
    absentDays   = rows.filter(r => r.status === 'ABSENT').length
    halfDays     = rows.filter(r => r.status === 'HALF DAY').length
    casualLeave  = rows.filter(r => r.status === 'CASUAL LEAVE').length
    sickLeave    = rows.filter(r => r.status === 'SICK LEAVE').length
    unpaidLeave  = rows.filter(r => r.status === 'UNPAID LEAVE').length
    workingDays  = daysInMonth(year, month) - restDays - holidays
    presentDays  = rows.filter(r =>
      r.status === 'PRESENT' || r.status === 'CASUAL LEAVE' || r.status === 'SICK LEAVE',
    ).length + halfDays * 0.5
  } else {
    const isMF  = (staff.rosterType || '').toLowerCase().includes('friday') &&
                  !(staff.rosterType || '').toLowerCase().includes('saturday')
    workingDays = isMF ? 22 : 26
    presentDays = workingDays
    absentDays  = 0
    halfDays    = 0
    casualLeave = 0
    sickLeave   = 0
    unpaidLeave = 0
    holidays    = 0
    restDays    = 0
  }

  const effectiveAbsent   = absentDays + halfDays * 0.5 + unpaidLeave
  const perDayRate        = workingDays > 0 ? gross / workingDays : 0
  const absentDeduction   = Math.round(perDayRate * effectiveAbsent)

  const deductions = {
    pf:              num(staff.pfDeduction),
    esi:             num(staff.esiDeduction),
    pt:              num(staff.professionalTax),
    tds:             num(staff.tds),
    otherDeductions: num(staff.otherDeductions),
    absentDeduction,
  }
  const totalDeductions = Object.values(deductions).reduce((s, v) => s + v, 0)
  const netSalary       = gross - totalDeductions

  return {
    staffId:          staff.id,
    staffName:        staff.fullName,
    designation:      staff.designation,
    department:       staff.department,
    employeeID:       staff.employeeID,
    month,
    year,
    bankName:         staff.bankName,
    accountNumber:    staff.accountNumber,
    ifscCode:         staff.ifscCode,
    branchName:       staff.branchName,
    assignedProject:  staff.assignedProject || '',
    projectSiteLocation: staff.projectSiteLocation || '',
    earnings,
    deductions,
    attendance: { workingDays, presentDays, absentDays, halfDays, casualLeave, sickLeave, unpaidLeave, holidays, restDays },
    gross,
    totalDeductions,
    netSalary,
    remarks: '',
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium transition-all
      ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {message}
      <button onClick={onClose} className="ml-1 opacity-80 hover:opacity-100"><X size={15} /></button>
    </div>
  )
}

// ─── Slip Display ─────────────────────────────────────────────────────────────
function SlipDisplay({ slip, remarks, onRemarksChange, readOnly }) {
  if (!slip) return null

  const monthLabel = `${MONTH_NAMES[slip.month]} ${slip.year}`

  return (
    <div className="print-area">
      {/* Letterhead */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-2xl p-6 mb-5 text-white text-center">
        <p className="text-xs uppercase tracking-widest opacity-80 mb-1">All India Institute of Local Self Government</p>
        <h2 className="text-2xl font-bold tracking-wide">WB Centre</h2>
        <div className="mt-3 inline-block bg-white/20 rounded-xl px-6 py-1.5">
          <span className="text-sm font-semibold tracking-widest uppercase">Salary Slip</span>
        </div>
        <p className="mt-2 text-sm opacity-90">Month: {monthLabel}</p>
      </div>

      {/* Employee Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">
          Employee Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {[
            ['Employee Name',  slip.staffName],
            ['Employee ID',    slip.employeeID],
            ['Designation',    slip.designation],
            ['Department',     slip.department],
            ['Project / ULB',  slip.assignedProject],
            ['Location',       slip.projectSiteLocation],
            ['Bank Name',      slip.bankName],
            ['Account No.',    slip.accountNumber],
            ['IFSC Code',      slip.ifscCode],
            ['Branch',         slip.branchName],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="w-32 shrink-0 text-gray-500 dark:text-gray-400 font-medium">{label}:</span>
              <span className="text-gray-800 dark:text-gray-200 font-semibold">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings & Deductions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Earnings */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 overflow-hidden">
          <div className="bg-indigo-100 dark:bg-indigo-900/40 px-5 py-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <IndianRupee size={14} /> Earnings
            </h3>
          </div>
          <div className="px-5 py-4 space-y-2.5 text-sm">
            {[
              ['Basic Salary',        slip.earnings.basicSalary],
              ['HRA',                 slip.earnings.hra],
              ['DA',                  slip.earnings.da],
              ['Conveyance Allowance',slip.earnings.conveyance],
              ['Medical Allowance',   slip.earnings.medical],
              ['Special Allowance',   slip.earnings.specialAllowance],
              ['Other Allowances',    slip.earnings.otherAllowances],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span>{label}</span>
                <span className="font-mono">₹ {fmt(val)}</span>
              </div>
            ))}
            <div className="pt-3 border-t-2 border-indigo-300 dark:border-indigo-600 flex justify-between font-bold text-indigo-800 dark:text-indigo-200">
              <span>GROSS SALARY</span>
              <span className="font-mono">₹ {fmt(slip.gross)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 overflow-hidden">
          <div className="bg-red-100 dark:bg-red-900/40 px-5 py-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-700 dark:text-red-300 flex items-center gap-2">
              <X size={14} /> Deductions
            </h3>
          </div>
          <div className="px-5 py-4 space-y-2.5 text-sm">
            {[
              ['PF Contribution',      slip.deductions.pf],
              ['ESI Contribution',     slip.deductions.esi],
              ['Professional Tax',     slip.deductions.pt],
              ['TDS',                  slip.deductions.tds],
              ['Other Deductions',     slip.deductions.otherDeductions],
              ['Absent / LOP Deduction', slip.deductions.absentDeduction],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span>{label}</span>
                <span className="font-mono">₹ {fmt(val)}</span>
              </div>
            ))}
            <div className="pt-3 border-t-2 border-red-300 dark:border-red-600 flex justify-between font-bold text-red-800 dark:text-red-200">
              <span>TOTAL DEDUCTIONS</span>
              <span className="font-mono">₹ {fmt(slip.totalDeductions)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Salary */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-5 text-center mb-5">
        <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Net Salary Payable</p>
        <p className="text-4xl font-black tracking-tight">₹ {fmtInt(Math.round(slip.netSalary))}</p>
        <p className="text-xs opacity-70 mt-1 font-mono">(Rupees {numberToWords(Math.round(slip.netSalary))} only)</p>
      </div>

      {/* Attendance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
          <Calendar size={14} /> Attendance Summary
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center text-sm">
          {[
            { label: 'Working Days', val: slip.attendance.workingDays,  bg: 'bg-indigo-50 dark:bg-indigo-900/20',   border: 'border-indigo-100 dark:border-indigo-800',   text: 'text-indigo-700 dark:text-indigo-300'   },
            { label: 'Present',      val: slip.attendance.presentDays,  bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300' },
            { label: 'Absent',       val: slip.attendance.absentDays,   bg: 'bg-red-50 dark:bg-red-900/20',         border: 'border-red-100 dark:border-red-800',         text: 'text-red-700 dark:text-red-300'         },
            { label: 'Half Days',    val: slip.attendance.halfDays,     bg: 'bg-orange-50 dark:bg-orange-900/20',   border: 'border-orange-100 dark:border-orange-800',   text: 'text-orange-700 dark:text-orange-300'   },
            { label: 'Casual Leave', val: slip.attendance.casualLeave,  bg: 'bg-blue-50 dark:bg-blue-900/20',       border: 'border-blue-100 dark:border-blue-800',       text: 'text-blue-700 dark:text-blue-300'       },
            { label: 'Sick Leave',   val: slip.attendance.sickLeave,    bg: 'bg-purple-50 dark:bg-purple-900/20',   border: 'border-purple-100 dark:border-purple-800',   text: 'text-purple-700 dark:text-purple-300'   },
            { label: 'Unpaid Leave', val: slip.attendance.unpaidLeave,  bg: 'bg-pink-50 dark:bg-pink-900/20',       border: 'border-pink-100 dark:border-pink-800',       text: 'text-pink-700 dark:text-pink-300'       },
            { label: 'Holidays',     val: slip.attendance.holidays,     bg: 'bg-teal-50 dark:bg-teal-900/20',       border: 'border-teal-100 dark:border-teal-800',       text: 'text-teal-700 dark:text-teal-300'       },
            { label: 'Rest Days',    val: slip.attendance.restDays,     bg: 'bg-gray-100 dark:bg-gray-700/40',      border: 'border-gray-200 dark:border-gray-600',       text: 'text-gray-700 dark:text-gray-300'       },
          ].map(({ label, val, bg, border, text }) => (
            <div key={label} className={`${bg} rounded-xl p-3 border ${border}`}>
              <p className={`text-xl font-bold ${text}`}>{val}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 px-5 py-4 mb-5 text-sm text-gray-700 dark:text-gray-300">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
          <FileText size={14} /> Bank Details
        </h3>
        <p>
          <span className="text-gray-500 dark:text-gray-400">Bank: </span>
          <strong>{slip.bankName}</strong>
          <span className="mx-3 text-gray-300 dark:text-gray-600">|</span>
          <span className="text-gray-500 dark:text-gray-400">A/C: </span>
          <strong>{slip.accountNumber}</strong>
          <span className="mx-3 text-gray-300 dark:text-gray-600">|</span>
          <span className="text-gray-500 dark:text-gray-400">IFSC: </span>
          <strong>{slip.ifscCode}</strong>
          {slip.branchName && (
            <>
              <span className="mx-3 text-gray-300 dark:text-gray-600">|</span>
              <span className="text-gray-500 dark:text-gray-400">Branch: </span>
              <strong>{slip.branchName}</strong>
            </>
          )}
        </p>
      </div>

      {/* Remarks */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-5">
        <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-2">Remarks</label>
        {readOnly ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 min-h-[40px]">{slip.remarks || <span className="italic text-gray-400">—</span>}</p>
        ) : (
          <>
            <textarea
              className="print-hide w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              rows={2}
              placeholder="Optional remarks..."
              value={remarks}
              onChange={e => onRemarksChange(e.target.value)}
            />
            <p className="hidden print:block text-sm text-gray-700 dark:text-gray-300 min-h-[40px]">{remarks}</p>
          </>
        )}
      </div>

      {/* Signature Footer */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex justify-between items-end text-sm text-gray-600 dark:text-gray-400">
          <div className="text-center">
            <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-12 w-44">Prepared By</div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-12 w-44">Authorized Signatory</div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5 italic">
          This is a computer-generated salary slip.
        </p>
      </div>
    </div>
  )
}

// ─── Number to words (Indian system, up to crores) ────────────────────────────
function numberToWords(n) {
  if (n === 0) return 'Zero'
  const ones  = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
                  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
                  'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens  = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const twoDigits = (num) => {
    if (num < 20) return ones[num]
    return (tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')).trim()
  }
  const threeDigits = (num) => {
    if (num < 100) return twoDigits(num)
    return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + twoDigits(num % 100) : '')
  }

  if (n < 0) return 'Minus ' + numberToWords(-n)

  let result = ''
  const crore = Math.floor(n / 10000000); n %= 10000000
  const lakh  = Math.floor(n / 100000);   n %= 100000
  const thou  = Math.floor(n / 1000);     n %= 1000

  if (crore) result += threeDigits(crore) + ' Crore '
  if (lakh)  result += twoDigits(lakh)    + ' Lakh '
  if (thou)  result += twoDigits(thou)    + ' Thousand '
  if (n)     result += threeDigits(n)

  return result.trim()
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SalaryPage() {
  const now = new Date()

  // ── Shared state ──
  const [activeTab,  setActiveTab]  = useState('generate')
  const [staffList,  setStaffList]  = useState([])
  const [savedSlips, setSavedSlips] = useState({})
  const [toast,      setToast]      = useState(null)

  // ── Generate tab ──
  const [selStaffId, setSelStaffId] = useState('')
  const [selMonth,   setSelMonth]   = useState(now.getMonth())
  const [selYear,    setSelYear]    = useState(now.getFullYear())
  const [currentSlip, setCurrentSlip] = useState(null)
  const [remarks,    setRemarks]    = useState('')
  const [viewMode,   setViewMode]   = useState(false)   // true = read-only view from list

  // ── List tab ──
  const [filterStaff, setFilterStaff] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear,  setFilterYear]  = useState('')

  // ── Load staff ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_STAFF)
      const parsed = raw ? JSON.parse(raw) : []
      setStaffList(parsed.length ? parsed : SAMPLE_STAFF)
    } catch {
      setStaffList(SAMPLE_STAFF)
    }
  }, [])

  // ── Load saved slips ──
  const loadSlips = useCallback(() => {
    try {
      const raw = localStorage.getItem(LS_SALARY)
      setSavedSlips(raw ? JSON.parse(raw) : {})
    } catch {
      setSavedSlips({})
    }
  }, [])

  useEffect(() => { loadSlips() }, [loadSlips])

  // ── Toast helper ──
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  // ── Calculate ──
  const handleCalculate = useCallback(() => {
    if (!selStaffId) { showToast('Please select a staff member.', 'error'); return }
    const staff = staffList.find(s => String(s.id) === String(selStaffId))
    if (!staff)     { showToast('Staff not found.', 'error'); return }

    const slip = calculateSlip(staff, selYear, selMonth)
    // Load existing remarks if slip was previously saved
    const key = `${staff.id}_${selYear}_${selMonth}`
    try {
      const raw = localStorage.getItem(LS_SALARY)
      const all = raw ? JSON.parse(raw) : {}
      if (all[key]) slip.remarks = all[key].remarks || ''
    } catch { /* ignore */ }

    setCurrentSlip(slip)
    setRemarks(slip.remarks)
    setViewMode(false)
  }, [selStaffId, selYear, selMonth, staffList, showToast])

  // ── Save ──
  const handleSave = useCallback(() => {
    if (!currentSlip) { showToast('Nothing to save. Please calculate first.', 'error'); return }
    const key = `${currentSlip.staffId}_${currentSlip.year}_${currentSlip.month}`
    try {
      const raw = localStorage.getItem(LS_SALARY)
      const all = raw ? JSON.parse(raw) : {}
      all[key] = { ...currentSlip, remarks }
      localStorage.setItem(LS_SALARY, JSON.stringify(all))
      setSavedSlips({ ...all })
      showToast('Salary slip saved successfully!')
    } catch {
      showToast('Failed to save salary slip.', 'error')
    }
  }, [currentSlip, remarks, showToast])

  // ── View from list ──
  const handleView = useCallback((slip) => {
    setCurrentSlip(slip)
    setRemarks(slip.remarks || '')
    setViewMode(true)
    setActiveTab('generate')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Delete ──
  const handleDelete = useCallback((key) => {
    if (!window.confirm('Delete this salary slip?')) return
    try {
      const raw = localStorage.getItem(LS_SALARY)
      const all = raw ? JSON.parse(raw) : {}
      delete all[key]
      localStorage.setItem(LS_SALARY, JSON.stringify(all))
      setSavedSlips({ ...all })
      showToast('Salary slip deleted.')
    } catch {
      showToast('Failed to delete.', 'error')
    }
  }, [showToast])

  // ── Filtered slip list ──
  const filteredSlips = useMemo(() => {
    return Object.entries(savedSlips)
      .map(([key, slip]) => ({ key, ...slip }))
      .filter(slip => {
        if (filterStaff && String(slip.staffId) !== String(filterStaff)) return false
        if (filterMonth !== '' && slip.month !== parseInt(filterMonth))   return false
        if (filterYear  && slip.year  !== parseInt(filterYear))           return false
        return true
      })
      .sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year
        return b.month - a.month
      })
  }, [savedSlips, filterStaff, filterMonth, filterYear])

  // ── Year options ──
  const yearOptions = useMemo(() => {
    const y = now.getFullYear()
    return [y - 2, y - 1, y, y + 1]
  }, [now])

  // ─── Input class ───
  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl ' +
    'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 dark:focus:border-indigo-500'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="mb-6 print-hide">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <IndianRupee className="text-indigo-600 dark:text-indigo-400" size={26} />
          Salary Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Generate, review, and manage staff salary slips.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 print-hide">
        {[
          { id: 'generate', label: 'Generate Salary Slip', icon: <Calculator size={16} /> },
          { id: 'list',     label: 'Salary List',          icon: <FileText size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/50'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Generate ── */}
      {activeTab === 'generate' && (
        <>
          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-5 print-hide">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Calculator size={16} className="text-indigo-500" />
              {viewMode ? 'Viewing Saved Slip' : 'Generate Salary Slip'}
            </h2>
            {viewMode ? (
              <div className="flex flex-wrap gap-3 items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Viewing: <strong className="text-gray-800 dark:text-gray-200">{currentSlip?.staffName}</strong>
                  {' — '}
                  <strong className="text-gray-800 dark:text-gray-200">
                    {currentSlip ? `${MONTH_NAMES[currentSlip.month]} ${currentSlip.year}` : ''}
                  </strong>
                </div>
                <button
                  onClick={() => { setViewMode(false); setCurrentSlip(null) }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X size={15} /> Clear
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
                >
                  <Printer size={15} /> Print / PDF
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Staff Member</label>
                  <select
                    value={selStaffId}
                    onChange={e => { setSelStaffId(e.target.value); setCurrentSlip(null) }}
                    className={inputCls}
                  >
                    <option value="">— Select Staff —</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Month</label>
                  <select
                    value={selMonth}
                    onChange={e => { setSelMonth(parseInt(e.target.value)); setCurrentSlip(null) }}
                    className={inputCls}
                  >
                    {MONTH_NAMES.map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Year</label>
                  <select
                    value={selYear}
                    onChange={e => { setSelYear(parseInt(e.target.value)); setCurrentSlip(null) }}
                    className={inputCls}
                  >
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <button
                    onClick={handleCalculate}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                  >
                    <Calculator size={16} /> Calculate
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons (shown after calculation) */}
            {currentSlip && !viewMode && (
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                >
                  <Save size={16} /> Save Slip
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                >
                  <Printer size={16} /> Print / PDF
                </button>
                <button
                  onClick={() => { setCurrentSlip(null); setRemarks('') }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold transition-colors"
                >
                  <X size={16} /> Clear
                </button>
              </div>
            )}
          </div>

          {/* Slip or empty state */}
          {currentSlip ? (
            <SlipDisplay
              slip={currentSlip}
              remarks={remarks}
              onRemarksChange={setRemarks}
              readOnly={viewMode}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center print-hide">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IndianRupee size={28} className="text-indigo-400 dark:text-indigo-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">No Slip Generated</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">Select a staff member and click <strong>Calculate</strong> to generate a salary slip.</p>
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: Salary List ── */}
      {activeTab === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Filters */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Users size={16} className="text-indigo-500" />
              Saved Salary Slips
              <span className="ml-auto text-xs font-normal bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg px-2.5 py-1">
                {Object.keys(savedSlips).length} total
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Filter by Staff</label>
                <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)} className={inputCls}>
                  <option value="">All Staff</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Filter by Month</label>
                <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={inputCls}>
                  <option value="">All Months</option>
                  {MONTH_NAMES.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Filter by Year</label>
                <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className={inputCls}>
                  <option value="">All Years</option>
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredSlips.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-gray-300 dark:text-gray-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-1">No Salary Slips Found</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {Object.keys(savedSlips).length === 0
                  ? 'Generate and save a salary slip from the Generate tab.'
                  : 'No slips match your current filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-indigo-50 dark:bg-indigo-900/30 text-left">
                    {['Staff Name', 'Employee ID', 'Month / Year', 'Gross Salary', 'Deductions', 'Net Salary', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSlips.map((slip, idx) => (
                    <tr
                      key={slip.key}
                      className={`border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                        ${idx % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-700/20'}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{slip.staffName}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{slip.employeeID}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {MONTH_NAMES[slip.month]} {slip.year}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono whitespace-nowrap">
                        ₹ {fmtInt(Math.round(slip.gross))}
                      </td>
                      <td className="px-4 py-3 text-red-600 dark:text-red-400 font-mono whitespace-nowrap">
                        ₹ {fmtInt(Math.round(slip.totalDeductions))}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
                        ₹ {fmtInt(Math.round(slip.netSalary))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleView(slip)}
                            title="View Slip"
                            className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => { handleView(slip); setTimeout(() => window.print(), 400) }}
                            title="Print Slip"
                            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(slip.key)}
                            title="Delete Slip"
                            className="p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
