import { TrendingUp } from 'lucide-react'

function RiskTrendChart({ history = [] }) {
  if (!history || history.length < 2) return null

  // Get last 10 entries for chart
  const data = history.slice(0, 10).reverse()

  const minRisk = Math.min(...data.map((d) => d.floodRiskIndex || 0))
  const maxRisk = Math.max(...data.map((d) => d.floodRiskIndex || 0))
  const range = maxRisk - minRisk || 1

  // Simple SVG chart
  const chartHeight = 200
  const chartWidth = 100
  const padding = 40

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * (chartWidth * 6 - padding * 2),
    y:
      chartHeight -
      padding +
      25 -
      ((d.floodRiskIndex - minRisk) / range) * (chartHeight - padding * 2)
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const getRiskColor = (risk) => {
    if (risk < 30) return '#10b981' // emerald
    if (risk < 60) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const getStatusLabel = (risk) => {
    if (risk < 30) return 'Low'
    if (risk < 60) return 'Moderate'
    return 'High'
  }

  const latestRisk = data[data.length - 1]?.floodRiskIndex || 0
  const previousRisk = data[data.length - 2]?.floodRiskIndex || latestRisk
  const trend = latestRisk - previousRisk

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900">Flood Risk Trend</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Latest Value</p>
          <p className="text-2xl font-bold text-slate-900">{latestRisk.toFixed(0)}</p>
        </div>
      </div>

      <div className="mb-6 flex gap-4 md:gap-6">
        <svg
          viewBox={`0 0 ${chartWidth * 6} ${chartHeight}`}
          className="h-48 w-full flex-1"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={`grid-${y}`}
              x1={padding}
              y1={chartHeight - padding + 25 - (y / 100) * (chartHeight - padding * 2)}
              x2={chartWidth * 6 - padding}
              y2={chartHeight - padding + 25 - (y / 100) * (chartHeight - padding * 2)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Area under curve */}
          <path
            d={`${pathD} L ${points[points.length - 1]?.x || 0} ${chartHeight - padding + 25} L ${points[0]?.x || 0} ${chartHeight - padding + 25} Z`}
            fill={getRiskColor(latestRisk)}
            opacity="0.1"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={getRiskColor(latestRisk)}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={`point-${i}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill={getRiskColor(data[i].floodRiskIndex)}
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Y-axis */}
          <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding + 25} stroke="#cbd5e1" strokeWidth="2" />
          {/* X-axis */}
          <line x1={padding} y1={chartHeight - padding + 25} x2={chartWidth * 6 - padding} y2={chartHeight - padding + 25} stroke="#cbd5e1" strokeWidth="2" />

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((y) => (
            <text
              key={`label-${y}`}
              x={padding - 10}
              y={chartHeight - padding + 25 - (y / 100) * (chartHeight - padding * 2) + 4}
              textAnchor="end"
              fontSize="12"
              fill="#94a3b8"
            >
              {y}
            </text>
          ))}
        </svg>

        {/* Stats sidebar */}
        <div className="space-y-3 md:w-40">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Current Status</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{getStatusLabel(latestRisk)}</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(latestRisk, 100)}%`,
                  backgroundColor: getRiskColor(latestRisk)
                }}
              ></div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Trend</p>
            <p className={`mt-2 text-lg font-bold ${trend > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}
            </p>
            <p className="text-xs text-slate-500 mt-1">vs previous</p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Period</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {data.length} snapshot{data.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
        <p className="text-xs text-blue-800">
          <strong>📊 Note:</strong> This chart shows flood risk trend over your last {data.length} snapshots.
          Higher values indicate greater flood risk. Monitor for sustained increases.
        </p>
      </div>
    </div>
  )
}

export default RiskTrendChart
