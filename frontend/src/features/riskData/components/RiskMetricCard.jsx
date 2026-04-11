import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

function formatValue(value, unit = '') {
  if (value === null || value === undefined || value === '') return 'N/A'
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
      return 'border-red-200 bg-red-50'
    case 'warning':
      return 'border-amber-200 bg-amber-50'
    case 'safe':
      return 'border-emerald-200 bg-emerald-50'
    default:
      return 'border-slate-200 bg-white'
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

  return (
    <div
      className={`rounded-2xl border ${colorClass} p-5 shadow-sm transition-all hover:shadow-md`}
      title={helperText || label}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {riskLevel !== 'neutral' && getRiskIcon(riskLevel)}
      </div>
      <h3 className={`text-2xl font-bold ${textColorClass}`}>
        {formatValue(value, unit)}
      </h3>
      {helperText ? (
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">{helperText}</p>
      ) : null}
      {riskLevel !== 'neutral' && (
        <p className="mt-2 text-xs font-medium">
          {riskLevel === 'danger' && <span className="text-red-600">⚠️ High Risk</span>}
          {riskLevel === 'warning' && <span className="text-amber-600">⚠️ Caution</span>}
          {riskLevel === 'safe' && <span className="text-emerald-600">✓ Safe</span>}
        </p>
      )}
    </div>
  )
}

export default RiskMetricCard
