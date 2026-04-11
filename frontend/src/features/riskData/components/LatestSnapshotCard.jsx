import { useState } from 'react'
import riskDataService from '../../../services/riskDataService'
import { formatDate } from '../utils/formatUtils'
import WeatherCard from './WeatherCard'
import EarthquakeCard from './EarthquakeCard'

function LatestSnapshotCard({ projectId, snapshot, onRefresh, isLoading }) {
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState(null)

  const handleFetch = async () => {
    setIsFetching(true)
    setError(null)
    try {
      await riskDataService.fetchRiskData(projectId)
      onRefresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch risk data')
    } finally {
      setIsFetching(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
      </div>
    )
  }

  if (!snapshot) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">No snapshot data found. Click the button below to fetch latest data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Fetch Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Latest Risk Snapshot</h2>
          <p className="mt-1 text-sm text-slate-600">
            Updated: {formatDate(snapshot.fetchedAt)}
          </p>
          <p className="text-xs text-slate-500">Source: {snapshot.source}</p>
        </div>
        <button
          onClick={handleFetch}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2 font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {isFetching ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Fetching...
            </>
          ) : (
            <>
              🔄 Refresh Data
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Weather Card */}
      <WeatherCard snapshot={snapshot} />

      {/* Earthquake Card */}
      <EarthquakeCard snapshot={snapshot} />

      {/* Source Info */}
      <div className="rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
        <p>📍 Data collected from: {snapshot.source}</p>
      </div>
    </div>
  )
}

export default LatestSnapshotCard
