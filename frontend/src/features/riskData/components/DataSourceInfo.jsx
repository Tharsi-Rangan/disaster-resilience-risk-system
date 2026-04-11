import { Cloud, Zap, Info } from 'lucide-react'

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

  const normalizedError = String(fetchErrorMessage || '').toLowerCase()
  const hasFetchIssue = Boolean(fetchErrorMessage)
  const fetchIssueText = normalizedError.includes('cooldown') || normalizedError.includes('wait')
    ? 'Please wait a few minutes before fetching a new snapshot.'
    : 'Latest snapshot request could not be completed. Please try again shortly.'

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-linear-to-r from-slate-50 to-slate-100 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-slate-200 rounded-lg">
          <Info className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Data Sources</h3>
          <p className="text-xs text-slate-600 mt-0.5">Where this data comes from</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-slate-900 text-sm">Weather Provider Used</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">{weatherProviderUsed}</p>
          <p className="text-xs text-slate-500 mt-2">Derived from snapshot source metadata.</p>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-orange-600" />
            <h4 className="font-semibold text-slate-900 text-sm">Earthquake Provider</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">{earthquakeProvider}</p>
          <p className="text-xs text-slate-500 mt-2">Shown only from available snapshot data.</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold text-slate-700">Snapshot Source</p>
        <p className="mt-1 text-xs text-slate-600">{source || 'No source available yet.'}</p>
      </div>

      {usedFallbackWeather && (
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs text-amber-800">
            <strong>Notice:</strong> Fallback weather provider was used for this snapshot.
          </p>
        </div>
      )}

      {hasFetchIssue && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-xs text-red-800">
            <strong>Latest fetch issue:</strong> {fetchIssueText}
          </p>
        </div>
      )}
    </div>
  )
}

export default DataSourceInfo
