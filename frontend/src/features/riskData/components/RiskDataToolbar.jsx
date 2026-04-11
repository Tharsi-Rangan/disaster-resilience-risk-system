import { RefreshCw, Clock, AlertCircle } from 'lucide-react'

function RiskDataToolbar({ onFetch, loading = false, latestFetchedAt = null }) {
  const getLastFetchedTime = () => {
    if (!latestFetchedAt) return 'Never'
    const date = new Date(latestFetchedAt)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hr ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Live Hazard Snapshot</h2>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Fetch the latest disaster-related environmental and seismic data for this project.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Last fetched: </span>
            <span className="text-slate-700">{getLastFetchedTime()}</span>
            {latestFetchedAt && (
              <span className="text-slate-400">
                ({new Date(latestFetchedAt).toLocaleDateString()} {new Date(latestFetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onFetch}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-indigo-500 whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Fetching...' : 'Fetch Latest Data'}
        </button>
      </div>
    </div>
  )
}

export default RiskDataToolbar
