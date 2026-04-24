import { CloudSun, Info, Mountain, Waves } from 'lucide-react'

function SourceCard({ icon, title, description, helper, iconClassName }) {
  const SourceIcon = icon

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className={`rounded-lg p-2 ${iconClassName}`}>
          <SourceIcon className="h-4 w-4" />
        </div>
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      </div>
      <p className="text-xs leading-relaxed text-slate-700">{description}</p>
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
    </div>
  )
}

function DataSourceInfo({ snapshot = null, fetchErrorMessage = '' }) {
  const source = snapshot?.source || ''
  const normalizedSource = String(source).toLowerCase()
  const usedFallbackWeather = normalizedSource.includes('openmeteo') || normalizedSource.includes('open-meteo')
  const usedOpenWeather = normalizedSource.includes('openweather')

  const weatherProviderUsed =
    !snapshot
      ? 'No snapshot data yet'
      : usedFallbackWeather
        ? 'Open-Meteo (fallback)'
        : usedOpenWeather
          ? 'OpenWeather (primary)'
          : 'Not explicitly specified in snapshot source'

  const earthquakeProvider = snapshot
    ? 'USGS (from earthquake snapshot fields)'
    : 'No snapshot data yet'

  const floodProvider = !snapshot
    ? 'No snapshot data yet'
    : snapshot.floodSourceStatus === 'failed'
      ? 'Open-Meteo Flood API unavailable during snapshot fetch'
      : 'Open-Meteo Flood API'

  const elevationProvider = !snapshot
    ? 'No snapshot data yet'
    : snapshot.elevationSourceStatus === 'failed'
      ? 'Open-Elevation API unavailable during snapshot fetch'
      : 'Open-Elevation API'

  const normalizedError = String(fetchErrorMessage || '').toLowerCase()
  const hasFetchIssue = Boolean(fetchErrorMessage)
  const fetchIssueText =
    normalizedError.includes('cooldown') || normalizedError.includes('wait')
      ? 'Please wait a few minutes before fetching a new snapshot.'
      : 'Latest snapshot request could not be completed. Please try again shortly.'

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-linear-to-r from-slate-50 to-slate-100 p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-slate-200 p-2">
          <Info className="h-5 w-5 text-slate-700" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Data Sources</h3>
          <p className="mt-0.5 text-xs text-slate-600">Where this data comes from</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SourceCard
          icon={CloudSun}
          title="Weather Provider Used"
          description={weatherProviderUsed}
          helper="Derived from snapshot source metadata."
          iconClassName="bg-sky-100 text-sky-700"
        />
        <SourceCard
          icon={Mountain}
          title="Earthquake Provider"
          description={earthquakeProvider}
          helper="Shown only from available snapshot data."
          iconClassName="bg-amber-100 text-amber-700"
        />
        <SourceCard
          icon={Waves}
          title="Flood Provider"
          description={floodProvider}
          helper="Flood data provided by Open-Meteo Flood API."
          iconClassName="bg-cyan-100 text-cyan-700"
        />
        <SourceCard
          icon={Mountain}
          title="Elevation Provider"
          description={elevationProvider}
          helper="Elevation data: Open-Elevation API."
          iconClassName="bg-emerald-100 text-emerald-700"
        />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold text-slate-700">Snapshot Source</p>
        <p className="mt-1 text-xs text-slate-600">{source || 'No source available yet.'}</p>
      </div>

      {usedFallbackWeather && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-800">
            <strong>Notice:</strong> Fallback weather provider was used for this snapshot.
          </p>
        </div>
      )}

      {hasFetchIssue && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-800">
            <strong>Latest fetch issue:</strong> {fetchIssueText}
          </p>
        </div>
      )}
    </div>
  )
}

export default DataSourceInfo
