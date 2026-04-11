import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'

function TrendIndicator({ label, currentValue, previousValue, unit = '' }) {
  if (currentValue === null || currentValue === undefined) {
    return (
      <div className="rounded-lg bg-slate-50 p-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="mt-1 text-lg font-semibold text-slate-400">N/A</p>
      </div>
    )
  }

  const hasPrevious = previousValue !== null && previousValue !== undefined
  const isIncreasing = hasPrevious && currentValue > previousValue
  const isDecreasing = hasPrevious && currentValue < previousValue
  const delta = hasPrevious ? Math.abs(currentValue - previousValue).toFixed(1) : null

  return (
    <div className="rounded-lg bg-white border border-slate-100 p-3">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-lg font-bold text-slate-900">
          {typeof currentValue === 'number' ? currentValue.toFixed(1) : currentValue}
          <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
        </p>
        {hasPrevious && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            isIncreasing ? 'text-red-600' : isDecreasing ? 'text-emerald-600' : 'text-slate-400'
          }`}>
            {isIncreasing && <TrendingUp className="h-3 w-3" />}
            {isDecreasing && <TrendingDown className="h-3 w-3" />}
            {delta && <span>{delta}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

function RiskSummaryHero({ latestSnapshot, previousSnapshot }) {
  if (!latestSnapshot) return null

  const floodRisk = latestSnapshot.floodRiskIndex || 0
  const getRiskLevel = () => {
    if (floodRisk < 30) return { label: 'Low', color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' }
    if (floodRisk < 60) return { label: 'Moderate', color: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' }
    return { label: 'High', color: 'red', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' }
  }

  const riskLevel = getRiskLevel()

  const formatDate = (date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className={`mb-8 rounded-2xl ${riskLevel.bg} border-2 ${riskLevel.border} p-6 shadow-sm`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-3 rounded-xl bg-${riskLevel.color}-100`}>
              <Activity className={`h-6 w-6 text-${riskLevel.color}-600`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Risk Summary</h2>
              <p className="text-sm text-slate-600">Current hazard assessment overview</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-white border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Flood Risk Index</p>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-slate-900">{Math.round(floodRisk)}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${riskLevel.badge}`}>
                  {riskLevel.label}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${riskLevel.color}-500 transition-all duration-300`}
                  style={{ width: `${Math.min(floodRisk, 100)}%` }}
                ></div>
              </div>
            </div>

            <TrendIndicator
              label="Temperature"
              currentValue={latestSnapshot.temperature}
              previousValue={previousSnapshot?.temperature}
              unit="°C"
            />

            <TrendIndicator
              label="Earthquakes"
              currentValue={latestSnapshot.earthquakeCount}
              previousValue={previousSnapshot?.earthquakeCount}
              unit=""
            />

            <div className="rounded-lg bg-white border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Last Updated</p>
              <p className="text-sm font-bold text-slate-900">{formatDate(latestSnapshot.fetchedAt)}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(latestSnapshot.fetchedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskSummaryHero
