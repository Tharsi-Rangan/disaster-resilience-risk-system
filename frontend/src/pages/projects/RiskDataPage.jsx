import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Clock3, Database, Info, LineChart, MapPinned, Share2, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { riskDataService } from '../../services/riskDataService'
import useAuth from '../../hooks/useAuth'
import { USER_ROLES } from '../../utils/constants'
import ProjectInfoCard from '../../features/riskData/components/ProjectInfoCard'
import ProjectSwitcherCard from '../../features/riskData/components/ProjectSwitcherCard'
import RiskDataToolbar from '../../features/riskData/components/RiskDataToolbar'
import RiskSummaryHero from '../../features/riskData/components/RiskSummaryHero'
import LatestRiskSnapshotCard from '../../features/riskData/components/LatestRiskSnapshotCard'
import TrendComparison from '../../features/riskData/components/TrendComparison'
import SystemInsights from '../../features/riskData/components/SystemInsights'
import RiskTrendChart from '../../features/riskData/components/RiskTrendChart'
import RiskHistoryTable from '../../features/riskData/components/RiskHistoryTable'
import DataSourceInfo from '../../features/riskData/components/DataSourceInfo'
import PageContextCard from '../../features/riskData/components/PageContextCard'
import EmptyStateCard from '../../features/riskData/components/EmptyStateCard'
import MapModal from '../../features/riskData/components/MapModal'
import WeatherDetailsModal from '../../features/riskData/components/WeatherDetailsModal'
import ShareFeatures from '../../features/riskData/components/ShareFeatures'

function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  if (Array.isArray(error?.errors) && error.errors.length > 0) {
    return error.errors[0]?.msg || fallback
  }
  return fallback
}

function normalizeRole(roleValue) {
  const role = String(roleValue || '').trim().toUpperCase()
  if (role === 'USER' || role === 'CONTRACTER') return USER_ROLES.CONTRACTOR
  return role
}

