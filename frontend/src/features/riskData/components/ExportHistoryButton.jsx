import { Download } from 'lucide-react'
import useAuth from '../../../hooks/useAuth'
import { exportRiskReportCsv } from '../utils/exportRiskReport'

function ExportHistoryButton({
  history = [],
  latestSnapshot = null,
  loading = false,
  projectName = '',
  projectId = '',
  projectOverview = null,
}) {
  const { user } = useAuth()

  if (!history || history.length === 0) return null

  const handleExport = () => {
    try {
      exportRiskReportCsv({
        history,
        latestSnapshot,
        projectName,
        projectId,
        projectOverview,
        user,
      })
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
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Export CSV</span>
      <span className="sm:hidden">Export</span>
    </button>
  )
}

export default ExportHistoryButton
