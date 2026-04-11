import { MapPin, Clock, Cloud, Zap } from 'lucide-react'
import RiskMetricCard from './RiskMetricCard'

function formatDate(dateValue) {
  if (!dateValue) return 'N/A'
  return new Date(dateValue).toLocaleString()
}

function LatestRiskSnapshotCard({ snapshot }) {
  if (!snapshot) return null

  return (
    <div className="mb-8 space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
              <MapPin className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Latest Snapshot</h2>
              <p className="text-xs text-slate-600">
                Most recent disaster hazard assessment
              </p>
            </div>
          </div>
          <div className="text-3xl">📍</div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-blue-200 bg-white p-4 transition hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source</p>
            </div>
            <p className="text-sm font-semibold text-slate-900">{snapshot.source || 'N/A'}</p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-4 transition hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fetched At</p>
            </div>
            <p className="text-xs font-semibold text-slate-900">{formatDate(snapshot.fetchedAt)}</p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-4 transition hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weather Code</p>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {snapshot.weatherCode ?? 'N/A'}
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-4 transition hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Max Magnitude
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {snapshot.maxEarthquakeMagnitude ?? 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-base font-semibold text-slate-900 flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="px-3 text-sm font-medium text-slate-600">Environmental & Seismic Metrics</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RiskMetricCard label="Rainfall" value={snapshot.rainfall} unit=" mm" />
          <RiskMetricCard label="Wind Speed" value={snapshot.windSpeed} unit=" m/s" />
          <RiskMetricCard label="Temperature" value={snapshot.temperature} unit=" °C" />
          <RiskMetricCard label="Humidity" value={snapshot.humidity} unit=" %" />
          <RiskMetricCard label="Cloudiness" value={snapshot.cloudiness} unit=" %" />
          <RiskMetricCard label="Pressure" value={snapshot.pressure} unit=" hPa" />
          <RiskMetricCard label="Visibility" value={snapshot.visibility} unit=" m" />
          <RiskMetricCard label="Earthquake Count" value={snapshot.earthquakeCount} />
          <RiskMetricCard
            label="Nearest Earthquake Distance"
            value={snapshot.nearestEarthquakeDistanceKm}
            unit=" km"
          />
          <RiskMetricCard
            label="Flood Risk Index"
            value={snapshot.floodRiskIndex}
            helperText="Preliminary hazard indicator"
          />
        </div>
      </div>
    </div>
  )
}

export default LatestRiskSnapshotCard
