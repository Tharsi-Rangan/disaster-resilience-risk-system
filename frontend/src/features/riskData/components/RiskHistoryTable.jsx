import { useState } from 'react'
import useAuth from '../../../hooks/useAuth'
import riskDataService from '../../../services/riskDataService'
import { formatDate, formatNumber } from '../utils/formatUtils'

function RiskHistoryTable({ history, onDelete }) {
  const { user } = useAuth()
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  const isAdmin = user?.role === 'ADMIN'

  const handleDelete = async (snapshotId) => {
    if (!window.confirm('Are you sure you want to delete this snapshot? This action cannot be undone.')) {
      return
    }

    setDeletingId(snapshotId)
    setError(null)

    try {
      await riskDataService.deleteRiskSnapshot(snapshotId)
      onDelete(snapshotId)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete snapshot')
    } finally {
      setDeletingId(null)
    }
  }

  if (!history || history.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-slate-600">No historical data available.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Snapshot History</h3>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">⚠️ {error}</p>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Fetch Time</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Temperature</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Humidity</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Rainfall</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Wind Speed</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Pressure</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Visibility</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Flood Index</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Earthquakes</th>
              {isAdmin && <th className="px-6 py-3 text-left font-semibold text-slate-900">Action</th>}
            </tr>
          </thead>
          <tbody>
            {history.map((snapshot) => (
              <tr key={snapshot._id} className="border-t border-slate-200 hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-700">{formatDate(snapshot.fetchedAt)}</td>
                <td className="px-6 py-4 text-slate-700">
                  {formatNumber(snapshot.temperature, 1)}°C
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {formatNumber(snapshot.humidity, 0)}%
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {formatNumber(snapshot.rainfall, 1)} mm
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {formatNumber(snapshot.windSpeed, 2)} m/s
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {snapshot.pressure > 0 ? `${snapshot.pressure} hPa` : 'N/A'}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {snapshot.visibility > 0
                    ? snapshot.visibility >= 1000
                      ? `${(snapshot.visibility / 1000).toFixed(1)} km`
                      : `${snapshot.visibility} m`
                    : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      snapshot.floodRiskIndex > 50
                        ? 'bg-red-100 text-red-700'
                        : snapshot.floodRiskIndex > 30
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {snapshot.floodRiskIndex}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {snapshot.earthquakeCount > 0 ? (
                    <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                      {snapshot.earthquakeCount}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(snapshot._id)}
                      disabled={deletingId === snapshot._id}
                      className="text-red-600 transition hover:text-red-800 hover:underline disabled:opacity-50"
                    >
                      {deletingId === snapshot._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-6 py-4">
        <p className="text-xs text-slate-600">
          Showing {history.length} {history.length === 1 ? 'record' : 'records'}
        </p>
      </div>
    </div>
  )
}

export default RiskHistoryTable
