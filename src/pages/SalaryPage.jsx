import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Wallet, Users, Plus, Trash2, Pencil, Eye, Printer, X,
  Search, Filter, IndianRupee, CheckCircle, AlertCircle,
  Download, Calendar,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const LS_STAFF      = 'aiilsg_staff'
const LS_ATTENDANCE = 'aiilsg_attendance'
const LS_SALARY     = 'aiilsg_salary'

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl ' +
  'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 placeholder-gray-400 ' +
  'focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ' +
  'dark:focus:ring-indigo-900 transition-all'

const selectCls = inputCls + ' cursor-pointer'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 1 + i)

const NON_WORKING_STATUSES = new Set(['REST DAY', 'HOLIDAY', 'LOCAL HOLIDAY'])
const ABSENT_STATUSES       = new Set(['ABSENT'])
const UNPAID_STATUSES       = new Set(['UNPAID LEAVE'])

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtCurrency(val) {
  const n = Number(val) || 0
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function fmtMonth(yyyyMM) {
  if (!yyyyMM) return ''
  const [y, m] = yyyyMM.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
}

function getDaysInMonth(yyyyMM) {
  const [y, m] = yyyyMM.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

function maskAccount(acc) {
  if (!acc) return '—'
  const s = String(acc)
  if (s.length <= 4) return s
  return 'X'.repeat(s.length - 4) + s.slice(-4)
}

function loadLS(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
}

function saveLS(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function computeAttendance(staffId, month) {
  const allAtt  = loadLS(LS_ATTENDANCE)
  const record  = allAtt[`${staffId}_${month}`]
  const totalDays = getDaysInMonth(month)

  if (!record || !Array.isArray(record.rows) || record.rows.length === 0) {
    return { totalWorkingDays: totalDays, daysPresent: 0, daysAbsent: 0, unpaidDays: 0, hasData: false }
  }

  let nonWorking = 0
  let present    = 0
  let absent     = 0
  let unpaid     = 0

  record.rows.forEach(({ status }) => {
    if (NON_WORKING_STATUSES.has(status)) nonWorking++
    else if (status === 'PRESENT') present++
    else if (status === 'HALF DAY') present += 0.5
    else if (ABSENT_STATUSES.has(status)) absent++
    else if (UNPAID_STATUSES.has(status)) unpaid++
  })

  const totalWorkingDays = totalDays - nonWorking
  return { totalWorkingDays, daysPresent: present, daysAbsent: absent, unpaidDays: unpaid, hasData: true }
}

function calcSalaryTotals(fields) {
  const earn = ['basicSalary','hra','da','conveyance','medical','specialAllowance','otherAllowances']
  const ded  = ['pfDeduction','esiDeduction','professionalTax','tds','otherDeductions']

  const grossSalary = earn.reduce((s, k) => s + (Number(fields[k]) || 0), 0)
  const totalWorkingDays = Number(fields.totalWorkingDays) || 0
  const perDay = totalWorkingDays > 0 ? grossSalary / totalWorkingDays : 0
  const absentDeduction = perDay * ((Number(fields.daysAbsent) || 0) + (Number(fields.unpaidDays) || 0))
  const fixedDed = ded.reduce((s, k) => s + (Number(fields[k]) || 0), 0)
  const totalDeductions = fixedDed + absentDeduction
  const netSalary = grossSalary - totalDeductions

  return { grossSalary, absentDeduction, totalDeductions, netSalary }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all
            ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
        >
          {t.type === 'success'
            ? <CheckCircle size={16} />
            : <AlertCircle size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ─── Salary Slip Print View ───────────────────────────────────────────────────
function SlipView({ slip, onClose, onPrint }) {
  const totals = calcSalaryTotals(slip)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* no-print backdrop — hidden on actual print */}
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Action buttons — hidden on print */}
        <div className="no-print flex justify-end gap-2 mb-3">
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Printer size={15} /> Print / Download
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <X size={15} /> Close
          </button>
        </div>

        {/* ── Printable area ── */}
        <div className="salary-print-area bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Header */}
          <div className="print-header-bg text-center rounded-xl px-6 py-5 mb-6">
            <h1 className="text-lg font-bold uppercase tracking-wide">
              All India Institute of Local Self Government
            </h1>
            <p className="text-sm mt-0.5 opacity-90">West Bengal Regional Centre</p>
            <div className="mt-3 inline-block bg-white/20 rounded-lg px-6 py-1.5">
              <p className="text-base font-semibold tracking-wider">SALARY SLIP</p>
              <p className="text-sm">{fmtMonth(slip.month)}</p>
            </div>
          </div>

          {/* Employee Details */}
          <div className="print-table-header rounded-xl px-5 py-4 mb-5 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div><span className="font-semibold">Employee Name:</span> {slip.staffName}</div>
            <div><span className="font-semibold">Employee ID:</span> {slip.employeeID || '—'}</div>
            <div><span className="font-semibold">Designation:</span> {slip.designation || '—'}</div>
            <div><span className="font-semibold">Department:</span> {slip.department || '—'}</div>
            <div><span className="font-semibold">Project:</span> {slip.assignedProject || '—'}</div>
            <div>
              <span className="font-semibold">Bank / A/C:</span>{' '}
              {slip.bankName || '—'} / {maskAccount(slip.accountNumber)}
            </div>
          </div>

          {/* Earnings & Deductions side by side */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* Earnings */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="print-table-header px-4 py-2 text-sm font-semibold text-center border-b border-gray-200">
                EARNINGS
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Basic Salary',      slip.basicSalary],
                    ['HRA',               slip.hra],
                    ['DA',                slip.da],
                    ['Conveyance',        slip.conveyance],
                    ['Medical',           slip.medical],
                    ['Special Allowance', slip.specialAllowance],
                    ['Other Allowances',  slip.otherAllowances],
                  ].map(([label, val]) => (
                    <tr key={label} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-1.5 text-gray-600">{label}</td>
                      <td className="px-4 py-1.5 text-right font-medium">{fmtCurrency(val)}</td>
                    </tr>
                  ))}
                  <tr className="bg-green-50 font-semibold">
                    <td className="px-4 py-2 text-green-800">Gross Salary</td>
                    <td className="px-4 py-2 text-right text-green-800">{fmtCurrency(totals.grossSalary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="print-table-header px-4 py-2 text-sm font-semibold text-center border-b border-gray-200">
                DEDUCTIONS
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['PF',                slip.pfDeduction],
                    ['ESI',               slip.esiDeduction],
                    ['Professional Tax',  slip.professionalTax],
                    ['TDS',               slip.tds],
                    ['Other Deductions',  slip.otherDeductions],
                    ['Absent Deduction',  totals.absentDeduction],
                  ].map(([label, val]) => (
                    <tr key={label} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-1.5 text-gray-600">{label}</td>
                      <td className="px-4 py-1.5 text-right font-medium">{fmtCurrency(val)}</td>
                    </tr>
                  ))}
                  <tr className="bg-red-50 font-semibold">
                    <td className="px-4 py-2 text-red-800">Total Deductions</td>
                    <td className="px-4 py-2 text-right text-red-800">{fmtCurrency(totals.totalDeductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Salary Banner */}
          <div className="print-header-bg rounded-xl px-6 py-4 text-center mb-5">
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest mb-1">Net Salary Payable</p>
            <p className="text-3xl font-bold">{fmtCurrency(totals.netSalary)}</p>
          </div>

          {/* Attendance Summary */}
          <div className="grid grid-cols-3 gap-3 text-sm mb-5">
            {[
              ['Total Working Days', slip.totalWorkingDays ?? '—'],
              ['Days Present',       slip.daysPresent ?? '—'],
              ['Days Absent',        (Number(slip.daysAbsent) || 0) + (Number(slip.unpaidDays) || 0)],
            ].map(([label, val]) => (
              <div key={label} className="print-table-header rounded-xl px-4 py-3 text-center">
                <p className="text-gray-500 text-xs uppercase tracking-wide">{label}</p>
                <p className="text-lg font-bold mt-0.5">{val}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 flex justify-between text-xs text-gray-400">
            <span>Generated on {new Date().toLocaleDateString('en-IN')}</span>
            <span>This is a computer-generated slip and does not require a signature.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Generator Modal ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  staffId: '',
  month: '',
  basicSalary: '', hra: '', da: '', conveyance: '', medical: '',
  specialAllowance: '', otherAllowances: '',
  pfDeduction: '', esiDeduction: '', professionalTax: '', tds: '', otherDeductions: '',
  totalWorkingDays: '', daysPresent: '', daysAbsent: '', unpaidDays: '',
}

function GeneratorModal({ editSlip, onClose, onSaved, showToast }) {
  const [form, setForm]           = useState(EMPTY_FORM)
  const [attWarning, setAttWarning] = useState('')
  const [saving, setSaving]       = useState(false)

  const staffList = useMemo(() => {
    const raw = loadLS(LS_STAFF)
    return Object.values(raw).filter(Boolean)
  }, [])

  // Pre-fill when editing
  useEffect(() => {
    if (editSlip) {
      setForm({
        staffId:          editSlip.staffId         ?? '',
        month:            editSlip.month           ?? '',
        basicSalary:      editSlip.basicSalary      ?? '',
        hra:              editSlip.hra              ?? '',
        da:               editSlip.da              ?? '',
        conveyance:       editSlip.conveyance       ?? '',
        medical:          editSlip.medical          ?? '',
        specialAllowance: editSlip.specialAllowance ?? '',
        otherAllowances:  editSlip.otherAllowances  ?? '',
        pfDeduction:      editSlip.pfDeduction      ?? '',
        esiDeduction:     editSlip.esiDeduction     ?? '',
        professionalTax:  editSlip.professionalTax  ?? '',
        tds:              editSlip.tds              ?? '',
        otherDeductions:  editSlip.otherDeductions  ?? '',
        totalWorkingDays: editSlip.totalWorkingDays ?? '',
        daysPresent:      editSlip.daysPresent      ?? '',
        daysAbsent:       editSlip.daysAbsent       ?? '',
        unpaidDays:       editSlip.unpaidDays       ?? '',
      })
    }
  }, [editSlip])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleLoad = useCallback(() => {
    if (!form.staffId || !form.month) {
      showToast('Please select a staff member and month first.', 'error')
      return
    }
    const staff = staffList.find(s => String(s.id) === String(form.staffId))
    if (!staff) return

    const att = computeAttendance(form.staffId, form.month)
    if (!att.hasData) {
      setAttWarning('No attendance data found for this month. Attendance fields set to defaults — you may edit them manually.')
    } else {
      setAttWarning('')
    }

    setForm(p => ({
      ...p,
      basicSalary:      staff.basicSalary      ?? '',
      hra:              staff.hra              ?? '',
      da:               staff.da              ?? '',
      conveyance:       staff.conveyance       ?? '',
      medical:          staff.medical          ?? '',
      specialAllowance: staff.specialAllowance ?? '',
      otherAllowances:  staff.otherAllowances  ?? '',
      pfDeduction:      staff.pfDeduction      ?? '',
      esiDeduction:     staff.esiDeduction     ?? '',
      professionalTax:  staff.professionalTax  ?? '',
      tds:              staff.tds              ?? '',
      otherDeductions:  staff.otherDeductions  ?? '',
      totalWorkingDays: att.totalWorkingDays,
      daysPresent:      att.daysPresent,
      daysAbsent:       att.daysAbsent,
      unpaidDays:       att.unpaidDays,
    }))
  }, [form.staffId, form.month, staffList, showToast])

  const totals = useMemo(() => calcSalaryTotals(form), [form])

  const handleSave = useCallback(() => {
    if (!form.staffId || !form.month) {
      showToast('Staff and month are required.', 'error')
      return
    }
    setSaving(true)
    const staff = staffList.find(s => String(s.id) === String(form.staffId)) || {}
    const id    = `${form.staffId}_${form.month}`
    const now   = new Date().toISOString()
    const existing = loadLS(LS_SALARY)

    const slip = {
      id,
      staffId:          form.staffId,
      month:            form.month,
      staffName:        staff.fullName        || '',
      designation:      staff.designation     || '',
      employeeID:       staff.employeeID      || '',
      department:       staff.department      || '',
      assignedProject:  staff.assignedProject || '',
      bankName:         staff.bankName        || '',
      accountNumber:    staff.accountNumber   || '',
      basicSalary:      Number(form.basicSalary)      || 0,
      hra:              Number(form.hra)              || 0,
      da:               Number(form.da)              || 0,
      conveyance:       Number(form.conveyance)       || 0,
      medical:          Number(form.medical)          || 0,
      specialAllowance: Number(form.specialAllowance) || 0,
      otherAllowances:  Number(form.otherAllowances)  || 0,
      pfDeduction:      Number(form.pfDeduction)      || 0,
      esiDeduction:     Number(form.esiDeduction)     || 0,
      professionalTax:  Number(form.professionalTax)  || 0,
      tds:              Number(form.tds)              || 0,
      otherDeductions:  Number(form.otherDeductions)  || 0,
      totalWorkingDays: Number(form.totalWorkingDays) || 0,
      daysPresent:      Number(form.daysPresent)      || 0,
      daysAbsent:       Number(form.daysAbsent)       || 0,
      unpaidDays:       Number(form.unpaidDays)       || 0,
      absentDeduction:  totals.absentDeduction,
      grossSalary:      totals.grossSalary,
      totalDeductions:  totals.totalDeductions,
      netSalary:        totals.netSalary,
      createdAt:        existing[id]?.createdAt || now,
      updatedAt:        now,
    }

    saveLS(LS_SALARY, { ...existing, [id]: slip })
    setSaving(false)
    showToast('Salary slip saved successfully!', 'success')
    onSaved()
  }, [form, staffList, totals, showToast, onSaved])

  const numField = (label, key) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        min="0"
        step="any"
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        className={inputCls}
        placeholder="0"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-t-2xl">
          <div className="flex items-center gap-2 text-white">
            <IndianRupee size={18} />
            <h2 className="font-semibold text-base">
              {editSlip ? 'Edit Salary Slip' : 'Generate Salary Slip'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Staff + Month Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Select Staff *</label>
              <select value={form.staffId} onChange={e => set('staffId', e.target.value)} className={selectCls}>
                <option value="">— Choose Staff —</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.employeeID || s.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Select Month *</label>
              <input
                type="month"
                value={form.month}
                onChange={e => set('month', e.target.value)}
                className={inputCls}
              />
            </div>
            <button
              onClick={handleLoad}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Calendar size={15} /> Load Data
            </button>
          </div>

          {/* Attendance Warning */}
          {attWarning && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {attWarning}
            </div>
          )}

          {/* Earnings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-1.5">
              <IndianRupee size={15} className="text-green-500" /> Earnings
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {numField('Basic Salary',      'basicSalary')}
              {numField('HRA',               'hra')}
              {numField('DA',                'da')}
              {numField('Conveyance',        'conveyance')}
              {numField('Medical',           'medical')}
              {numField('Special Allowance', 'specialAllowance')}
              {numField('Other Allowances',  'otherAllowances')}
              <div className="flex flex-col justify-end">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Gross Salary</label>
                <div className="px-3 py-2.5 text-sm rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold border border-green-200 dark:border-green-700">
                  {fmtCurrency(totals.grossSalary)}
                </div>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-1.5">
              <Calendar size={15} className="text-indigo-500" /> Attendance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {numField('Total Working Days', 'totalWorkingDays')}
              {numField('Days Present',       'daysPresent')}
              {numField('Days Absent',        'daysAbsent')}
              {numField('Unpaid Leave Days',  'unpaidDays')}
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-1.5">
              <Trash2 size={15} className="text-red-500" /> Deductions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {numField('PF Deduction',      'pfDeduction')}
              {numField('ESI Deduction',     'esiDeduction')}
              {numField('Professional Tax',  'professionalTax')}
              {numField('TDS',               'tds')}
              {numField('Other Deductions',  'otherDeductions')}
              <div className="flex flex-col justify-end">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Absent Deduction</label>
                <div className="px-3 py-2.5 text-sm rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 font-medium border border-orange-200 dark:border-orange-700">
                  {fmtCurrency(totals.absentDeduction)}
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Deductions</label>
                <div className="px-3 py-2.5 text-sm rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-semibold border border-red-200 dark:border-red-700">
                  {fmtCurrency(totals.totalDeductions)}
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl px-6 py-4 flex items-center justify-between border border-indigo-100 dark:border-indigo-800">
            <div>
              <p className="text-xs text-indigo-500 dark:text-indigo-400 uppercase tracking-widest font-medium">Net Salary</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                {fmtCurrency(totals.netSalary)}
              </p>
            </div>
            <IndianRupee size={40} className="text-indigo-200 dark:text-indigo-700" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
            >
              <CheckCircle size={15} />
              {saving ? 'Saving…' : 'Save Salary Slip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Delay allows the slip view to mount in the DOM before the print dialog opens
const PRINT_DELAY_MS = 200
export default function SalaryPage() {
  const [slips,        setSlips]        = useState({})
  const [viewSlip,     setViewSlip]     = useState(null)   // slip object for print view
  const [showGen,      setShowGen]      = useState(false)
  const [editSlip,     setEditSlip]     = useState(null)   // slip object for editing
  const [deleteId,     setDeleteId]     = useState(null)   // id pending confirm
  const [toasts,       setToasts]       = useState([])
  const [search,       setSearch]       = useState('')
  const [filterMonth,  setFilterMonth]  = useState('')
  const [filterYear,   setFilterYear]   = useState('')

  // ── Load slips ──
  const loadSlips = useCallback(() => {
    setSlips(loadLS(LS_SALARY))
  }, [])

  useEffect(() => { loadSlips() }, [loadSlips])

  // ── Toast helpers ──
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  // ── Filtered slips ──
  const filteredSlips = useMemo(() => {
    return Object.values(slips)
      .filter(Boolean)
      .filter(s => {
        const nameMatch  = !search      || s.staffName?.toLowerCase().includes(search.toLowerCase())
        const [y, m]     = (s.month || '').split('-')
        const monthMatch = !filterMonth || m === filterMonth
        const yearMatch  = !filterYear  || y === filterYear
        return nameMatch && monthMatch && yearMatch
      })
      .sort((a, b) => (b.month || '').localeCompare(a.month || ''))
  }, [slips, search, filterMonth, filterYear])

  // ── Delete ──
  const confirmDelete = useCallback(() => {
    if (!deleteId) return
    const updated = { ...loadLS(LS_SALARY) }
    delete updated[deleteId]
    saveLS(LS_SALARY, updated)
    setSlips(updated)
    setDeleteId(null)
    showToast('Salary slip deleted.', 'success')
  }, [deleteId, showToast])

  // ── Print handler ──
  const handlePrint = useCallback(() => {
    setTimeout(() => window.print(), PRINT_DELAY_MS)
  }, [])

  // ── Open generator ──
  const openGenerator = useCallback((slip = null) => {
    setEditSlip(slip)
    setShowGen(true)
  }, [])

  const closeGenerator = useCallback(() => {
    setShowGen(false)
    setEditSlip(null)
  }, [])

  const onSaved = useCallback(() => {
    loadSlips()
    closeGenerator()
  }, [loadSlips, closeGenerator])

  // ── Month options (1–12) ──
  const monthOptions = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const mm = String(i + 1).padStart(2, '0')
      const label = new Date(2000, i, 1).toLocaleString('en-IN', { month: 'long' })
      return { value: mm, label }
    }), [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <Toast toasts={toasts} />

      {/* ── Page Header ── */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-2xl px-6 py-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 text-white">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Wallet size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">AIILSG WB — Salary Management</h1>
            <p className="text-sm text-indigo-200 mt-0.5">{Object.keys(slips).length} slip{Object.keys(slips).length !== 1 ? 's' : ''} generated</p>
          </div>
        </div>
        <button
          onClick={() => openGenerator()}
          className="no-print flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition shadow"
        >
          <Plus size={16} /> Generate Salary Slip
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="no-print bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 px-5 py-4 mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by staff name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={inputCls + ' pl-9'}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={15} className="text-gray-400" />
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={selectCls + ' w-36'}>
            <option value="">All Months</option>
            {monthOptions.map(mo => (
              <option key={mo.value} value={mo.value}>{mo.label}</option>
            ))}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className={selectCls + ' w-28'}>
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
          {(search || filterMonth || filterYear) && (
            <button
              onClick={() => { setSearch(''); setFilterMonth(''); setFilterYear('') }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Slips Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredSlips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <IndianRupee size={48} className="mb-3 text-gray-200 dark:text-gray-700" />
            <p className="text-base font-medium">No salary slips found</p>
            <p className="text-sm mt-1">
              {Object.keys(slips).length === 0
                ? 'Generate your first salary slip to get started.'
                : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  {['Employee', 'Month', 'Gross Salary', 'Deductions', 'Net Salary', 'Attendance', 'Actions'].map(col => (
                    <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filteredSlips.map(slip => (
                  <tr key={slip.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 dark:text-gray-100">{slip.staffName || '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{slip.employeeID || slip.staffId}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {fmtMonth(slip.month)}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                      {fmtCurrency(slip.grossSalary)}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-red-500 dark:text-red-400 whitespace-nowrap">
                      {fmtCurrency(slip.totalDeductions)}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {fmtCurrency(slip.netSalary)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400 text-xs">
                      {slip.daysPresent ?? '—'} / {slip.totalWorkingDays ?? '—'} days
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          title="View / Print"
                          onClick={() => setViewSlip(slip)}
                          className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Quick Print"
                          onClick={() => { setViewSlip(slip); setTimeout(() => window.print(), PRINT_DELAY_MS) }}
                          className="p-1.5 rounded-lg text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => openGenerator(slip)}
                          className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteId(slip.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                        >
                          <Trash2 size={15} />
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

      {/* ── Generator Modal ── */}
      {showGen && (
        <GeneratorModal
          editSlip={editSlip}
          onClose={closeGenerator}
          onSaved={onSaved}
          showToast={showToast}
        />
      )}

      {/* ── Slip View (Print) ── */}
      {viewSlip && (
        <SlipView
          slip={viewSlip}
          onClose={() => setViewSlip(null)}
          onPrint={handlePrint}
        />
      )}

      {/* ── Delete Confirmation ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-xl">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Delete Salary Slip</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
              Are you sure you want to delete this salary slip?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
