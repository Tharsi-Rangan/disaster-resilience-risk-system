import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/feedback/LoadingSpinner'
import EmptyState from '../../components/feedback/EmptyState'
import riskDataService from '../../services/riskDataService'
import LatestSnapshotCard from '../../features/riskData/components/LatestSnapshotCard'
import RiskHistoryTable from '../../features/riskData/components/RiskHistoryTable'

function RiskDataPage() {
  const { projectId } = useParams()
  const [snapshot, setSnapshot] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch latest snapshot and history on mount or when refreshing
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const latestData = await riskDataService.getLatestRiskData(projectId)
      setSnapshot(latestData.snapshot)

      const historyData = await riskDataService.getRiskHistory(projectId)
      setHistory(historyData.history || [])
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load risk data'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchData()
    }
  }, [projectId])

  const handleRefresh = () => {
    fetchData()
  }

  const handleDelete = (snapshotId) => {
    // Remove deleted snapshot from history
    setHistory(history.filter((s) => s._id !== snapshotId))
    // If deleted snapshot was the latest, refresh
    if (snapshot?._id === snapshotId) {
      fetchData()
    }
  }

  if (!projectId) {
    return (
      <EmptyState
        title="No Project Selected"
        description="Please select a project to view risk data."
      />
    )
  }

  if (error && !snapshot && !history.length) {
    return (
      <div>
        <PageHeader
          title="Risk Data"
          description="Fetch and review project risk snapshots"
        />
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">⚠️ {error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Risk Data"
        description="Fetch and review project risk snapshots and historical data"
      />

      {/* Latest Snapshot Section */}
      <section className="mb-8">
        <LatestSnapshotCard
          projectId={projectId}
          snapshot={snapshot}
          onRefresh={handleRefresh}
          isLoading={isLoading && !snapshot}
        />
      </section>

      {/* History Section */}
      <section>
        <RiskHistoryTable history={history} onDelete={handleDelete} />
      </section>
    </div>
  )
}

export default RiskDataPage