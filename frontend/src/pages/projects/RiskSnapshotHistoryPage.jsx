import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Activity, ArrowLeft, Database, History, Share2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { riskDataService } from '../../services/riskDataService'
import useAuth from '../../hooks/useAuth'
import { USER_ROLES } from '../../utils/constants'
import ProjectInfoCard from '../../features/riskData/components/ProjectInfoCard'
import ProjectSwitcherCard from '../../features/riskData/components/ProjectSwitcherCard'
import RiskHistoryTable from '../../features/riskData/components/RiskHistoryTable'
import ExportHistoryButton from '../../features/riskData/components/ExportHistoryButton'
import ShareFeatures from '../../features/riskData/components/ShareFeatures'
import SnapshotComparisonChart from '../../features/riskData/components/SnapshotComparisonChart'
import RiskDataPageTabs from '../../features/riskData/components/RiskDataPageTabs'

function normalizeRole(roleValue) {
  const role = String(roleValue || '').trim().toUpperCase()
  if (role === 'USER' || role === 'CONTRACTER') return USER_ROLES.CONTRACTOR
  return role
}

function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  if (Array.isArray(error?.errors) && error.errors.length > 0) {
    return error.errors[0]?.msg || fallback
  }
  return fallback
}

function SurfaceCard({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-slate-200/80 bg-white/92 shadow-sm backdrop-blur ${className}`}>
      {children}
    </div>
  )
}

function LoadingShell() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <div className="h-36 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
      <div className="grid gap-4 xl:grid-cols-[1fr,1.1fr]">
        <div className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
        <div className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
      </div>
      <div className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
      <div className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
    </div>
  )
}

function formatRelativeTime(value) {
  if (!value) return 'No snapshot yet'
  const date = new Date(value)
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

function RiskSnapshotHistoryPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [latestSnapshot, setLatestSnapshot] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [projectOverview, setProjectOverview] = useState(null)
  const [pageError, setPageError] = useState('')

  const userRole = normalizeRole(user?.role)
  const canDeleteSnapshots = userRole === USER_ROLES.ADMIN

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)
      setPageError('')

      const [latestResult, historyResult] = await Promise.allSettled([
        riskDataService.getLatestRiskData(projectId),
        riskDataService.getRiskHistory(projectId),
      ])

      setLatestSnapshot(latestResult.status === 'fulfilled' ? latestResult.value.snapshot || null : null)
      setHistory(historyResult.status === 'fulfilled' ? historyResult.value.history || [] : [])

      if (latestResult.status === 'rejected' && historyResult.status === 'rejected') {
        setPageError(getErrorMessage(latestResult.reason, 'Unable to load snapshot history.'))
      }
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    loadHistory()
  }, [projectId, loadHistory])

  const handleDeleteSnapshot = async (snapshotId) => {
    if (!canDeleteSnapshots) return

    try {
      setDeleteLoading(true)
      await riskDataService.deleteRiskSnapshot(snapshotId)
      await loadHistory()
    } catch (error) {
      setPageError(getErrorMessage(error, 'Failed to delete snapshot.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSwitchProject = useCallback(
    (nextProjectId) => {
      if (!nextProjectId || String(nextProjectId) === String(projectId)) return
      navigate(`/projects/${nextProjectId}/risk-data/history`)
    },
    [navigate, projectId]
  )

  const handleProjectLoaded = useCallback((projectData) => {
    setProjectOverview(projectData || null)
  }, [])

  if (loading) {
    return <LoadingShell />
  }

  const totalEarthquakeEvents = history.reduce((sum, item) => sum + Number(item?.earthquakeCount || 0), 0)
  const averageFloodRisk =
    history.length > 0
      ? history.reduce((sum, item) => sum + Number(item?.floodRiskIndex || 0), 0) / history.length
      : 0

  return (
    <div className="relative mx-auto max-w-7xl space-y-8 pb-12">
      <div className="overflow-hidden rounded-4xl border border-slate-200/80 bg-linear-to-r from-slate-50 via-white to-blue-50 px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">
              <History className="h-3.5 w-3.5 text-blue-600" />
              Snapshot history workspace
            </div>
            <PageHeader
              title="Snapshot History"
              description="Review the full archive of stored risk snapshots, export records, and share the latest summary from a dedicated page."
            />
          </div>

          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/risk-data`)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Risk Dashboard
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr,1.1fr]">
        <SurfaceCard className="p-1">
          <ProjectSwitcherCard currentProjectId={projectId} onSwitchProject={handleSwitchProject} />
        </SurfaceCard>
        <SurfaceCard className="p-1">
          <ProjectInfoCard projectId={projectId} onProjectLoaded={handleProjectLoaded} />
        </SurfaceCard>
      </div>

      <RiskDataPageTabs projectId={projectId} current="history" />

      <SurfaceCard className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-linear-to-r from-violet-50 via-white to-cyan-50 px-5 py-4">
          <p className="text-sm font-semibold text-slate-900">How To Use This Page</p>
          <p className="mt-1 text-xs text-slate-500">
            Start with the overview, review the chart for patterns, then confirm details in the archive table below.
          </p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">1. Scan</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Use overview cards first</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Quickly understand archive size, latest entry timing, average flood risk, and total seismic events.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">2. Compare</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Switch chart metrics</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Compare rainfall, humidity, wind, temperature, earthquakes, and flood risk to spot what changed over time.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">3. Report</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Export or share findings</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use archive actions to generate reports or share the latest summary without leaving the history workspace.
            </p>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Archive Focus</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Understand what changed across stored snapshots</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This page is designed for review, comparison, and reporting. Use the chart to detect patterns, then validate the exact readings in the table.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Recommended Flow</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Overview → Compare → Report</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Best For</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Trend checks and archived decision review</p>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-slate-100 p-2">
            <History className="h-4 w-4 text-slate-700" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">History Overview</h2>
            <p className="text-xs text-slate-500">
              A quick read of the archive before you explore charts and detailed records.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Stored Snapshots</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{history.length}</p>
            <p className="mt-1 text-xs text-slate-500">Complete archive for this selected project.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Latest Archive Entry</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatRelativeTime(latestSnapshot?.fetchedAt)}</p>
            <p className="mt-1 text-xs text-slate-500">
              {latestSnapshot?.fetchedAt ? new Date(latestSnapshot.fetchedAt).toLocaleString() : 'No data available'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Average Flood Risk</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{averageFloodRisk.toFixed(1)}</p>
            <p className="mt-1 text-xs text-slate-500">Average hazard signal across the stored timeline.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Earthquake Events</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalEarthquakeEvents}</p>
            <p className="mt-1 text-xs text-slate-500">Total recorded seismic events in the archive window.</p>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-slate-100 p-2">
                <Database className="h-4 w-4 text-slate-700" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Archive Actions — Snapshot History</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Export or share historical risk snapshot records for reporting and review.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ExportHistoryButton
              history={history}
              latestSnapshot={latestSnapshot}
              loading={deleteLoading}
              projectName={projectOverview?.title || projectOverview?.name || 'Project'}
              projectId={projectId}
              projectOverview={projectOverview}
            />
          </div>
        </div>

        {latestSnapshot ? (
          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-blue-700" />
              <p className="text-sm font-semibold text-slate-700">History Summary Sharing</p>
            </div>
            <ShareFeatures
              snapshot={latestSnapshot}
              history={history}
              projectName={projectOverview?.title || projectOverview?.name || 'Project'}
              projectId={projectId}
              projectOverview={projectOverview}
              showExport={false}
            />
          </div>
        ) : null}

        {pageError ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {pageError}
          </div>
        ) : null}
      </SurfaceCard>

      <SurfaceCard className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-slate-100 p-2">
            <Activity className="h-4 w-4 text-violet-700" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Historical Analysis</h2>
            <p className="text-xs text-slate-500">
              Compare selected weather and hazard fields before diving into the raw archive.
            </p>
          </div>
        </div>

        <SnapshotComparisonChart history={history} />
      </SurfaceCard>

      <SurfaceCard className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-slate-100 p-2">
            <History className="h-4 w-4 text-slate-700" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Full Snapshot Archive</h2>
            <p className="text-xs text-slate-500">
              {history.length} snapshot{history.length !== 1 ? 's' : ''} currently stored for this project.
            </p>
          </div>
        </div>

        <RiskHistoryTable
          history={history}
          onDelete={canDeleteSnapshots ? handleDeleteSnapshot : null}
          loading={deleteLoading}
          defaultOpen
        />
      </SurfaceCard>
    </div>
  )
}

export default RiskSnapshotHistoryPage
