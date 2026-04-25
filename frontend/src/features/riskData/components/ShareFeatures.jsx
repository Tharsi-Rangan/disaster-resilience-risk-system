import { Download, Share2, MessageCircle } from 'lucide-react'
import useAuth from '../../../hooks/useAuth'
import { exportRiskReportCsv } from '../utils/exportRiskReport'

function ShareFeatures({
  snapshot,
  history,
  projectName,
  projectId = '',
  projectOverview,
  onFeedback,
  showExport = true,
}) {
  const { user } = useAuth()

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

  const handleExportCSV = () => {
    try {
      exportRiskReportCsv({
        history,
        latestSnapshot: snapshot,
        projectName,
        projectId,
        projectOverview,
        user,
      })
      onFeedback?.({
        type: 'success',
        title: 'Export complete',
        message: 'Professional risk report exported successfully.',
      })
    } catch {
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
    } catch {
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
      `Disaster Risk Summary\n\n` +
      `Project Overview\n` +
      `- Name: ${overview.name}\n` +
      `- Type: ${overview.type}\n` +
      `- Status: ${overview.status}\n` +
      `- Location: ${overview.location}\n` +
      `- Created: ${overview.created}\n\n` +
      `Exported Date: ${exportedAt}\n\n` +
      `Hazard Data\n` +
      `- Flood Risk Index: ${snapshot.floodRiskIndex?.toFixed(0) || 'N/A'}\n` +
      `- Temperature: ${snapshot.temperature?.toFixed(1) || 'N/A'} deg C\n` +
      `- Humidity: ${snapshot.humidity?.toFixed(0) || 'N/A'}%\n` +
      `- Wind Speed: ${snapshot.windSpeed?.toFixed(1) || 'N/A'} m/s\n` +
      `- Rainfall: ${snapshot.rainfall?.toFixed(1) || 'N/A'} mm\n` +
      `- Earthquakes: ${snapshot.earthquakeCount || 0} event(s)\n` +
      `- Max Earthquake Magnitude: ${snapshot.maxEarthquakeMagnitude ?? 'N/A'}\n` +
      `- Nearest Earthquake Distance: ${snapshot.nearestEarthquakeDistanceKm ?? 'N/A'} km\n` +
      `\nSource: ${snapshot.source || 'Unknown'}\n` +
      `Snapshot Fetched: ${new Date(snapshot.fetchedAt).toLocaleString()}\n\n` +
      `Generated from ResiluGuard - Disaster Resilience Risk System`
    )
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {showExport && (
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
          title="Download risk data as CSV"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>
      )}

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
