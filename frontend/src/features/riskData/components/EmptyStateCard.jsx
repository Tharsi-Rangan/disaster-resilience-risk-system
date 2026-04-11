import { Cloud, AlertCircle } from 'lucide-react'

function EmptyStateCard({ onFetch, loading = false }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-linear-to-br from-slate-50 to-slate-100 p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
        <Cloud className="h-8 w-8 text-slate-500" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-slate-900">No Risk Data Yet</h3>

      <p className="mb-6 max-w-sm mx-auto text-sm text-slate-600 leading-relaxed">
        This project doesn't have any risk snapshots yet. Click the button below to fetch the first snapshot
        of environmental and seismic data.
      </p>

      <button
        type="button"
        onClick={onFetch}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Fetching...
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4" />
            Fetch First Snapshot
          </>
        )}
      </button>

      <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>💡 What is a snapshot?</strong> A snapshot captures weather and earthquake data at a specific time.
          You can have multiple snapshots to track changes over time.
        </p>
      </div>
    </div>
  )
}

export default EmptyStateCard
