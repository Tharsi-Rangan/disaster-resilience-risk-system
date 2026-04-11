import { TrendingUp, TrendingDown } from 'lucide-react'

function TrendComparison({ current, previous }) {
  if (!current || !previous) return null

  const calculateTrend = (currentVal, previousVal) => {
    if (currentVal === null || previousVal === null) return null
    const diff = currentVal - previousVal
    const percentChange = ((diff / Math.abs(previousVal)) * 100).toFixed(1)
    return { diff, percentChange, isIncrease: diff > 0 }
  }

  const trends = [
    {
      label: 'Temperature',
      unit: '°C',
      current: current.temperature,
      previous: previous.temperature,
      isDangerous: (val) => val > 35 // high heat risk
    },
    {
      label: 'Humidity',
      unit: '%',
      current: current.humidity,
      previous: previous.humidity,
      isDangerous: (val) => val > 80 // high moisture risk
    },
    {
      label: 'Flood Risk',
      unit: 'Index',
      current: current.floodRiskIndex,
      previous: previous.floodRiskIndex,
      isDangerous: (val) => val > 60
    }
  ]

  const activeTrends = trends.filter((t) => {
    const trend = calculateTrend(t.current, t.previous)
    return trend !== null
  })

  if (activeTrends.length === 0) return null

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <div className="h-1 w-1 rounded-full bg-slate-600"></div>
        Trend Comparison
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        {activeTrends.map((trend) => {
          const trendData = calculateTrend(trend.current, trend.previous)
          if (!trendData) return null

          const isRising = trendData.isIncrease
          const isDangerous = trend.isDangerous(trend.current)

          return (
            <div
              key={trend.label}
              className={`rounded-xl border-2 p-4 transition-all ${
                isDangerous
                  ? 'border-red-200 bg-red-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
                {trend.label}
              </p>

              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {typeof trend.current === 'number' ? trend.current.toFixed(1) : trend.current}
                    <span className="ml-1 text-sm text-slate-600">{trend.unit}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    vs {typeof trend.previous === 'number' ? trend.previous.toFixed(1) : trend.previous} {trend.unit}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                    isRising
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isRising ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  <span>{Math.abs(trendData.percentChange)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TrendComparison
