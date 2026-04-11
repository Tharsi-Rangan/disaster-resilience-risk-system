import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Clock3, Info, X } from 'lucide-react'
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
      wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    },
    warning: {
      wrapper: 'border-amber-200 bg-amber-50 text-amber-900',
      icon: <Clock3 className="h-5 w-5 text-amber-600" />,
    },
    error: {
      wrapper: 'border-red-200 bg-red-50 text-red-900',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    },
    info: {
      wrapper: 'border-blue-200 bg-blue-50 text-blue-900',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
  }

  const typeStyle = stylesByType[toast.type] || stylesByType.info

  return (
    <div className={`pointer-events-auto flex gap-3 rounded-xl border px-4 py-3 shadow-sm ${typeStyle.wrapper}`}>
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

  const previousSnapshot = history.length > 1 ? history[1] : null

  return (
    <div>
      <PageHeader
        title="Disaster Risk Data"
        description="View and manage real-time environmental and seismic data collected for this project."
      />

      <ProjectSwitcherCard
        currentProjectId={projectId}
        onSwitchProject={handleSwitchProject}
      />

      <ProjectInfoCard projectId={projectId} onProjectLoaded={handleProjectLoaded} />

      <PageContextCard projectId={projectId} />

      <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

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

          <div className="mb-6 flex flex-wrap gap-3">
            <MapModal
              projectLocation={latestSnapshot.projectLocation}
              projectName={projectOverview?.title || projectOverview?.name || 'Project'}
            />
            <WeatherDetailsModal snapshot={latestSnapshot} />
          </div>

          <ShareFeatures
            snapshot={latestSnapshot}
            history={history}
            projectName={projectOverview?.title || projectOverview?.name || 'Project'}
            projectOverview={projectOverview}
            onFeedback={handleShareFeedback}
          />

          <TrendComparison
            current={latestSnapshot}
            previous={previousSnapshot}
          />

          <SystemInsights snapshot={latestSnapshot} />

          <RiskTrendChart history={history} />

          <LatestRiskSnapshotCard snapshot={latestSnapshot} />

          <RiskHistoryTable
            history={history}
            onDelete={canDeleteSnapshots ? handleDeleteSnapshot : null}
            loading={deleteLoading}
          />
        </>
      ) : (
        <div className="mb-8">
          <EmptyStateCard onFetch={handleFetchLatest} loading={fetchLoading} />
        </div>
      )}

      <DataSourceInfo snapshot={latestSnapshot} fetchErrorMessage={latestFetchError} />
    </div>
  )
}

export default RiskDataPage