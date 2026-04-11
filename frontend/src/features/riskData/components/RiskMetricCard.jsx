import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

function formatValue(value, unit = '') {
  if (value === null || value === undefined || value === '') return 'N/A'
  if (typeof value === 'number') {
    return `${Number(value.toFixed(2)).toLocaleString()}${unit}`
  }
  return `${value}${unit}`
}

// Determine risk level based on typical thresholds
function getRiskLevel(label, value) {
  if (value === null || value === undefined) return 'neutral'

  const thresholds = {
    'Rainfall': { warning: 5, danger: 15 },
    'Wind Speed': { warning: 10, danger: 20 },
    'Flood Risk Index': { warning: 50, danger: 75 },
    'Earthquake Count': { warning: 1, danger: 5 },
    'Humidity': { warning: 80, danger: 95 },
    'Temperature': { warning: 35, danger: 40 },
    'Cloudiness': { warning: 70, danger: 90 },
  }

  const threshold = thresholds[label]
  if (!threshold) return 'neutral'

  if (value >= threshold.danger) return 'danger'
  if (value >= threshold.warning) return 'warning'
  return 'safe'
}

function getColorClass(riskLevel) {
  switch (riskLevel) {
    case 'danger':
      return 'border-red-200 bg-linear-to-br from-red-50 to-rose-50'
    case 'warning':
      return 'border-amber-200 bg-linear-to-br from-amber-50 to-yellow-50'
    case 'safe':
      return 'border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50'
    default:
      return 'border-slate-200 bg-linear-to-br from-white to-slate-50'
  }
}

function getTextColorClass(riskLevel) {
  switch (riskLevel) {
    case 'danger':
      return 'text-red-900'
    case 'warning':
      return 'text-amber-900'
    case 'safe':
      return 'text-emerald-900'
    default:
      return 'text-slate-900'
  }
}

function getRiskIcon(riskLevel) {
  switch (riskLevel) {
    case 'danger':
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-amber-500" />
    case 'safe':
      return <CheckCircle className="w-4 h-4 text-emerald-500" />
    default:
      return null
  }
}

function RiskMetricCard({ label, value, unit = '', helperText = '' }) {
  const riskLevel = getRiskLevel(label, value)
  const colorClass = getColorClass(riskLevel)
  const textColorClass = getTextColorClass(riskLevel)

  const riskBadgeClass = {
    danger: 'bg-red-100 text-red-700 border border-red-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    safe: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
  }[riskLevel]

  const riskLabel = {
    danger: 'High Risk',
    warning: 'Caution',
    safe: 'Safe',
    neutral: 'No Risk Rule',
  }[riskLevel]

  return (
    <div
      className={`group rounded-2xl border ${colorClass} p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
      title={helperText || label}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold tracking-wide text-slate-600">{label}</p>
        <div className="mt-0.5">{riskLevel !== 'neutral' ? getRiskIcon(riskLevel) : null}</div>
      </div>

      <h3 className={`text-4xl font-black leading-none ${textColorClass}`}>
        {formatValue(value, unit)}
      </h3>

      {helperText ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{helperText}</p>
      ) : null}

      <div className="mt-3">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${riskBadgeClass}`}>
          {riskLabel}
        </span>
      </div>
    </div>
  )
}

export default RiskMetricCard
