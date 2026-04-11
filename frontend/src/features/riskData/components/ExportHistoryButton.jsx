import { Download, AlertCircle } from 'lucide-react'

function ExportHistoryButton({ history = [], loading = false }) {
  if (!history || history.length === 0) return null

  const handleExport = () => {
    try {
      // CSV headers
      const headers = [
        'Fetched At',
        'Source',
        'Rainfall (mm)',
        'Temperature (°C)',
        'Wind Speed (m/s)',
        'Humidity (%)',
        'Cloudiness (%)',
        'Pressure (hPa)',
        'Visibility (m)',
        'Weather Code',
        'Earthquake Count',
        'Max Earthquake Magnitude',
        'Nearest Earthquake Distance (km)',
        'Flood Risk Index'
      ]

      // CSV rows
      const rows = history.map((item) => [
        new Date(item.fetchedAt).toLocaleString(),
        item.source || 'N/A',
        item.rainfall ?? 'N/A',
        item.temperature ?? 'N/A',
        item.windSpeed ?? 'N/A',
        item.humidity ?? 'N/A',
        item.cloudiness ?? 'N/A',
        item.pressure ?? 'N/A',
        item.visibility ?? 'N/A',
        item.weatherCode ?? 'N/A',
        item.earthquakeCount ?? 'N/A',
        item.maxEarthquakeMagnitude ?? 'N/A',
        item.nearestEarthquakeDistanceKm ?? 'N/A',
        item.floodRiskIndex ?? 'N/A'
      ])

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((cell) => {
              // Escape quotes and wrap in quotes if needed
              const str = String(cell)
              return str.includes(',') || str.includes('"') || str.includes('\n')
                ? `"${str.replace(/"/g, '""')}"`
                : str
            })
            .join(',')
        )
      ].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      const timestamp = new Date().toISOString().split('T')[0]
      link.setAttribute('href', url)
      link.setAttribute('download', `risk-history-${timestamp}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export history. Please try again.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading || !history?.length}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
      title={`Export ${history.length} snapshot${history.length !== 1 ? 's' : ''} to CSV`}
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Export CSV</span>
      <span className="sm:hidden">Export</span>
    </button>
  )
}

export default ExportHistoryButton
