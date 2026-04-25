import { Activity, Droplets, Mountain, Thermometer, Waves, Wind } from 'lucide-react'
import { useMemo, useState } from 'react'

const METRIC_OPTIONS = [
  {
    key: 'rainfall',
    label: 'Rainfall',
    unit: 'mm',
    color: '#0ea5e9',
    icon: Droplets,
    helper: 'Compare rainfall spikes against flood risk over time.',
  },
  {
    key: 'temperature',
    label: 'Temperature',
    unit: 'C',
    color: '#f97316',
    icon: Thermometer,
    helper: 'Track heat changes and how they align with overall hazard conditions.',
  },
  {
    key: 'windSpeed',
    label: 'Wind Speed',
    unit: 'm/s',
    color: '#6366f1',
    icon: Wind,
    helper: 'Review wind movement across stored snapshots.',
  },
  {
    key: 'humidity',
    label: 'Humidity',
    unit: '%',
    color: '#06b6d4',
    icon: Droplets,
    helper: 'See how moisture trends may influence flood behavior.',
  },
  {
    key: 'earthquakeCount',
    label: 'Earthquakes',
    unit: 'events',
    color: '#f59e0b',
    icon: Mountain,
    helper: 'Compare seismic event counts between stored snapshots.',
  },
  {
    key: 'floodRiskIndex',
    label: 'Flood Risk',
    unit: 'index',
    color: '#10b981',
    icon: Waves,
    helper: 'Use the hazard index as the main flood trend baseline.',
  },
]

