import { useState, useMemo, useEffect, useCallback } from 'react'
import { projects as sampleProjects } from '../data/sampleData'
import { formatDate } from '../utils/helpers'
import {
  Search, Plus, X, Pencil, Trash2, Eye, CheckCircle, AlertCircle,
  LayoutGrid, List, User, Phone,
  MapPin, Briefcase, CreditCard, Building2, IndianRupee,
  FileText, Users, Filter, Printer,
} from 'lucide-react'


// ─── Constants ────────────────────────────────────────────────────────────────
const LS_KEY = 'aiilsg_staff'
const ALL_STATUSES = ['All', 'Active', 'Inactive', 'On Notice', 'Terminated', 'Resigned']
const ALL_DEPARTMENTS = ['All', 'Management', 'Projects', 'Technical', 'Field', 'Finance', 'HR', 'Admin', 'IT']

// ─── Sample Staff Data ────────────────────────────────────────────────────────
const SAMPLE_STAFF = [
  {
    id: 1,
    // Personal
    fullName: 'Dr. Subrata Banerjee',
    fatherName: 'Sri Samir Banerjee',
    dob: '1972-08-15',
    gender: 'Male',
    maritalStatus: 'Married',
    bloodGroup: 'B+',
    religion: 'Hindu',
    category: 'General',
    nationality: 'Indian',
    photo: '',
    // Contact
    mobile: '9830012345',
    alternateMobile: '9831012345',
    email: 'subrata.banerjee@aiilsgwb.in',
    currentAddress: 'Flat 4B, Sunshine Apartments, Lake Town',
    currentCity: 'Kolkata',
    currentState: 'West Bengal',
    currentPIN: '700089',
    permanentAddress: 'Flat 4B, Sunshine Apartments, Lake Town',
    permanentCity: 'Kolkata',
    permanentState: 'West Bengal',
    permanentPIN: '700089',
    emergencyName: 'Smt. Mita Banerjee',
    emergencyNumber: '9830098765',
    emergencyRelation: 'Spouse',
    // Identity
    aadhaarNumber: '2345 6789 0123',
    panNumber: 'BNRJS1234K',
    passportNumber: 'N1234567',
    voterID: 'WB/12/034/123456',
    dlNumber: 'WB-0120100012345',
    // Bank
    bankName: 'State Bank of India',
    accountNumber: '30012345678',
    confirmAccountNumber: '30012345678',
    ifscCode: 'SBIN0004631',
    branchName: 'Lake Town',
    accountType: 'Savings',
    // Employment
    employeeID: 'AIILSG-001',
    designation: 'Centre Director',
    department: 'Management',
    employmentType: 'Full-time',
    joiningDate: '2018-06-01',
    resignationDate: '',
    lastWorkingDate: '',
    employmentStatus: 'Active',
    qualification: 'Ph.D. Urban Planning',
    experience: 22,
    previousOrg: 'NIUA, New Delhi',
    reportingManager: '',
    projectLocation: 'Kolkata',
    // Salary
    basicSalary: 60000,
    hra: 18000,
    da: 9000,
    conveyance: 2000,
    medical: 1250,
    specialAllowance: 3000,
    otherAllowances: 1750,
    pfDeduction: 7200,
    esiDeduction: 0,
    professionalTax: 200,
    tds: 3000,
    otherDeductions: 0,
    // Project
    assignedProject: 'Urban Local Body Staff Training Programme – Batch 12',
    projectRole: 'Project Director',
    projectSiteLocation: 'Kolkata',
    hrCostToProject: 95000,
    assignmentStart: '2025-01-06',
    assignmentEnd: '2025-03-31',
    remarks: 'Overall in-charge of AIILSG WB Centre operations.',
  },
  {
    id: 2,
    fullName: 'Smt. Priya Ghosh',
    fatherName: 'Sri Dilip Ghosh',
    dob: '1985-03-22',
    gender: 'Female',
    maritalStatus: 'Married',
    bloodGroup: 'A+',
    religion: 'Hindu',
    category: 'General',
    nationality: 'Indian',
    photo: '',
    mobile: '9831023456',
    alternateMobile: '',
    email: 'priya.ghosh@aiilsgwb.in',
    currentAddress: '12, Ballygunge Place',
    currentCity: 'Kolkata',
    currentState: 'West Bengal',
    currentPIN: '700019',
    permanentAddress: '12, Ballygunge Place',
    permanentCity: 'Kolkata',
    permanentState: 'West Bengal',
    permanentPIN: '700019',
    emergencyName: 'Sri Rajesh Ghosh',
    emergencyNumber: '9830112233',
    emergencyRelation: 'Spouse',
    aadhaarNumber: '3456 7890 1234',
    panNumber: 'GHSPP5678L',
    passportNumber: '',
    voterID: 'WB/12/034/234567',
    dlNumber: '',
    bankName: 'HDFC Bank',
    accountNumber: '50100234567890',
    confirmAccountNumber: '50100234567890',
    ifscCode: 'HDFC0001234',
    branchName: 'Ballygunge',
    accountType: 'Savings',
    employeeID: 'AIILSG-002',
    designation: 'Senior Project Manager',
    department: 'Projects',
    employmentType: 'Full-time',
    joiningDate: '2019-03-15',
    resignationDate: '',
    lastWorkingDate: '',
    employmentStatus: 'Active',
    qualification: 'M.Tech Civil Engineering',
    experience: 10,
    previousOrg: 'WBHIDCO',
    reportingManager: 'Dr. Subrata Banerjee',
    projectLocation: 'Kolkata',
    basicSalary: 48000,
    hra: 14400,
    da: 7200,
    conveyance: 1600,
    medical: 1250,
    specialAllowance: 1800,
    otherAllowances: 750,
    pfDeduction: 5760,
    esiDeduction: 0,
    professionalTax: 200,
    tds: 1500,
    otherDeductions: 0,
    assignedProject: 'Kolkata Smart City Mission – Phase II',
    projectRole: 'Project Manager',
    projectSiteLocation: 'Kolkata',
    hrCostToProject: 75000,
    assignmentStart: '2024-04-01',
    assignmentEnd: '',
    remarks: 'Leading smart city IoT deployment.',
  },
  {
    id: 3,
    fullName: 'Sri Tanmoy Roy',
    fatherName: 'Sri Nirmal Roy',
    dob: '1990-07-11',
    gender: 'Male',
    maritalStatus: 'Married',
    bloodGroup: 'O+',
    religion: 'Hindu',
    category: 'OBC',
    nationality: 'Indian',
    photo: '',
    mobile: '9832034567',
    alternateMobile: '9832034568',
    email: 'tanmoy.roy@aiilsgwb.in',
    currentAddress: '45, Berhampore Housing Complex',
    currentCity: 'Berhampore',
    currentState: 'West Bengal',
    currentPIN: '742101',
    permanentAddress: '22, Jiaganj Road, Murshidabad',
    permanentCity: 'Murshidabad',
    permanentState: 'West Bengal',
    permanentPIN: '742149',
    emergencyName: 'Smt. Ananya Roy',
    emergencyNumber: '9832110011',
    emergencyRelation: 'Spouse',
    aadhaarNumber: '4567 8901 2345',
    panNumber: 'ROYTN3456M',
    passportNumber: '',
    voterID: 'WB/16/006/345678',
    dlNumber: 'WB-2110200045678',
    bankName: 'Punjab National Bank',
    accountNumber: '4218000100234567',
    confirmAccountNumber: '4218000100234567',
    ifscCode: 'PUNB0421800',
    branchName: 'Berhampore',
    accountType: 'Savings',
    employeeID: 'AIILSG-004',
    designation: 'Civil Engineer',
    department: 'Technical',
    employmentType: 'Full-time',
    joiningDate: '2021-01-10',
    resignationDate: '',
    lastWorkingDate: '',
    employmentStatus: 'Active',
    qualification: 'B.Tech Civil Engineering',
    experience: 5,
    previousOrg: 'WBIDC',
    reportingManager: 'Sri Debashis Mukherjee',
    projectLocation: 'Berhampore',
    basicSalary: 35000,
    hra: 10500,
    da: 5250,
    conveyance: 1200,
    medical: 1250,
    specialAllowance: 1000,
    otherAllowances: 800,
    pfDeduction: 4200,
    esiDeduction: 825,
    professionalTax: 150,
    tds: 0,
    otherDeductions: 0,
    assignedProject: 'Drinking Water Supply – Murshidabad District',
    projectRole: 'Site Engineer',
    projectSiteLocation: 'Berhampore',
    hrCostToProject: 55000,
    assignmentStart: '2024-01-15',
    assignmentEnd: '',
    remarks: 'Handles all civil survey and pipeline work.',
  },
  {
    id: 4,
    fullName: 'Sri Partha Sarathi Dey',
    fatherName: 'Sri Kartik Dey',
    dob: '1988-11-05',
    gender: 'Male',
    maritalStatus: 'Married',
    bloodGroup: 'AB+',
    religion: 'Hindu',
    category: 'General',
    nationality: 'Indian',
    photo: '',
    mobile: '9833045678',
    alternateMobile: '',
    email: 'partha.dey@aiilsgwb.in',
    currentAddress: '8, Deshbandhu Nagar, Sector II',
    currentCity: 'Kolkata',
    currentState: 'West Bengal',
    currentPIN: '700059',
    permanentAddress: '8, Deshbandhu Nagar, Sector II',
    permanentCity: 'Kolkata',
    permanentState: 'West Bengal',
    permanentPIN: '700059',
    emergencyName: 'Sri Kartik Dey',
    emergencyNumber: '9830223344',
    emergencyRelation: 'Father',
    aadhaarNumber: '5678 9012 3456',
    panNumber: 'DEYPS7890A',
    passportNumber: '',
    voterID: 'WB/12/034/456789',
    dlNumber: 'WB-0119990045679',
    bankName: 'Bank of Baroda',
    accountNumber: '22270100007890',
    confirmAccountNumber: '22270100007890',
    ifscCode: 'BARB0SALTLK',
    branchName: 'Salt Lake',
    accountType: 'Savings',
    employeeID: 'AIILSG-009',
    designation: 'Accounts Officer',
    department: 'Finance',
    employmentType: 'Full-time',
    joiningDate: '2020-10-05',
    resignationDate: '',
    lastWorkingDate: '',
    employmentStatus: 'Active',
    qualification: 'M.Com, CA (Inter)',
    experience: 8,
    previousOrg: 'KMC Finance Dept.',
    reportingManager: 'Dr. Subrata Banerjee',
    projectLocation: 'Kolkata',
    basicSalary: 32000,
    hra: 9600,
    da: 4800,
    conveyance: 1200,
    medical: 1250,
    specialAllowance: 900,
    otherAllowances: 250,
    pfDeduction: 3840,
    esiDeduction: 750,
    professionalTax: 150,
    tds: 0,
    otherDeductions: 0,
    assignedProject: 'Kolkata Smart City Mission – Phase II',
    projectRole: 'Project Accountant',
    projectSiteLocation: 'Kolkata',
    hrCostToProject: 50000,
    assignmentStart: '2024-04-01',
    assignmentEnd: '',
    remarks: 'Manages project billing, invoicing and financial reports.',
  },
  {
    id: 5,
    fullName: 'Smt. Supriya Mondal',
    fatherName: 'Sri Ashok Mondal',
    dob: '1994-05-18',
    gender: 'Female',
    maritalStatus: 'Single',
    bloodGroup: 'A-',
    religion: 'Hindu',
    category: 'SC',
    nationality: 'Indian',
    photo: '',
    mobile: '9834056789',
    alternateMobile: '',
    email: 'supriya.mondal@aiilsgwb.in',
    currentAddress: '23, Rabindra Pally, Barasat',
    currentCity: 'Barasat',
    currentState: 'West Bengal',
    currentPIN: '700124',
    permanentAddress: '23, Rabindra Pally, Barasat',
    permanentCity: 'Barasat',
    permanentState: 'West Bengal',
    permanentPIN: '700124',
    emergencyName: 'Sri Ashok Mondal',
    emergencyNumber: '9830334455',
    emergencyRelation: 'Father',
    aadhaarNumber: '6789 0123 4567',
    panNumber: 'MNLSP2345B',
    passportNumber: '',
    voterID: 'WB/15/001/567890',
    dlNumber: '',
    bankName: 'Union Bank of India',
    accountNumber: '510101012345678',
    confirmAccountNumber: '510101012345678',
    ifscCode: 'UBIN0551010',
    branchName: 'Barasat',
    accountType: 'Savings',
    employeeID: 'AIILSG-010',
    designation: 'HR Officer',
    department: 'HR',
    employmentType: 'Full-time',
    joiningDate: '2022-06-01',
    resignationDate: '',
    lastWorkingDate: '',
    employmentStatus: 'Active',
    qualification: 'MBA (HR)',
    experience: 3,
    previousOrg: '',
    reportingManager: 'Dr. Subrata Banerjee',
    projectLocation: 'Kolkata',
    basicSalary: 28000,
    hra: 8400,
    da: 4200,
    conveyance: 1000,
    medical: 1250,
    specialAllowance: 600,
    otherAllowances: 550,
    pfDeduction: 3360,
    esiDeduction: 675,
    professionalTax: 150,
    tds: 0,
    otherDeductions: 0,
    assignedProject: '',
    projectRole: '',
    projectSiteLocation: 'Kolkata',
    hrCostToProject: 42000,
    assignmentStart: '',
    assignmentEnd: '',
    remarks: 'Handles HR operations, payroll and recruitment.',
  },
  {
    id: 6,
    fullName: 'Sri Biswanath Das',
    fatherName: 'Sri Gobinda Das',
    dob: '1992-12-30',
    gender: 'Male',
    maritalStatus: 'Married',
    bloodGroup: 'B-',
    religion: 'Hindu',
    category: 'OBC',
    nationality: 'Indian',
    photo: '',
    mobile: '9835067890',
    alternateMobile: '9835067891',
    email: 'biswanath.das@aiilsgwb.in',
    currentAddress: 'Vill. Bamunpara, PO Malda Town',
    currentCity: 'Malda',
    currentState: 'West Bengal',
    currentPIN: '732101',
    permanentAddress: 'Vill. Bamunpara, PO Malda Town',
    permanentCity: 'Malda',
    permanentState: 'West Bengal',
    permanentPIN: '732101',
    emergencyName: 'Smt. Rekha Das',
    emergencyNumber: '9835445566',
    emergencyRelation: 'Spouse',
    aadhaarNumber: '7890 1234 5678',
    panNumber: 'DASBW4567C',
    passportNumber: '',
    voterID: 'WB/18/002/678901',
    dlNumber: 'WB-1120210067891',
    bankName: 'UCO Bank',
    accountNumber: '01660110023456',
    confirmAccountNumber: '01660110023456',
    ifscCode: 'UCBA0000166',
    branchName: 'Malda',
    accountType: 'Savings',
    employeeID: 'AIILSG-007',
    designation: 'Site Supervisor',
    department: 'Field',
    employmentType: 'Contract',
    joiningDate: '2021-08-15',
    resignationDate: '',
    lastWorkingDate: '',
    employmentStatus: 'Active',
    qualification: 'Diploma Civil Engineering',
    experience: 6,
    previousOrg: 'PWD West Bengal',
    reportingManager: 'Sri Tanmoy Roy',
    projectLocation: 'Malda',
    basicSalary: 24000,
    hra: 7200,
    da: 3600,
    conveyance: 800,
    medical: 1250,
    specialAllowance: 400,
    otherAllowances: 750,
    pfDeduction: 2880,
    esiDeduction: 570,
    professionalTax: 110,
    tds: 0,
    otherDeductions: 0,
    assignedProject: 'Sanitation & ODF Plus – Malda',
    projectRole: 'Field Supervisor',
    projectSiteLocation: 'Malda',
    hrCostToProject: 38000,
    assignmentStart: '2025-03-01',
    assignmentEnd: '2026-08-31',
    remarks: 'On-ground supervision of sanitation construction work.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcAge(dob) {
  if (!dob) return ''
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function calcGross(s) {
  return (
    Number(s.basicSalary || 0) +
    Number(s.hra || 0) +
    Number(s.da || 0) +
    Number(s.conveyance || 0) +
    Number(s.medical || 0) +
    Number(s.specialAllowance || 0) +
    Number(s.otherAllowances || 0)
  )
}

function calcDeductions(s) {
  return (
    Number(s.pfDeduction || 0) +
    Number(s.esiDeduction || 0) +
    Number(s.professionalTax || 0) +
    Number(s.tds || 0) +
    Number(s.otherDeductions || 0)
  )
}

function calcNet(s) {
  return calcGross(s) - calcDeductions(s)
}

function fmtCur(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

function statusColor(status) {
  switch (status) {
    case 'Active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
    case 'Inactive': return 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'
    case 'On Notice': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
    case 'Terminated': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
    case 'Resigned': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function initials(name) {
  return name
    .replace(/^(Sri|Smt\.|Dr\.) /, '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

function avatarGradient(id) {
  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-pink-600',
    'from-violet-500 to-indigo-600',
    'from-rose-500 to-pink-600',
  ]
  return gradients[(id - 1) % gradients.length]
}

// ─── Empty form ───────────────────────────────────────────────────────────────
function emptyForm() {
  return {
    fullName: '', fatherName: '', dob: '', gender: '', maritalStatus: '',
    bloodGroup: '', religion: '', category: '', nationality: 'Indian', photo: '',
    mobile: '', alternateMobile: '', email: '',
    currentAddress: '', currentCity: '', currentState: '', currentPIN: '',
    permanentAddress: '', permanentCity: '', permanentState: '', permanentPIN: '',
    emergencyName: '', emergencyNumber: '', emergencyRelation: '',
    aadhaarNumber: '', panNumber: '', passportNumber: '', voterID: '', dlNumber: '',
    otherDocName: '', otherDocFile: '',
    bankName: '', accountNumber: '', confirmAccountNumber: '', ifscCode: '',
    branchName: '', accountType: '',
    employeeID: '', designation: '', department: '', employmentType: '',
    joiningDate: '', resignationDate: '', lastWorkingDate: '',
    employmentStatus: 'Active', qualification: '', experience: '',
    previousOrg: '', reportingManager: '', projectLocation: '',
    basicSalary: '', hra: '', da: '', conveyance: '', medical: '',
    specialAllowance: '', otherAllowances: '',
    pfDeduction: '', esiDeduction: '', professionalTax: '', tds: '', otherDeductions: '',
    assignedProject: '', projectRole: '', projectSiteLocation: '',
    hrCostToProject: '', assignmentStart: '', assignmentEnd: '', remarks: '',
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
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

// ─── Field helper ─────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 tracking-wide uppercase">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all'
const selectCls = inputCls + ' cursor-pointer'

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trash2 className="text-red-600 dark:text-red-400" size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Delete Staff Member?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Are you sure you want to remove <strong>{name}</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ─── Staff Form (Single Page) ─────────────────────────────────────────────────
function StaffForm({ initial, onSave, onClose, allProjects, existingIDs }) {
  const isEdit = !!initial
  const [form, setForm] = useState(initial ? { ...initial } : emptyForm())
  const [errors, setErrors] = useState({})
  const [sameAddress, setSameAddress] = useState(false)

  const addressMirrorMap = {
    currentAddress: 'permanentAddress',
    currentCity: 'permanentCity',
    currentState: 'permanentState',
    currentPIN: 'permanentPIN',
  }

  const set = useCallback((field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (sameAddress && field in addressMirrorMap) {
        next[addressMirrorMap[field]] = value
      }
      return next
    })
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e })
  }, [sameAddress])  // eslint-disable-line react-hooks/exhaustive-deps

  // Copy address fields when checkbox is first toggled on
  useEffect(() => {
    if (sameAddress) {
      setForm(prev => ({
        ...prev,
        permanentAddress: prev.currentAddress,
        permanentCity: prev.currentCity,
        permanentState: prev.currentState,
        permanentPIN: prev.currentPIN,
      }))
    }
  }, [sameAddress])

  const gross = calcGross(form)
  const deductions = calcDeductions(form)
  const net = gross - deductions

  function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set('photo', ev.target.result)
    reader.onerror = () => alert('Failed to read image file. Please try again with a valid image.')
    reader.readAsDataURL(file)
  }

  function validate() {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Required'
    if (!form.fatherName.trim()) e.fatherName = 'Required'
    if (!form.dob) e.dob = 'Required'
    if (!form.gender) e.gender = 'Required'
    if (!form.mobile.trim()) e.mobile = 'Required'
    else if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter valid 10-digit number'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.currentAddress.trim()) e.currentAddress = 'Required'
    if (!form.currentCity.trim()) e.currentCity = 'Required'
    if (!form.currentState.trim()) e.currentState = 'Required'
    if (!form.currentPIN.trim()) e.currentPIN = 'Required'
    if (!form.aadhaarNumber.trim()) e.aadhaarNumber = 'Required'
    if (!form.panNumber.trim()) e.panNumber = 'Required'
    if (!form.bankName.trim()) e.bankName = 'Required'
    if (!form.accountNumber.trim()) e.accountNumber = 'Required'
    if (!form.confirmAccountNumber.trim()) e.confirmAccountNumber = 'Required'
    else if (form.accountNumber !== form.confirmAccountNumber) e.confirmAccountNumber = 'Account numbers do not match'
    if (!form.ifscCode.trim()) e.ifscCode = 'Required'
    if (!form.employeeID.trim()) e.employeeID = 'Required'
    if (!form.designation.trim()) e.designation = 'Required'
    if (!form.department.trim()) e.department = 'Required'
    if (!form.employmentType) e.employmentType = 'Required'
    if (!form.joiningDate) e.joiningDate = 'Required'
    if (!form.employmentStatus) e.employmentStatus = 'Required'
    if (!form.qualification.trim()) e.qualification = 'Required'
    if (!form.projectLocation.trim()) e.projectLocation = 'Required'
    if (!form.basicSalary) e.basicSalary = 'Required'
    if (!form.projectSiteLocation.trim()) e.projectSiteLocation = 'Required'
    if (!form.hrCostToProject) e.hrCostToProject = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSave(form)
  }

  function autoGenID() {
    let candidate
    let attempts = 0
    do {
      candidate = `AIILSG-${String(Math.floor(Math.random() * 900) + 100)}`
      attempts++
    } while (existingIDs.includes(candidate) && attempts < 1000)
    set('employeeID', candidate)
  }

  function SecHeader({ title, icon: Icon }) {
    return (
      <div className="col-span-full flex items-center gap-3 pt-5 pb-2 border-b-2 border-indigo-100 dark:border-indigo-900/50 mb-2 mt-1">
        {Icon && (
          <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center shrink-0">
            <Icon size={14} className="text-indigo-600 dark:text-indigo-400" />
          </div>
        )}
        <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">{title}</h3>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-t-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-indigo-200 uppercase">All India Institute of Local Self Government</p>
              <h2 className="text-xl font-bold mt-0.5">{isEdit ? 'Edit Staff Member' : 'Staff Details Form'}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">

          {/* Personal Details + Photo */}
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-indigo-100 dark:border-indigo-900/50 mb-4">
                <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center shrink-0">
                  <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <input className={inputCls} value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="e.g. Sri Ramesh Kumar" />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </Field>
                <Field label="Father's / Husband's Name" required>
                  <input className={inputCls} value={form.fatherName} onChange={e => set('fatherName', e.target.value)} placeholder="Father's or Husband's name" />
                  {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
                </Field>
                <Field label="Date of Birth" required>
                  <input type="date" className={inputCls} value={form.dob} onChange={e => set('dob', e.target.value)} />
                  {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                </Field>
                <Field label="Age" hint="Auto-calculated from DOB">
                  <div className={inputCls + ' bg-gray-100 dark:bg-gray-800 cursor-not-allowed'}>
                    {form.dob ? `${calcAge(form.dob)} years` : '—'}
                  </div>
                </Field>
                <Field label="Gender" required>
                  <select className={selectCls} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select Gender</option>
                    {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </Field>
                <Field label="Marital Status">
                  <select className={selectCls} value={form.maritalStatus} onChange={e => set('maritalStatus', e.target.value)}>
                    <option value="">Select</option>
                    {['Single', 'Married', 'Divorced', 'Widowed'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Blood Group">
                  <select className={selectCls} value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Religion">
                  <input className={inputCls} value={form.religion} onChange={e => set('religion', e.target.value)} placeholder="e.g. Hindu, Muslim, Christian" />
                </Field>
                <Field label="Category">
                  <select className={selectCls} value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Select</option>
                    {['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Nationality">
                  <input className={inputCls} value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="Indian" />
                </Field>
              </div>
            </div>

            {/* Photo Box */}
            <div className="shrink-0 flex flex-col items-center gap-2 pt-12">
              <div
                className="w-[150px] h-[180px] rounded-xl border-4 border-indigo-200 dark:border-indigo-700 bg-gray-100 dark:bg-gray-700 overflow-hidden flex flex-col items-center justify-center cursor-pointer shadow-md relative group"
                onClick={() => document.getElementById('staff-photo-input').click()}
              >
                {form.photo ? (
                  <img src={form.photo} alt="Staff Photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-2 p-3">
                    <User size={40} className="opacity-30" />
                    <span className="text-xs text-center text-gray-400">Upload Photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-white text-xs font-semibold text-center px-2">Click to Change</span>
                </div>
              </div>
              <input
                id="staff-photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <p className="text-xs text-gray-400 text-center leading-relaxed">Passport Size Photo<span className="block">150×180px</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Contact Details */}
            <SecHeader title="Contact Details" icon={Phone} />
            <Field label="Mobile Number" required>
              <input className={inputCls} value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="10-digit mobile" maxLength={10} />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </Field>
            <Field label="Alternate Mobile">
              <input className={inputCls} value={form.alternateMobile} onChange={e => set('alternateMobile', e.target.value)} placeholder="Optional" maxLength={10} />
            </Field>
            <Field label="Email ID" required>
              <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </Field>
            <div className="col-span-full border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wider">Current Address</p>
            </div>
            <div className="col-span-full">
              <Field label="Current Address" required>
                <textarea className={inputCls} rows={2} value={form.currentAddress} onChange={e => set('currentAddress', e.target.value)} placeholder="House/Flat No., Street, Area" />
                {errors.currentAddress && <p className="text-red-500 text-xs mt-1">{errors.currentAddress}</p>}
              </Field>
            </div>
            <Field label="City" required>
              <input className={inputCls} value={form.currentCity} onChange={e => set('currentCity', e.target.value)} placeholder="City" />
              {errors.currentCity && <p className="text-red-500 text-xs mt-1">{errors.currentCity}</p>}
            </Field>
            <Field label="State" required>
              <input className={inputCls} value={form.currentState} onChange={e => set('currentState', e.target.value)} placeholder="State" />
              {errors.currentState && <p className="text-red-500 text-xs mt-1">{errors.currentState}</p>}
            </Field>
            <Field label="PIN Code" required>
              <input className={inputCls} value={form.currentPIN} onChange={e => set('currentPIN', e.target.value)} placeholder="6-digit PIN" maxLength={6} />
              {errors.currentPIN && <p className="text-red-500 text-xs mt-1">{errors.currentPIN}</p>}
            </Field>
            <div className="col-span-full border-t border-gray-100 dark:border-gray-700 pt-3 mt-1 flex items-center gap-3">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex-1">Permanent Address</p>
              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                <input type="checkbox" checked={sameAddress} onChange={e => setSameAddress(e.target.checked)} className="rounded" />
                Same as Current Address
              </label>
            </div>
            <div className="col-span-full">
              <Field label="Permanent Address">
                <textarea className={inputCls} rows={2} value={form.permanentAddress} onChange={e => set('permanentAddress', e.target.value)} placeholder="House/Flat No., Street, Area" />
              </Field>
            </div>
            <Field label="Permanent City">
              <input className={inputCls} value={form.permanentCity} onChange={e => set('permanentCity', e.target.value)} placeholder="City" />
            </Field>
            <Field label="Permanent State">
              <input className={inputCls} value={form.permanentState} onChange={e => set('permanentState', e.target.value)} placeholder="State" />
            </Field>
            <Field label="Permanent PIN Code">
              <input className={inputCls} value={form.permanentPIN} onChange={e => set('permanentPIN', e.target.value)} placeholder="6-digit PIN" maxLength={6} />
            </Field>
            <div className="col-span-full border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wider">Emergency Contact</p>
            </div>
            <Field label="Emergency Contact Name">
              <input className={inputCls} value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Emergency Contact Number">
              <input className={inputCls} value={form.emergencyNumber} onChange={e => set('emergencyNumber', e.target.value)} placeholder="Mobile number" maxLength={10} />
            </Field>
            <Field label="Relation">
              <input className={inputCls} value={form.emergencyRelation} onChange={e => set('emergencyRelation', e.target.value)} placeholder="e.g. Spouse, Father, Mother" />
            </Field>

            {/* Identity Documents */}
            <SecHeader title="Identity Documents" icon={CreditCard} />
            <Field label="Aadhaar Number" required>
              <input className={inputCls} value={form.aadhaarNumber} onChange={e => set('aadhaarNumber', e.target.value)} placeholder="XXXX XXXX XXXX" maxLength={14} />
              {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber}</p>}
            </Field>
            <Field label="Aadhaar Card Upload">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className={inputCls + ' file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-xs file:font-semibold file:px-3 file:py-1'} />
            </Field>
            <Field label="PAN Number" required>
              <input className={inputCls} value={form.panNumber} onChange={e => set('panNumber', e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} />
              {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
            </Field>
            <Field label="PAN Card Upload">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className={inputCls + ' file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-xs file:font-semibold file:px-3 file:py-1'} />
            </Field>
            <Field label="Passport Number">
              <input className={inputCls} value={form.passportNumber} onChange={e => set('passportNumber', e.target.value.toUpperCase())} placeholder="e.g. N1234567" />
            </Field>
            <Field label="Passport Upload">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className={inputCls + ' file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-xs file:font-semibold file:px-3 file:py-1'} />
            </Field>
            <Field label="Voter ID Number">
              <input className={inputCls} value={form.voterID} onChange={e => set('voterID', e.target.value.toUpperCase())} placeholder="Voter ID" />
            </Field>
            <Field label="Voter ID Upload">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className={inputCls + ' file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-xs file:font-semibold file:px-3 file:py-1'} />
            </Field>
            <Field label="Driving License Number">
              <input className={inputCls} value={form.dlNumber} onChange={e => set('dlNumber', e.target.value.toUpperCase())} placeholder="DL Number" />
            </Field>
            <Field label="DL Upload">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className={inputCls + ' file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-xs file:font-semibold file:px-3 file:py-1'} />
            </Field>
            <Field label="Other Document Name">
              <input className={inputCls} value={form.otherDocName || ''} onChange={e => set('otherDocName', e.target.value)} placeholder="e.g. Birth Certificate" />
            </Field>
            <Field label="Other Document Upload">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className={inputCls + ' file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-xs file:font-semibold file:px-3 file:py-1'} />
            </Field>

            {/* Bank Details */}
            <SecHeader title="Bank Details" icon={Building2} />
            <Field label="Bank Name" required>
              <input className={inputCls} value={form.bankName} onChange={e => set('bankName', e.target.value)} placeholder="e.g. State Bank of India" />
              {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
            </Field>
            <Field label="Account Type">
              <select className={selectCls} value={form.accountType} onChange={e => set('accountType', e.target.value)}>
                <option value="">Select</option>
                {['Savings', 'Current'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Account Number" required>
              <input className={inputCls} value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="Account number" />
              {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
            </Field>
            <Field label="Confirm Account Number" required>
              <input className={inputCls} value={form.confirmAccountNumber} onChange={e => set('confirmAccountNumber', e.target.value)} placeholder="Re-enter account number" />
              {errors.confirmAccountNumber && <p className="text-red-500 text-xs mt-1">{errors.confirmAccountNumber}</p>}
            </Field>
            <Field label="IFSC Code" required>
              <input className={inputCls} value={form.ifscCode} onChange={e => set('ifscCode', e.target.value.toUpperCase())} placeholder="e.g. SBIN0004631" maxLength={11} />
              {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
            </Field>
            <Field label="Branch Name">
              <input className={inputCls} value={form.branchName} onChange={e => set('branchName', e.target.value)} placeholder="Branch name" />
            </Field>
            <div className="col-span-full">
              <Field label="Cancelled Cheque Upload">
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className={inputCls + ' file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-xs file:font-semibold file:px-3 file:py-1'} />
              </Field>
            </div>

            {/* Employment Details */}
            <SecHeader title="Employment Details" icon={Briefcase} />
            <Field label="Employee ID / Code" required>
              <div className="flex gap-2">
                <input className={inputCls} value={form.employeeID} onChange={e => set('employeeID', e.target.value)} placeholder="e.g. AIILSG-001" />
                <button type="button" onClick={autoGenID} className="px-3 py-2 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-200 transition-all whitespace-nowrap font-semibold">Auto</button>
              </div>
              {errors.employeeID && <p className="text-red-500 text-xs mt-1">{errors.employeeID}</p>}
            </Field>
            <Field label="Designation" required>
              <input className={inputCls} value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="e.g. Project Manager" />
              {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
            </Field>
            <Field label="Department" required>
              <select className={selectCls} value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Select Department</option>
                {['Management', 'Projects', 'Technical', 'Field', 'Finance', 'HR', 'Admin', 'IT'].map(d => <option key={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </Field>
            <Field label="Employment Type" required>
              <select className={selectCls} value={form.employmentType} onChange={e => set('employmentType', e.target.value)}>
                <option value="">Select</option>
                {['Full-time', 'Part-time', 'Contract', 'Consultant', 'Intern'].map(t => <option key={t}>{t}</option>)}
              </select>
              {errors.employmentType && <p className="text-red-500 text-xs mt-1">{errors.employmentType}</p>}
            </Field>
            <Field label="Joining Date" required>
              <input type="date" className={inputCls} value={form.joiningDate} onChange={e => set('joiningDate', e.target.value)} />
              {errors.joiningDate && <p className="text-red-500 text-xs mt-1">{errors.joiningDate}</p>}
            </Field>
            <Field label="Employment Status" required>
              <select className={selectCls} value={form.employmentStatus} onChange={e => set('employmentStatus', e.target.value)}>
                <option value="">Select</option>
                {['Active', 'Inactive', 'On Notice', 'Terminated', 'Resigned'].map(s => <option key={s}>{s}</option>)}
              </select>
              {errors.employmentStatus && <p className="text-red-500 text-xs mt-1">{errors.employmentStatus}</p>}
            </Field>
            <Field label="Resignation Date">
              <input type="date" className={inputCls} value={form.resignationDate} onChange={e => set('resignationDate', e.target.value)} />
            </Field>
            <Field label="Last Working Date">
              <input type="date" className={inputCls} value={form.lastWorkingDate} onChange={e => set('lastWorkingDate', e.target.value)} />
            </Field>
            <Field label="Qualification" required>
              <input className={inputCls} value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="e.g. B.Tech, MBA, MA" />
              {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
            </Field>
            <Field label="Experience (Years)">
              <input type="number" min={0} className={inputCls} value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="Years of experience" />
            </Field>
            <Field label="Previous Organization">
              <input className={inputCls} value={form.previousOrg} onChange={e => set('previousOrg', e.target.value)} placeholder="Last employer name" />
            </Field>
            <Field label="Reporting Manager">
              <input className={inputCls} value={form.reportingManager} onChange={e => set('reportingManager', e.target.value)} placeholder="Manager name" />
            </Field>
            <Field label="Project Location (Posted At)" required>
              <input className={inputCls} value={form.projectLocation} onChange={e => set('projectLocation', e.target.value)} placeholder="City/Location where posted" />
              {errors.projectLocation && <p className="text-red-500 text-xs mt-1">{errors.projectLocation}</p>}
            </Field>

            {/* Salary Details */}
            <SecHeader title="Salary Details" icon={IndianRupee} />
            <div className="col-span-full">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wider">Earnings</p>
            </div>
            <Field label="Basic Salary (₹)" required>
              <input type="number" min={0} className={inputCls} value={form.basicSalary} onChange={e => set('basicSalary', e.target.value)} placeholder="0" />
              {errors.basicSalary && <p className="text-red-500 text-xs mt-1">{errors.basicSalary}</p>}
            </Field>
            <Field label="HRA (₹)">
              <input type="number" min={0} className={inputCls} value={form.hra} onChange={e => set('hra', e.target.value)} placeholder="0" />
            </Field>
            <Field label="DA – Dearness Allowance (₹)">
              <input type="number" min={0} className={inputCls} value={form.da} onChange={e => set('da', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Conveyance Allowance (₹)">
              <input type="number" min={0} className={inputCls} value={form.conveyance} onChange={e => set('conveyance', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Medical Allowance (₹)">
              <input type="number" min={0} className={inputCls} value={form.medical} onChange={e => set('medical', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Special Allowance (₹)">
              <input type="number" min={0} className={inputCls} value={form.specialAllowance} onChange={e => set('specialAllowance', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Other Allowances (₹)">
              <input type="number" min={0} className={inputCls} value={form.otherAllowances} onChange={e => set('otherAllowances', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Gross Salary (₹)" hint="Auto-calculated">
              <div className={inputCls + ' bg-indigo-50 dark:bg-indigo-900/20 font-semibold text-indigo-700 dark:text-indigo-300 cursor-not-allowed'}>
                {fmtCur(gross)}
              </div>
            </Field>
            <div className="col-span-full">
              <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-3 uppercase tracking-wider mt-2">Deductions</p>
            </div>
            <Field label="PF Deduction (₹)">
              <input type="number" min={0} className={inputCls} value={form.pfDeduction} onChange={e => set('pfDeduction', e.target.value)} placeholder="0" />
            </Field>
            <Field label="ESI Deduction (₹)">
              <input type="number" min={0} className={inputCls} value={form.esiDeduction} onChange={e => set('esiDeduction', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Professional Tax (₹)">
              <input type="number" min={0} className={inputCls} value={form.professionalTax} onChange={e => set('professionalTax', e.target.value)} placeholder="0" />
            </Field>
            <Field label="TDS (₹)">
              <input type="number" min={0} className={inputCls} value={form.tds} onChange={e => set('tds', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Other Deductions (₹)">
              <input type="number" min={0} className={inputCls} value={form.otherDeductions} onChange={e => set('otherDeductions', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Total Deductions (₹)" hint="Auto-calculated">
              <div className={inputCls + ' bg-red-50 dark:bg-red-900/20 font-semibold text-red-700 dark:text-red-300 cursor-not-allowed'}>
                {fmtCur(deductions)}
              </div>
            </Field>
            <div className="col-span-full">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Net Salary (Take Home)</span>
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{fmtCur(net)}</span>
                </div>
              </div>
            </div>

            {/* Project Assignment */}
            <SecHeader title="Project Assignment" icon={FileText} />
            <div className="col-span-full">
              <Field label="Assigned Project">
                <select className={selectCls} value={form.assignedProject} onChange={e => set('assignedProject', e.target.value)}>
                  <option value="">— No project assigned —</option>
                  {allProjects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Project Role">
              <input className={inputCls} value={form.projectRole} onChange={e => set('projectRole', e.target.value)} placeholder="e.g. Site Engineer, Project Manager" />
            </Field>
            <Field label="Project Location / Site" required>
              <input className={inputCls} value={form.projectSiteLocation} onChange={e => set('projectSiteLocation', e.target.value)} placeholder="City or site location" />
              {errors.projectSiteLocation && <p className="text-red-500 text-xs mt-1">{errors.projectSiteLocation}</p>}
            </Field>
            <Field label="HR Cost to Project (₹/month)" required>
              <input type="number" min={0} className={inputCls} value={form.hrCostToProject} onChange={e => set('hrCostToProject', e.target.value)} placeholder="0" />
              {errors.hrCostToProject && <p className="text-red-500 text-xs mt-1">{errors.hrCostToProject}</p>}
            </Field>
            <Field label="Assignment Start Date">
              <input type="date" className={inputCls} value={form.assignmentStart} onChange={e => set('assignmentStart', e.target.value)} />
            </Field>
            <Field label="Assignment End Date">
              <input type="date" className={inputCls} value={form.assignmentEnd} onChange={e => set('assignmentEnd', e.target.value)} />
            </Field>
            <div className="col-span-full">
              <Field label="Remarks">
                <textarea className={inputCls} rows={3} value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="Additional notes or remarks" />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg">
            <CheckCircle size={16} /> {isEdit ? 'Update Staff' : 'Save Staff'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Staff Profile View ───────────────────────────────────────────────────────
function StaffProfile({ staff, onClose, onEdit }) {
  const gross = calcGross(staff)
  const deductions = calcDeductions(staff)
  const net = gross - deductions

  function InfoRow({ label, value }) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{value || '—'}</span>
      </div>
    )
  }

  function SectionTitle({ title }) {
    return (
      <div className="col-span-full flex items-center gap-3 pt-5 pb-2 border-b-2 border-indigo-100 dark:border-indigo-900/50 mb-2">
        <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">{title}</h3>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-start justify-center p-4 overflow-y-auto">
      <div className="staff-print-area bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* AIILSG Letterhead Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-t-2xl p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-all">
            <X size={18} />
          </button>
          <div className="text-center mb-5">
            <p className="text-xs font-bold tracking-widest text-indigo-200 uppercase mb-1">All India Institute of Local Self Government</p>
            <h2 className="text-xl font-bold tracking-wide">STAFF DETAILS</h2>
            <div className="w-24 h-0.5 bg-white/40 mx-auto mt-2" />
          </div>
          <div className="flex items-start gap-6">
            {/* Photo */}
            <div className="w-[100px] h-[120px] rounded-xl border-4 border-white/40 bg-white/10 overflow-hidden flex items-center justify-center shrink-0 shadow-xl">
              {staff.photo ? (
                <img src={staff.photo} alt={staff.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${avatarGradient(staff.id)} flex items-center justify-center text-3xl font-bold text-white`}>
                  {initials(staff.fullName)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold truncate">{staff.fullName}</h3>
              <p className="text-indigo-200 mt-0.5">{staff.designation}</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-3 text-sm">
                <div>
                  <span className="text-indigo-300 text-xs">Employee ID</span>
                  <p className="font-semibold">{staff.employeeID || '—'}</p>
                </div>
                <div>
                  <span className="text-indigo-300 text-xs">Department</span>
                  <p className="font-semibold">{staff.department || '—'}</p>
                </div>
                <div>
                  <span className="text-indigo-300 text-xs">Status</span>
                  <p><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(staff.employmentStatus)}`}>{staff.employmentStatus}</span></p>
                </div>
                <div>
                  <span className="text-indigo-300 text-xs">Location</span>
                  <p className="font-semibold">{staff.projectLocation || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All sections in one scrollable view */}
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

            {/* Personal Details */}
            <SectionTitle title="Personal Details" />
            <InfoRow label="Full Name" value={staff.fullName} />
            <InfoRow label="Father's / Husband's Name" value={staff.fatherName} />
            <InfoRow label="Date of Birth" value={staff.dob ? formatDate(staff.dob) : ''} />
            <InfoRow label="Age" value={staff.dob ? `${calcAge(staff.dob)} years` : ''} />
            <InfoRow label="Gender" value={staff.gender} />
            <InfoRow label="Marital Status" value={staff.maritalStatus} />
            <InfoRow label="Blood Group" value={staff.bloodGroup} />
            <InfoRow label="Religion" value={staff.religion} />
            <InfoRow label="Category" value={staff.category} />
            <InfoRow label="Nationality" value={staff.nationality} />

            {/* Contact Details */}
            <SectionTitle title="Contact Details" />
            <InfoRow label="Mobile" value={staff.mobile} />
            <InfoRow label="Alternate Mobile" value={staff.alternateMobile} />
            <InfoRow label="Email" value={staff.email} />
            <div className="col-span-full border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wider">Current Address</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Address" value={staff.currentAddress} />
                <InfoRow label="City" value={staff.currentCity} />
                <InfoRow label="State" value={staff.currentState} />
                <InfoRow label="PIN Code" value={staff.currentPIN} />
              </div>
            </div>
            <div className="col-span-full border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wider">Permanent Address</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Address" value={staff.permanentAddress} />
                <InfoRow label="City" value={staff.permanentCity} />
                <InfoRow label="State" value={staff.permanentState} />
                <InfoRow label="PIN Code" value={staff.permanentPIN} />
              </div>
            </div>
            <div className="col-span-full border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wider">Emergency Contact</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoRow label="Name" value={staff.emergencyName} />
                <InfoRow label="Number" value={staff.emergencyNumber} />
                <InfoRow label="Relation" value={staff.emergencyRelation} />
              </div>
            </div>

            {/* Identity Documents */}
            <SectionTitle title="Identity Documents" />
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aadhaar Number</span>
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mt-1 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-lg text-xs font-bold">ID</span>
                {staff.aadhaarNumber || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PAN Number</span>
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mt-1 flex items-center gap-2">
                <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-lg text-xs font-bold">PAN</span>
                {staff.panNumber || '—'}
              </p>
            </div>
            <InfoRow label="Passport Number" value={staff.passportNumber} />
            <InfoRow label="Voter ID" value={staff.voterID} />
            <InfoRow label="Driving License" value={staff.dlNumber} />
            <InfoRow label="Other Document" value={staff.otherDocName} />

            {/* Bank Details */}
            <SectionTitle title="Bank Details" />
            <InfoRow label="Bank Name" value={staff.bankName} />
            <InfoRow label="Account Type" value={staff.accountType} />
            <InfoRow label="Account Number" value={staff.accountNumber} />
            <InfoRow label="IFSC Code" value={staff.ifscCode} />
            <InfoRow label="Branch Name" value={staff.branchName} />

            {/* Employment Details */}
            <SectionTitle title="Employment Details" />
            <InfoRow label="Employee ID" value={staff.employeeID} />
            <InfoRow label="Designation" value={staff.designation} />
            <InfoRow label="Department" value={staff.department} />
            <InfoRow label="Employment Type" value={staff.employmentType} />
            <InfoRow label="Employment Status" value={staff.employmentStatus} />
            <InfoRow label="Joining Date" value={staff.joiningDate ? formatDate(staff.joiningDate) : ''} />
            <InfoRow label="Resignation Date" value={staff.resignationDate ? formatDate(staff.resignationDate) : ''} />
            <InfoRow label="Last Working Date" value={staff.lastWorkingDate ? formatDate(staff.lastWorkingDate) : ''} />
            <InfoRow label="Qualification" value={staff.qualification} />
            <InfoRow label="Experience" value={staff.experience ? `${staff.experience} years` : ''} />
            <InfoRow label="Previous Organization" value={staff.previousOrg} />
            <InfoRow label="Reporting Manager" value={staff.reportingManager} />
            <InfoRow label="Project Location" value={staff.projectLocation} />

            {/* Salary Details */}
            <SectionTitle title="Salary Details" />
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-center">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Gross Salary</p>
                <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{fmtCur(gross)}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Deductions</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">{fmtCur(deductions)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Net Salary</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{fmtCur(net)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Earnings</p>
              <div className="space-y-1.5 text-sm">
                {[
                  ['Basic Salary', staff.basicSalary],
                  ['HRA', staff.hra],
                  ['DA', staff.da],
                  ['Conveyance', staff.conveyance],
                  ['Medical', staff.medical],
                  ['Special Allowance', staff.specialAllowance],
                  ['Other Allowances', staff.otherAllowances],
                ].filter(([, v]) => Number(v) > 0).map(([label, val]) => (
                  <div key={label} className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>{label}</span><span className="font-semibold">{fmtCur(val)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Deductions</p>
              <div className="space-y-1.5 text-sm">
                {[
                  ['PF', staff.pfDeduction],
                  ['ESI', staff.esiDeduction],
                  ['Professional Tax', staff.professionalTax],
                  ['TDS', staff.tds],
                  ['Other Deductions', staff.otherDeductions],
                ].filter(([, v]) => Number(v) > 0).map(([label, val]) => (
                  <div key={label} className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>{label}</span><span className="font-semibold text-red-600 dark:text-red-400">- {fmtCur(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Assignment */}
            <SectionTitle title="Project Assignment" />
            <div className="col-span-full">
              <InfoRow label="Assigned Project" value={staff.assignedProject} />
            </div>
            <InfoRow label="Project Role" value={staff.projectRole} />
            <InfoRow label="Project Site Location" value={staff.projectSiteLocation} />
            <InfoRow label="HR Cost to Project (₹/month)" value={fmtCur(staff.hrCostToProject)} />
            <InfoRow label="Assignment Start Date" value={staff.assignmentStart ? formatDate(staff.assignmentStart) : ''} />
            <InfoRow label="Assignment End Date" value={staff.assignmentEnd ? formatDate(staff.assignmentEnd) : ''} />
            <div className="col-span-full">
              <InfoRow label="Remarks" value={staff.remarks} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            ← Back to Staff List
          </button>
          <div className="flex gap-3">
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              <Printer size={14} /> Print
            </button>
            <button onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all">
              <Pencil size={14} /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Staff Card ───────────────────────────────────────────────────────────────
function StaffCard({ member, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${avatarGradient(member.id)}`} />
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          {member.photo ? (
            <img src={member.photo} alt={member.fullName} className="w-14 h-14 rounded-xl object-cover shadow-md shrink-0 border-2 border-indigo-200 dark:border-indigo-700" />
          ) : (
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${avatarGradient(member.id)} flex items-center justify-center text-xl font-bold text-white shadow-md shrink-0`}>
              {initials(member.fullName)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm truncate">{member.fullName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.designation}</p>
            <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(member.employmentStatus)}`}>
              {member.employmentStatus}
            </span>
          </div>
        </div>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Building2 size={12} className="shrink-0" />
            <span className="truncate">{member.department} · {member.employmentType}</span>
          </div>
          {member.assignedProject && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Briefcase size={12} className="shrink-0" />
              <span className="truncate">{member.assignedProject.split('–')[0].trim()}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={12} className="shrink-0" />
            <span>{member.projectLocation || member.projectSiteLocation || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <IndianRupee size={12} className="shrink-0" />
            <span>{fmtCur(calcNet(member))}/month</span>
          </div>
        </div>
        <div className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
          <button onClick={() => onView(member)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
            <Eye size={12} /> View
          </button>
          <button onClick={() => onEdit(member)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all">
            <Pencil size={12} /> Edit
          </button>
          <button onClick={() => onDelete(member)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StaffPage() {
  const [staffList, setStaffList] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) return JSON.parse(saved)
    } catch (_) { /* ignore */ }
    return SAMPLE_STAFF
  })
  const [allProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('aiilsg_projects')
      if (saved) return JSON.parse(saved)
    } catch (_) { /* ignore */ }
    return sampleProjects
  })
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDept, setFilterDept] = useState('All')
  const [filterProject, setFilterProject] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [toasts, setToasts] = useState([])

  // Persist
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(staffList))
  }, [staffList])

  function toast(message, type = 'success') {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const allProjectNames = useMemo(() => {
    const names = [...new Set(staffList.map(s => s.assignedProject).filter(Boolean))]
    return ['All', ...names]
  }, [staffList])

  const filtered = useMemo(() => {
    return staffList.filter(s => {
      const q = search.toLowerCase()
      const matchSearch = !q || s.fullName.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q) || (s.assignedProject || '').toLowerCase().includes(q) || s.employeeID.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'All' || s.employmentStatus === filterStatus
      const matchDept = filterDept === 'All' || s.department === filterDept
      const matchProject = filterProject === 'All' || s.assignedProject === filterProject
      return matchSearch && matchStatus && matchDept && matchProject
    })
  }, [staffList, search, filterStatus, filterDept, filterProject])

  function handleSave(formData) {
    if (editTarget) {
      setStaffList(prev => prev.map(s => s.id === editTarget.id ? { ...formData, id: editTarget.id } : s))
      toast('Staff member updated successfully!')
    } else {
      const newId = Math.max(0, ...staffList.map(s => s.id)) + 1
      setStaffList(prev => [...prev, { ...formData, id: newId }])
      toast('New staff member added!')
    }
    setShowForm(false)
    setEditTarget(null)
  }

  function handleEdit(member) {
    setEditTarget(member)
    setViewTarget(null)
    setShowForm(true)
  }

  function handleDelete(member) {
    setDeleteTarget(member)
  }

  function confirmDelete() {
    setStaffList(prev => prev.filter(s => s.id !== deleteTarget.id))
    toast(`${deleteTarget.fullName} has been removed.`)
    setDeleteTarget(null)
  }

  const stats = useMemo(() => ({
    total: staffList.length,
    active: staffList.filter(s => s.employmentStatus === 'Active').length,
    onNotice: staffList.filter(s => s.employmentStatus === 'On Notice').length,
    totalSalary: staffList.reduce((sum, s) => sum + calcNet(s), 0),
  }), [staffList])

  return (
    <div className="space-y-6">
      {/* Toast */}
      <Toast toasts={toasts} />

      {/* Modals */}
      {showForm && (
        <StaffForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          allProjects={allProjects}
          existingIDs={staffList.filter(s => !editTarget || s.id !== editTarget.id).map(s => s.employeeID)}
        />
      )}
      {viewTarget && (
        <StaffProfile
          staff={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={() => handleEdit(viewTarget)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.fullName}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manpower / Staff</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage all staff members and their assignments</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={16} /> Add New Staff
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: stats.total, icon: Users, color: 'from-indigo-500 to-purple-600' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
          { label: 'On Notice', value: stats.onNotice, icon: AlertCircle, color: 'from-amber-500 to-orange-600' },
          { label: 'Monthly Payroll', value: fmtCur(stats.totalSalary), icon: IndianRupee, color: 'from-cyan-500 to-blue-600', isStr: true },
        ].map(({ label, value, icon: Icon, color, isStr }) => (
          <div key={label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon size={14} className="text-white" />
              </div>
            </div>
            <p className={`font-bold text-gray-800 dark:text-white ${isStr ? 'text-lg' : 'text-3xl'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
              placeholder="Search by name, designation, project, employee ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              <Filter size={15} /> Filters
            </button>
            <button onClick={() => setView(v => v === 'grid' ? 'table' : 'grid')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              {view === 'grid' ? <List size={15} /> : <LayoutGrid size={15} />}
              {view === 'grid' ? 'Table' : 'Grid'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Status</label>
              <select className={selectCls} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Department</label>
              <select className={selectCls} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                {ALL_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Project</label>
              <select className={selectCls} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
                {allProjectNames.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing <strong className="text-gray-800 dark:text-white">{filtered.length}</strong> of {staffList.length} staff members
        </p>
        {(search || filterStatus !== 'All' || filterDept !== 'All' || filterProject !== 'All') && (
          <button onClick={() => { setSearch(''); setFilterStatus('All'); setFilterDept('All'); setFilterProject('All') }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            Clear filters
          </button>
        )}
      </div>

      {/* Staff grid view */}
      {view === 'grid' && (
        filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users size={48} className="mb-3 opacity-30" />
            <p className="text-lg font-semibold">No staff found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(member => (
              <StaffCard
                key={member.id}
                member={member}
                onView={setViewTarget}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
      )}

      {/* Staff table view */}
      {view === 'table' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  {['Employee', 'Designation', 'Department', 'Project', 'Location', 'Net Salary', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <Users size={32} className="mx-auto mb-2 opacity-30" />
                      <p>No staff found</p>
                    </td>
                  </tr>
                ) : filtered.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {member.photo ? (
                          <img src={member.photo} alt={member.fullName} className="w-9 h-9 rounded-xl object-cover shrink-0 border border-indigo-200 dark:border-indigo-700" />
                        ) : (
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient(member.id)} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                            {initials(member.fullName)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{member.fullName}</p>
                          <p className="text-xs text-gray-400">{member.employeeID}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{member.designation}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{member.department}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 dark:text-gray-400 text-xs">{member.assignedProject ? member.assignedProject.split('–')[0].trim() : '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{member.projectLocation || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{fmtCur(calcNet(member))}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(member.employmentStatus)}`}>
                        {member.employmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setViewTarget(member)} className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all" title="View">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleEdit(member)} className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(member)} className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
