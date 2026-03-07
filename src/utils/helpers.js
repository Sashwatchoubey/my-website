/**
 * Format a number as Indian currency (₹ with lakh/crore notation)
 */
export function formatCurrency(amount, compact = false) {
  if (compact) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
    if (amount >= 100000)   return `₹${(amount / 100000).toFixed(2)} L`
    if (amount >= 1000)     return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount}`
  }
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

/**
 * Format a date string to DD MMM YYYY
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Return Tailwind colour classes for a project status
 */
export function statusColor(status) {
  switch (status) {
    case 'Active':    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    case 'Completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    case 'Upcoming':  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    case 'On Hold':   return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    default:          return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

/**
 * Return a progress bar colour class
 */
export function progressColor(pct) {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-indigo-500'
  if (pct >= 25) return 'bg-amber-500'
  return 'bg-red-400'
}

/**
 * Get today's date in a friendly format
 */
export function todayFormatted() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Clamp a number between min and max
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}
