import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import { riskDataService } from '../../services/riskDataService'
import RiskDataToolbar from '../../features/riskData/components/RiskDataToolbar'
import RiskSummaryHero from '../../features/riskData/components/RiskSummaryHero'
import LatestRiskSnapshotCard from '../../features/riskData/components/LatestRiskSnapshotCard'
import RiskHistoryTable from '../../features/riskData/components/RiskHistoryTable'
import DataSourceInfo from '../../features/riskData/components/DataSourceInfo'
import PageContextCard from '../../features/riskData/components/PageContextCard'
import EmptyStateCard from '../../features/riskData/components/EmptyStateCard'
import ExportHistoryButton from '../../features/riskData/components/ExportHistoryButton'

function getErrorMessage(error, fallback = 'Something went wrong.') {
  return error?.message || fallback
}

function RiskDataPage() {
  const { id: projectId } = useParams()

  const [latestSnapshot, setLatestSnapshot] = useState(null)
  const [history, setHistory] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadRiskData = async () => {
    try {
      setPageLoading(true)
      setError('')

      const [latestResult, historyResult] = await Promise.allSettled([
        riskDataService.getLatestRiskData(projectId),
        riskDataService.getRiskHistory(projectId),
      ])

      if (latestResult.status === 'fulfilled') {
        setLatestSnapshot(latestResult.value.snapshot || null)
      } else {
        setLatestSnapshot(null)
      }

      if (historyResult.status === 'fulfilled') {
        setHistory(historyResult.value.history || [])
      } else {
        setHistory([])
      }

      if (latestResult.status === 'rejected' && historyResult.status === 'rejected') {
        setError(getErrorMessage(latestResult.reason, 'Failed to load risk data.'))
      }
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    if (!projectId) return
    loadRiskData()
  }, [projectId])

  const handleFetchLatest = async () => {
    try {
      setFetchLoading(true)
      setError('')
      setSuccessMessage('')

      const response = await riskDataService.fetchRiskData(projectId, {})
      setSuccessMessage(response.message || 'Risk data fetched successfully.')

      await loadRiskData()
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to fetch latest risk data.'))
    } finally {
      setFetchLoading(false)
    }
  }

  const handleDeleteSnapshot = async (snapshotId) => {
    try {
      setDeleteLoading(true)
      setError('')
      setSuccessMessage('')

      await riskDataService.deleteRiskSnapshot(snapshotId)
      setSuccessMessage('Snapshot deleted successfully.')

      await loadRiskData()
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to delete snapshot.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div>
        <PageHeader
          title="Disaster Risk Data"
          description="View and manage real-time environmental and seismic data collected for this project."
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200"></div>
            <div className="h-4 w-full animate-pulse rounded-lg bg-slate-100"></div>
            <div className="h-4 w-full animate-pulse rounded-lg bg-slate-100"></div>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-100"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const previousSnapshot = history.length > 0 ? history[0] : null

  return (
    <div>
      <PageHeader
        title="Disaster Risk Data"
        description="View and manage real-time environmental and seismic data collected for this project."
      />

      <PageContextCard projectId={projectId} />

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="text-lg">⚠️</div>
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="text-lg">✓</div>
          <div>
            <p className="font-semibold text-green-900">Success</p>
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      <RiskDataToolbar
        onFetch={handleFetchLatest}
        loading={fetchLoading}
        latestFetchedAt={latestSnapshot?.fetchedAt}
      />

      {latestSnapshot ? (
        <>
          <RiskSummaryHero
            latestSnapshot={latestSnapshot}
            previousSnapshot={previousSnapshot}
          />

          <LatestRiskSnapshotCard snapshot={latestSnapshot} />

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Snapshot History</h2>
              <p className="text-sm text-slate-600">
                {history.length} snapshot{history.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
            <ExportHistoryButton history={history} loading={deleteLoading} />
          </div>

          <RiskHistoryTable
            history={history}
            onDelete={handleDeleteSnapshot}
            loading={deleteLoading}
          />
        </>
      ) : (
        <div className="mb-8">
          <EmptyStateCard onFetch={handleFetchLatest} loading={fetchLoading} />
        </div>
      )}

      <DataSourceInfo />
    </div>
  )
}

export default RiskDataPage