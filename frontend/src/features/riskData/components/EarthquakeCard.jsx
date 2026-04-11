import { formatDistance, formatMagnitude } from '../utils/formatUtils'

function EarthquakeCard({ snapshot }) {
  const hasEarthquakeData =
    snapshot?.earthquakeCount > 0 ||
    snapshot?.maxEarthquakeMagnitude !== null ||
    snapshot?.nearestEarthquakeDistanceKm !== null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Seismic Activity</h3>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Earthquake Count */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600">Recent Earthquakes (30 days)</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {snapshot?.earthquakeCount ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">within 200 km radius (M≥3)</p>
        </div>

        {/* Max Magnitude (New Field) */}
        <div
          className={`rounded-lg p-4 ${
            snapshot?.maxEarthquakeMagnitude !== null
              ? 'bg-red-50'
              : 'bg-slate-50'
          }`}
        >
          <p className="text-xs font-medium text-slate-600">Max Magnitude</p>
          <p
            className={`mt-2 text-3xl font-bold ${
              snapshot?.maxEarthquakeMagnitude !== null
                ? 'text-red-600'
                : 'text-slate-400'
            }`}
          >
            {snapshot?.maxEarthquakeMagnitude !== null
              ? formatMagnitude(snapshot.maxEarthquakeMagnitude)
              : 'N/A'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Highest magnitude detected</p>
        </div>

        {/* Nearest Distance (New Field) */}
        <div
          className={`rounded-lg p-4 ${
            snapshot?.nearestEarthquakeDistanceKm !== null
              ? 'bg-amber-50'
              : 'bg-slate-50'
          }`}
        >
          <p className="text-xs font-medium text-slate-600">Nearest Distance</p>
          <p
            className={`mt-2 text-2xl font-bold ${
              snapshot?.nearestEarthquakeDistanceKm !== null
                ? 'text-amber-600'
                : 'text-slate-400'
            }`}
          >
            {formatDistance(snapshot?.nearestEarthquakeDistanceKm)}
          </p>
          <p className="mt-1 text-xs text-slate-500">From project location</p>
        </div>
      </div>

      {!hasEarthquakeData && (
        <div className="mt-4 rounded-lg bg-green-50 p-3">
          <p className="text-sm text-green-700">✓ No significant seismic activity detected</p>
        </div>
      )}
    </div>
  )
}

export default EarthquakeCard
