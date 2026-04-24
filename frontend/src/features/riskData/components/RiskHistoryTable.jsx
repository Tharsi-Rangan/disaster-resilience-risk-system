import { Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'

function formatValue(value, suffix = '') {
  if (value === null || value === undefined || value === '') return 'N/A'
  if (typeof value === 'number') {
    return value.toFixed(2) + suffix
  }
  return `${value}${suffix}`
}

function formatDate(dateValue) {
  if (!dateValue) return 'N/A'
  return new Date(dateValue).toLocaleString()
}

function RiskHistoryTable({ history = [], onDelete = null, loading = false, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
        <ChevronRight className="mx-auto mb-3 h-8 w-8 text-slate-400" />
        <p className="text-sm font-medium text-slate-600">No snapshot history yet</p>
        <p className="text-xs text-slate-500 mt-1">Fetch data to start building your risk assessment history.</p>
      </div>
    )
  }

  const handleDelete = (snapshotId) => {
    if (!onDelete) return
    if (window.confirm('Are you sure you want to delete this snapshot? This action cannot be undone.')) {
      onDelete(snapshotId)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOpen ? (
              <ChevronDown className="h-5 w-5 text-slate-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-slate-600" />
            )}
            <div className="text-left">
              <h2 className="text-lg font-bold text-slate-900">Snapshot History</h2>
              <p className="text-xs text-slate-600">
                {history.length} snapshot{history.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase">
            {isOpen ? 'Hide' : 'Show'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-700">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-3 font-semibold">Fetched At</th>
                  <th className="px-6 py-3 font-semibold">Source</th>
                  <th className="px-6 py-3 font-semibold">Rainfall</th>
                  <th className="px-6 py-3 font-semibold">Temperature</th>
                  <th className="px-6 py-3 font-semibold">Wind Speed</th>
                  <th className="px-6 py-3 font-semibold">Humidity</th>
                  <th className="px-6 py-3 font-semibold">Earthquakes</th>
                  <th className="px-6 py-3 font-semibold">Flood Risk</th>
                  {onDelete && <th className="px-6 py-3 font-semibold text-center">Action</th>}
                </tr>
              </thead>

              <tbody>
                {history.map((item, idx) => (
                  <tr key={item._id || idx} className="border-b border-slate-100 transition hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-700 font-medium whitespace-nowrap">{formatDate(item.fetchedAt)}</td>
                    <td className="px-6 py-3 text-slate-600">
                      <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {item.source || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{formatValue(item.rainfall, ' mm')}</td>
                    <td className="px-6 py-3 text-slate-600">{formatValue(item.temperature, ' °C')}</td>
                    <td className="px-6 py-3 text-slate-600">{formatValue(item.windSpeed, ' m/s')}</td>
                    <td className="px-6 py-3 text-slate-600">{formatValue(item.humidity, ' %')}</td>
                    <td className="px-6 py-3 text-slate-600">
                      <span className="font-semibold">{item.earthquakeCount || 0}</span>
                      {item.maxEarthquakeMagnitude && (
                        <span className="text-xs text-slate-500 block">Max: {item.maxEarthquakeMagnitude.toFixed(1)}</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        item.floodRiskIndex > 75
                          ? 'bg-red-100 text-red-700'
                          : item.floodRiskIndex > 50
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {formatValue(item.floodRiskIndex)}
                      </span>
                    </td>
                    {onDelete && (
                      <td className="px-6 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          disabled={loading}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete this snapshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default RiskHistoryTable