function formatAxisTimeLabel(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatTooltipDateLabel(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMetricValue(value, unit) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'No Data'
  return `${Number(value).toFixed(2)} ${unit}`.trim()
}

function getStatusLabel(delta) {
  if (delta > 0) return 'Increasing'
  if (delta < 0) return 'Decreasing'
  return 'Stable'
}

function SnapshotComparisonChart({ history = [] }) {
  const [selectedMetricKey, setSelectedMetricKey] = useState('floodRiskIndex')

  const chartData = useMemo(() => {
    const selectedMetric = METRIC_OPTIONS.find((option) => option.key === selectedMetricKey) || METRIC_OPTIONS[0]
    const points = history
      .slice(0, 20)
      .reverse()
      .map((item) => ({
        label: formatAxisTimeLabel(item?.fetchedAt),
        fullLabel: formatTooltipDateLabel(item?.fetchedAt),
        metricValue: Number(item?.[selectedMetric.key]),
        floodRiskValue: Number(item?.floodRiskIndex),
      }))
      .filter((item) => Number.isFinite(item.metricValue) || Number.isFinite(item.floodRiskValue))

    return { selectedMetric, points }
  }, [history, selectedMetricKey])

  if (!history || history.length < 2) return null

  const { selectedMetric, points } = chartData
  if (points.length < 2) return null

  const metricValues = points.map((point) => (Number.isFinite(point.metricValue) ? point.metricValue : null))
  const validMetricValues = metricValues.filter((value) => value !== null)
  const floodValues = points.map((point) => (Number.isFinite(point.floodRiskValue) ? point.floodRiskValue : null))
  const validFloodValues = floodValues.filter((value) => value !== null)

  const metricMin = Math.min(...validMetricValues)
  const metricMax = Math.max(...validMetricValues)
  const metricRange = metricMax - metricMin || 1

  const floodMin = Math.min(...validFloodValues)
  const floodMax = Math.max(...validFloodValues)
  const floodRange = floodMax - floodMin || 1

  const svgWidth = 900
  const svgHeight = 260
  const paddingX = 52
  const paddingY = 28
  const chartWidth = svgWidth - paddingX * 2
  const chartHeight = svgHeight - paddingY * 2

  const metricPoints = points.map((point, index) => {
    const x = paddingX + (index / (points.length - 1 || 1)) * chartWidth
    const metricValue = Number.isFinite(point.metricValue) ? point.metricValue : metricMin
    const y = paddingY + chartHeight - ((metricValue - metricMin) / metricRange) * chartHeight
    return { x, y }
  })

  const floodPoints = points.map((point, index) => {
    const x = paddingX + (index / (points.length - 1 || 1)) * chartWidth
    const floodRiskValue = Number.isFinite(point.floodRiskValue) ? point.floodRiskValue : floodMin
    const y = paddingY + chartHeight - ((floodRiskValue - floodMin) / floodRange) * chartHeight
    return { x, y }
  })

  const metricPath = metricPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const floodPath = floodPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const metricAreaPath = `${metricPath} L ${metricPoints[metricPoints.length - 1].x} ${svgHeight - paddingY} L ${metricPoints[0].x} ${svgHeight - paddingY} Z`
  const labelInterval = points.length <= 6 ? 1 : points.length <= 15 ? 2 : points.length <= 30 ? 4 : 6

  const latestValue = validMetricValues[validMetricValues.length - 1]
  const previousValue = validMetricValues[validMetricValues.length - 2] ?? latestValue
  const averageValue = validMetricValues.reduce((sum, value) => sum + value, 0) / validMetricValues.length
  const delta = latestValue - previousValue

  const SelectedMetricIcon = selectedMetric.icon

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-br from-white via-white to-slate-50 p-5 shadow-sm shadow-slate-900/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-xl bg-linear-to-br from-violet-100 to-white p-2 shadow-sm ring-1 ring-violet-100">
              <Activity className="h-4 w-4 text-violet-700" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Historical Comparison Chart</h3>
              <p className="text-xs text-slate-500">Switch between weather and hazard fields to compare stored snapshots.</p>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">{selectedMetric.helper}</p>
          {history.length > 20 ? (
            <p className="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
              Showing latest 20 snapshots for readability.
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Latest</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatMetricValue(latestValue, selectedMetric.unit)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Average</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatMetricValue(averageValue, selectedMetric.unit)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Direction</p>
            <p className={`mt-1 text-sm font-semibold ${delta > 0 ? 'text-red-600' : delta < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
              {getStatusLabel(delta)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {METRIC_OPTIONS.map((option) => {
          const Icon = option.icon
          const isActive = option.key === selectedMetricKey

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelectedMetricKey(option.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-900/15'
                  : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
              }`}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.6fr,0.7fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-50 p-4 shadow-inner shadow-slate-100/40">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-100 transition duration-300 hover:scale-105">
                <SelectedMetricIcon className="h-4 w-4" style={{ color: selectedMetric.color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedMetric.label}</p>
                <p className="text-xs text-slate-500">Solid line compares selected metric. Dashed line keeps flood risk visible as context.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedMetric.color }} />
                {selectedMetric.label}
              </div>
              {selectedMetric.key !== 'floodRiskIndex' ? (
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 shadow-sm">
                  <span className="h-0.5 w-6 bg-emerald-500" style={{ borderTop: '2px dashed #10b981', backgroundColor: 'transparent' }} />
                  Flood Risk
                </div>
              ) : null}
            </div>
          </div>

          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-72 w-full" preserveAspectRatio="none">
            {[0, 0.25, 0.5, 0.75, 1].map((step) => {
              const y = paddingY + chartHeight - step * chartHeight
              return (
                <line
                  key={step}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              )
            })}

            <path d={metricAreaPath} fill={selectedMetric.color} opacity="0.08" />

            <path
              d={metricPath}
              fill="none"
              stroke={selectedMetric.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d={floodPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />

            {metricPoints.map((point, index) => (
              <g key={`metric-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={selectedMetric.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {index === metricPoints.length - 1 ? (
                  <circle cx={point.x} cy={point.y} r="8" fill={selectedMetric.color} opacity="0.14">
                    <animate attributeName="r" values="7;10;7" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.18;0.05;0.18" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                ) : null}
                <title>{points[index].fullLabel}</title>
              </g>
            ))}

            {points.map((point, index) => (
              index % labelInterval === 0 || index === points.length - 1 ? (
                <text
                  key={`label-${index}`}
                  x={metricPoints[index].x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#94a3b8"
                  transform={`rotate(-25 ${metricPoints[index].x} ${svgHeight - 6})`}
                >
                  {point.label}
                </text>
              ) : null
            ))}
          </svg>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Creative Insight</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Use this view to spot whether <span className="font-semibold text-slate-900">{selectedMetric.label.toLowerCase()}</span> is
              moving in the same direction as <span className="font-semibold text-slate-900">flood risk</span>. Matching rises often reveal the
              strongest drivers behind the latest hazard pattern.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-linear-to-br from-violet-50 to-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">Snapshot Window</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{points.length} recent snapshots</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              The chart uses the latest stored records so pattern changes stay readable and decision-focused.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SnapshotComparisonChart
