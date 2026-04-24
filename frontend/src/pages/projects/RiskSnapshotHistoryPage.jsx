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

  return (
    <div className="relative mx-auto max-w-7xl space-y-8 pb-12">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-blue-50 px-6 py-7 shadow-sm">
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