function Toast({ toast, onClose }) {
  const stylesByType = {
    success: {
      wrapper: 'border-emerald-200/90 bg-emerald-50/95 text-emerald-900',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    },
    warning: {
      wrapper: 'border-amber-200/90 bg-amber-50/95 text-amber-900',
      icon: <Clock3 className="h-5 w-5 text-amber-600" />,
    },
    error: {
      wrapper: 'border-red-200/90 bg-red-50/95 text-red-900',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    },
    info: {
      wrapper: 'border-blue-200/90 bg-blue-50/95 text-blue-900',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
  }

  const typeStyle = stylesByType[toast.type] || stylesByType.info

  return (
    <div
      className={`pointer-events-auto flex gap-3 rounded-2xl border px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur ${typeStyle.wrapper}`}
    >
      <div className="shrink-0">{typeStyle.icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-xs opacity-90">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-white/60 hover:text-slate-700"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function RiskDataPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [latestSnapshot, setLatestSnapshot] = useState(null)
  const [history, setHistory] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toasts, setToasts] = useState([])
  const [latestFetchError, setLatestFetchError] = useState('')
  const [projectOverview, setProjectOverview] = useState(null)
  const toastTimersRef = useRef({})

  const userRole = normalizeRole(user?.role)
  const canDeleteSnapshots = userRole === USER_ROLES.ADMIN

  const removeToast = useCallback((toastId) => {
    const timeoutId = toastTimersRef.current[toastId]
    if (timeoutId) {
      clearTimeout(timeoutId)
      delete toastTimersRef.current[toastId]
    }
    setToasts((current) => current.filter((toast) => toast.id !== toastId))
  }, [])

  const pushToast = useCallback((type, title, message = '') => {
    const toastId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const nextToast = { id: toastId, type, title, message }

    setToasts((current) => [...current, nextToast].slice(-4))

    const timeoutId = setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== toastId))
      delete toastTimersRef.current[toastId]
    }, 5000)

    toastTimersRef.current[toastId] = timeoutId
  }, [])

  useEffect(() => {
    return () => {
      Object.values(toastTimersRef.current).forEach((timeoutId) => clearTimeout(timeoutId))
      toastTimersRef.current = {}
    }
  }, [])

  const loadRiskData = useCallback(async () => {
    try {
      setPageLoading(true)
      setLatestFetchError('')

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
        pushToast('error', 'Unable to load risk data', getErrorMessage(latestResult.reason, 'Failed to load risk data.'))
      }
    } finally {
      setPageLoading(false)
    }
  }, [projectId, pushToast])

  useEffect(() => {
    if (!projectId) return
    loadRiskData()
  }, [projectId, loadRiskData])

  const handleFetchLatest = async () => {
    try {
      setFetchLoading(true)
      setLatestFetchError('')

      const response = await riskDataService.fetchRiskData(projectId, {})
      pushToast('success', 'Latest data fetched', response.message || 'Risk data fetched successfully.')

      await loadRiskData()
    } catch (error) {
      const backendMessage = getErrorMessage(error, 'Failed to fetch latest risk data.')
      setLatestFetchError(backendMessage)

      const normalized = backendMessage.toLowerCase()
      const isCooldown =
        normalized.includes('cooldown') ||
        normalized.includes('wait') ||
        normalized.includes('rate limit') ||
        normalized.includes('too many requests')

      if (isCooldown) {
        pushToast('warning', 'Fetch cooldown active', backendMessage)
      } else {
        pushToast('error', 'Fetch failed', backendMessage)
      }
    } finally {
      setFetchLoading(false)
    }
  }

  const handleDeleteSnapshot = async (snapshotId) => {
    if (!canDeleteSnapshots) return

    try {
      setDeleteLoading(true)

      await riskDataService.deleteRiskSnapshot(snapshotId)
      pushToast('success', 'Snapshot deleted', 'Snapshot deleted successfully.')

      await loadRiskData()
    } catch (error) {
      pushToast('error', 'Delete failed', getErrorMessage(error, 'Failed to delete snapshot.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleShareFeedback = useCallback(
    (feedback) => {
      if (!feedback?.type || !feedback?.title) return
      pushToast(feedback.type, feedback.title, feedback.message || '')
    },
    [pushToast]
  )

  const handleSwitchProject = useCallback(
    (nextProjectId) => {
      if (!nextProjectId || String(nextProjectId) === String(projectId)) return
      navigate(`/projects/${nextProjectId}/risk-data`)
    },
    [navigate, projectId]
  )

  const handleProjectLoaded = useCallback((projectData) => {
    setProjectOverview(projectData || null)
  }, [])

  if (pageLoading) {
    return (
      <div className="space-y-8 pb-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
        <PageHeader
          title="Disaster Risk Intelligence"
          description="View and manage real-time environmental and seismic data collected for this project."
        />
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-8 shadow-sm">
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

  const previousSnapshot = history.length > 1 ? history[1] : null

  return (
    <div className="relative mx-auto max-w-7xl animate-in fade-in space-y-8 pb-10 duration-500">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-cyan-100/50 blur-3xl" />
        <div className="absolute right-0 top-52 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />
      </div>

      <PageHeader
        title="Disaster Risk Intelligence"
        description="View and manage real-time environmental and seismic data collected for this project."
      />

      <div className="grid gap-4 xl:grid-cols-[1fr,1.1fr]">
        <ProjectSwitcherCard
          currentProjectId={projectId}
          onSwitchProject={handleSwitchProject}
        />
        <ProjectInfoCard projectId={projectId} onProjectLoaded={handleProjectLoaded} />
      </div>

      <PageContextCard projectId={projectId} />

      <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur">
        <RiskDataToolbar
          onFetch={handleFetchLatest}
          loading={fetchLoading}
          latestFetchedAt={latestSnapshot?.fetchedAt}
        />
      </div>

      {latestSnapshot ? (
        <>
          <RiskSummaryHero
            latestSnapshot={latestSnapshot}
            previousSnapshot={previousSnapshot}
          />

          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-cyan-700" />
              <p className="text-sm font-semibold text-slate-700">Operational Tools</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <MapModal
                projectLocation={latestSnapshot.projectLocation}
                projectName={projectOverview?.title || projectOverview?.name || 'Project'}
              />
              <WeatherDetailsModal snapshot={latestSnapshot} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-blue-700" />
              <p className="text-sm font-semibold text-slate-700">Collaboration & Sharing</p>
            </div>
            <ShareFeatures
              snapshot={latestSnapshot}
              history={history}
              projectName={projectOverview?.title || projectOverview?.name || 'Project'}
              projectOverview={projectOverview}
              onFeedback={handleShareFeedback}
            />
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <LineChart className="h-4 w-4 text-violet-700" />
              <p className="text-sm font-semibold text-slate-700">Trend Intelligence</p>
            </div>

            <div className="space-y-6">
              <TrendComparison
                current={latestSnapshot}
                previous={previousSnapshot}
              />

              <SystemInsights snapshot={latestSnapshot} />

              <RiskTrendChart history={history} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr,1.35fr]">
            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur">
              <LatestRiskSnapshotCard snapshot={latestSnapshot} />
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur">
              <div className="mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-700" />
                <p className="text-sm font-semibold text-slate-700">Snapshot Archive</p>
              </div>
              <RiskHistoryTable
                history={history}
                onDelete={canDeleteSnapshots ? handleDeleteSnapshot : null}
                loading={deleteLoading}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur">
          <EmptyStateCard onFetch={handleFetchLatest} loading={fetchLoading} />
        </div>
      )}

      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur">
        <DataSourceInfo snapshot={latestSnapshot} fetchErrorMessage={latestFetchError} />
      </div>
    </div>
  )
}

export default RiskDataPage
