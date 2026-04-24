import { MapPin, Clock, CloudSun, Waves, Mountain } from 'lucide-react'
import RiskMetricCard from './RiskMetricCard'

function formatDate(dateValue) {
  if (!dateValue) return 'N/A'
  return new Date(dateValue).toLocaleString()
}

function InfoTile({ icon, label, value, iconClassName }) {
  const TileIcon = icon

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <div className={`rounded-lg p-2 ${iconClassName}`}>
          <TileIcon className="h-4 w-4" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      </div>
      <p className="text-base font-extrabold text-slate-900">{value}</p>
    </div>
  )
}

function LatestRiskSnapshotCard({ snapshot }) {
  if (!snapshot) return null

  return (
    <div className="mb-8 space-y-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 glass-panel shadow-md">
        <div className="h-1 w-full dark-pro-gradient"></div>

        <div className="p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 shadow-inner">
                <MapPin className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Latest Snapshot</h2>
                <p className="text-xs text-slate-600">
                  Most recent disaster hazard assessment
                </p>
              </div>
            </div>
            <span className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
              Live Data
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoTile
              icon={CloudSun}
              label="Source Engine"
              value={snapshot.source || 'N/A'}
              iconClassName="bg-sky-100 text-sky-700"
            />
            <InfoTile
              icon={Clock}
              label="Timestamp"
              value={formatDate(snapshot.fetchedAt)}
              iconClassName="bg-slate-100 text-slate-700"
            />
            <InfoTile
              icon={CloudSun}
              label="Atmosphere ID"
              value={snapshot.weatherCode ?? 'N/A'}
              iconClassName="bg-cyan-100 text-cyan-700"
            />
            <InfoTile
              icon={Mountain}
              label="Peak Seismic"
              value={`${snapshot.maxEarthquakeMagnitude ?? 'N/A'} M`}
              iconClassName="bg-amber-100 text-amber-700"
            />
          </div>

          {snapshot.riverDischarge != null && (
            <div className="mt-4 rounded-2xl border border-cyan-100 bg-linear-to-r from-cyan-50 to-teal-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 shadow-sm">
                  <Waves className="h-4 w-4 text-cyan-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Flood Signal</p>
                  <p className="text-sm text-slate-700">
                    River discharge currently at <span className="font-semibold">{snapshot.riverDischarge} m3/s</span>
                    {snapshot.riverDischargeMean != null ? ` with mean flow ${snapshot.riverDischargeMean} m3/s.` : '.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-xs">
            Environmental & Seismic Metrics
          </span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RiskMetricCard label="Rainfall" value={snapshot.rainfall} unit=" mm" />
          <RiskMetricCard label="Wind Speed" value={snapshot.windSpeed} unit=" m/s" />
          <RiskMetricCard label="Temperature" value={snapshot.temperature} unit=" C" />
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
            label="River Discharge"
            value={snapshot.riverDischarge}
            unit=" m3/s"
            helperText={snapshot.riverDischarge == null ? 'Data unavailable' : 'Open-Meteo Flood API reading'}
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
