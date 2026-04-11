import { Download, Share2, MessageCircle } from 'lucide-react'

function ShareFeatures({ snapshot, history, projectName, projectOverview, onFeedback }) {
  const getProjectOverview = () => {
    const location = projectOverview?.location || projectOverview?.coordinates || {}
    const latitude =
      location?.latitude ??
      location?.lat ??
      projectOverview?.latitude ??
      projectOverview?.lat ??
      (Array.isArray(location?.coordinates) ? location.coordinates[1] : undefined)

    const longitude =
      location?.longitude ??
      location?.lng ??
      location?.lon ??
      projectOverview?.longitude ??
      projectOverview?.lng ??
      projectOverview?.lon ??
      (Array.isArray(location?.coordinates) ? location.coordinates[0] : undefined)

    const hasCoordinates = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))

    const locationText =
      projectOverview?.address ||
      projectOverview?.locationName ||
      projectOverview?.location_name ||
      (hasCoordinates ? `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}` : 'N/A')

    const createdDate = projectOverview?.createdAt || projectOverview?.created_at

    return {
      name: projectOverview?.title || projectOverview?.name || projectName || 'Project',
      type: projectOverview?.projectType || projectOverview?.type || 'N/A',
      status: projectOverview?.status || 'N/A',
      location: locationText,
      created: createdDate ? new Date(createdDate).toLocaleString() : 'N/A',
    }
  }

  const formatCell = (cell) => {
    const str = String(cell)
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }

  const handleExportCSV = () => {
    try {
      const exportedAt = new Date().toLocaleString()
      const overview = getProjectOverview()

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

      const latestHazardRows = [
        ['Latest Snapshot Fetched At', snapshot?.fetchedAt ? new Date(snapshot.fetchedAt).toLocaleString() : 'N/A'],
        ['Latest Snapshot Source', snapshot?.source || 'N/A'],
        ['Flood Risk Index', snapshot?.floodRiskIndex ?? 'N/A'],
        ['Earthquake Count', snapshot?.earthquakeCount ?? 'N/A'],
        ['Max Earthquake Magnitude', snapshot?.maxEarthquakeMagnitude ?? 'N/A'],
        ['Nearest Earthquake Distance (km)', snapshot?.nearestEarthquakeDistanceKm ?? 'N/A'],
        ['Temperature (°C)', snapshot?.temperature ?? 'N/A'],
        ['Humidity (%)', snapshot?.humidity ?? 'N/A'],
        ['Wind Speed (m/s)', snapshot?.windSpeed ?? 'N/A'],
        ['Rainfall (mm)', snapshot?.rainfall ?? 'N/A'],
      ]

      const rows = (history || []).map((item) => [
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

      const csvRows = [
        ['Section', 'Value'],
        ['Report Type', 'Disaster Risk Data Export'],
        ['Exported At', exportedAt],
        ['Project Name', overview.name],
        ['Project Type', overview.type],
        ['Project Status', overview.status],
        ['Project Location', overview.location],
        ['Project Created', overview.created],
        [],
        ['Latest Hazard Snapshot', ''],
        ...latestHazardRows,
        [],
        ['Snapshot History', ''],
        headers,
        ...rows,
      ]

      const csvContent = [
        ...csvRows.map((row) => (Array.isArray(row) ? row.map(formatCell).join(',') : ''))
      ].join('\n')

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
      onFeedback?.({
        type: 'success',
        title: 'Export complete',
        message: 'Project overview, export date, and hazard data were exported successfully.',
      })
    } catch (error) {
      onFeedback?.({
        type: 'error',
        title: 'Export failed',
        message: 'Unable to export CSV right now. Please try again.',
      })
    }
  }

  const handleCopyText = async () => {
    try {
      const text = generateSummaryText()
      await navigator.clipboard.writeText(text)
      onFeedback?.({
        type: 'success',
        title: 'Summary copied',
        message: 'Risk summary copied to clipboard.',
      })
    } catch (error) {
      onFeedback?.({
        type: 'error',
        title: 'Copy failed',
        message: 'Unable to copy summary to clipboard.',
      })
    }
  }

  const handleWhatsAppShare = () => {
    const text = generateSummaryText()
    const encoded = encodeURIComponent(text)
    const shareWindow = window.open(`https://wa.me/?text=${encoded}`, '_blank')
    if (shareWindow) {
      onFeedback?.({
        type: 'success',
        title: 'Share link opened',
        message: 'WhatsApp share was opened in a new tab.',
      })
    } else {
      onFeedback?.({
        type: 'error',
        title: 'Share failed',
        message: 'Pop-up was blocked. Please allow pop-ups and try again.',
      })
    }
  }

  const generateSummaryText = () => {
    if (!snapshot) return 'Risk data not available'

    const overview = getProjectOverview()
    const exportedAt = new Date().toLocaleString()

    return (
      `📊 Disaster Risk Summary\n\n` +
      `Project Overview\n` +
      `• Name: ${overview.name}\n` +
      `• Type: ${overview.type}\n` +
      `• Status: ${overview.status}\n` +
      `• Location: ${overview.location}\n` +
      `• Created: ${overview.created}\n\n` +
      `Exported Date: ${exportedAt}\n\n` +
      `Hazard Data\n` +
      `• Flood Risk Index: ${snapshot.floodRiskIndex?.toFixed(0) || 'N/A'}\n` +
      `• Temperature: ${snapshot.temperature?.toFixed(1) || 'N/A'}°C\n` +
      `• Humidity: ${snapshot.humidity?.toFixed(0) || 'N/A'}%\n` +
      `• Wind Speed: ${snapshot.windSpeed?.toFixed(1) || 'N/A'} m/s\n` +
      `• Rainfall: ${snapshot.rainfall?.toFixed(1) || 'N/A'} mm\n` +
      `• Earthquakes: ${snapshot.earthquakeCount || 0} event(s)\n` +
      `• Max Earthquake Magnitude: ${snapshot.maxEarthquakeMagnitude ?? 'N/A'}\n` +
      `• Nearest Earthquake Distance: ${snapshot.nearestEarthquakeDistanceKm ?? 'N/A'} km\n` +
      `\nSource: ${snapshot.source || 'Unknown'}\n` +
      `Snapshot Fetched: ${new Date(snapshot.fetchedAt).toLocaleString()}\n\n` +
      `Generated from ResiluGuard - Disaster Resilience Risk System`
    )
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <button
        onClick={handleExportCSV}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
        title="Download risk data as CSV"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export CSV</span>
        <span className="sm:hidden">Export</span>
      </button>

      <button
        onClick={handleCopyText}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
        title="Copy summary to clipboard"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Copy Summary</span>
        <span className="sm:hidden">Copy</span>
      </button>

      <button
        onClick={handleWhatsAppShare}
        className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 hover:border-green-400"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Share on WhatsApp</span>
        <span className="sm:hidden">WhatsApp</span>
      </button>
    </div>
  )
}

export default ShareFeatures
