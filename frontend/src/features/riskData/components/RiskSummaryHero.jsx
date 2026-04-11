import { TrendingUp, TrendingDown, Activity, Waves, Thermometer, CalendarClock } from 'lucide-react'

function TrendIndicator({ label, currentValue, previousValue, unit = '', icon: Icon }) {
  if (currentValue === null || currentValue === undefined) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/85 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-slate-400" />}
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        </div>
        <p className="mt-2 text-xl font-bold text-slate-400">N/A</p>
      </div>
    )
  }

  const hasPrevious = previousValue !== null && previousValue !== undefined
  const isIncreasing = hasPrevious && currentValue > previousValue
  const isDecreasing = hasPrevious && currentValue < previousValue
  const delta = hasPrevious ? Math.abs(currentValue - previousValue).toFixed(1) : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-slate-500" />}
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-extrabold leading-none text-slate-900">
          {typeof currentValue === 'number' ? currentValue.toFixed(1) : currentValue}
          <span className="ml-1 text-sm font-medium text-slate-500">{unit}</span>
        </p>
        {hasPrevious && (
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
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
    if (floodRisk < 30) {
      return {
        label: 'Low',
        wrapper: 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50',
        badge: 'bg-emerald-100 text-emerald-700',
        progress: 'bg-emerald-500',
      }
    }
    if (floodRisk < 60) {
      return {
        label: 'Moderate',
        wrapper: 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-50',
        badge: 'bg-amber-100 text-amber-700',
        progress: 'bg-amber-500',
      }
    }
    return {
      label: 'High',
      wrapper: 'border-red-200 bg-gradient-to-br from-rose-50 via-white to-red-50',
      badge: 'bg-red-100 text-red-700',
      progress: 'bg-red-500',
    }
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
    <div className={`mb-8 overflow-hidden rounded-3xl border p-6 shadow-sm ${riskLevel.wrapper}`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <Activity className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900">Risk Summary</h2>
              <p className="text-sm text-slate-600">Current hazard assessment overview</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <Waves className="h-4 w-4 text-slate-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Flood Risk Index</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black leading-none text-slate-900">{Math.round(floodRisk)}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${riskLevel.badge}`}>
                  {riskLevel.label}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all duration-500 ${riskLevel.progress}`}
                  style={{ width: `${Math.min(floodRisk, 100)}%` }}
                ></div>
              </div>
            </div>

            <TrendIndicator
              label="Temperature"
              currentValue={latestSnapshot.temperature}
              previousValue={previousSnapshot?.temperature}
              unit="°C"
              icon={Thermometer}
            />

            <TrendIndicator
              label="Earthquakes"
              currentValue={latestSnapshot.earthquakeCount}
              previousValue={previousSnapshot?.earthquakeCount}
              unit=""
              icon={Activity}
            />

            <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-slate-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Updated</p>
              </div>
              <p className="text-xl font-extrabold text-slate-900">{formatDate(latestSnapshot.fetchedAt)}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(latestSnapshot.fetchedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskSummaryHero
