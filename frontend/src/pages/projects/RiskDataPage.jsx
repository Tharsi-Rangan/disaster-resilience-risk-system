import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  Info,
  LineChart,
  MapPinned,
  RefreshCw,
  Share2,
  Sparkles,
  X,
} from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { riskDataService } from '../../services/riskDataService'
import ProjectInfoCard from '../../features/riskData/components/ProjectInfoCard'
import ProjectSwitcherCard from '../../features/riskData/components/ProjectSwitcherCard'
import RiskDataToolbar from '../../features/riskData/components/RiskDataToolbar'
import RiskSummaryHero from '../../features/riskData/components/RiskSummaryHero'
import LatestRiskSnapshotCard from '../../features/riskData/components/LatestRiskSnapshotCard'
import TrendComparison from '../../features/riskData/components/TrendComparison'
import SystemInsights from '../../features/riskData/components/SystemInsights'
import RiskTrendChart from '../../features/riskData/components/RiskTrendChart'
import DataSourceInfo from '../../features/riskData/components/DataSourceInfo'
import PageContextCard from '../../features/riskData/components/PageContextCard'
import EmptyStateCard from '../../features/riskData/components/EmptyStateCard'
import MapModal from '../../features/riskData/components/MapModal'
import WeatherDetailsModal from '../../features/riskData/components/WeatherDetailsModal'
import ShareFeatures from '../../features/riskData/components/ShareFeatures'
import RiskDataPageTabs from '../../features/riskData/components/RiskDataPageTabs'

function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  if (Array.isArray(error?.errors) && error.errors.length > 0) {
    return error.errors[0]?.msg || fallback
  }
  return fallback
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

function getRiskTone(snapshot) {
  const riskValue = Number(snapshot?.floodRiskIndex ?? 0)

  if (riskValue >= 60) {
    return {
      label: 'High risk',
      pill: 'bg-rose-100 text-rose-700 border border-rose-200',
      panel: 'from-rose-50 via-white to-orange-50',
    }
  }

  if (riskValue >= 30) {
    return {
      label: 'Moderate risk',
      pill: 'bg-amber-100 text-amber-700 border border-amber-200',
      panel: 'from-amber-50 via-white to-yellow-50',
    }
  }

  return {
    label: snapshot ? 'Low risk' : 'Waiting for data',
    pill: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    panel: 'from-emerald-50 via-white to-cyan-50',
  }
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

function SurfaceCard({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-slate-200/80 bg-white/92 shadow-sm backdrop-blur ${className}`}>
      {children}
    </div>
  )
}

function SectionHeader({ icon, title, description, accent = 'text-slate-700' }) {
  const SectionIcon = icon

  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="rounded-2xl bg-slate-100 p-2.5">
        <SectionIcon className={`h-4 w-4 ${accent}`} />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
    </div>
  )
}

function SummaryStrip({ latestSnapshot, history, projectOverview, fetchLoading }) {
  const riskTone = getRiskTone(latestSnapshot)
  const quickStats = [
    {
      label: 'Current status',
      value: riskTone.label,
      hint: latestSnapshot ? `Flood risk ${Math.round(Number(latestSnapshot.floodRiskIndex ?? 0))}` : 'No snapshot loaded',
      icon: Gauge,
    },
    {
      label: 'Latest capture',
      value: formatRelativeTime(latestSnapshot?.fetchedAt),
      hint: latestSnapshot?.fetchedAt
        ? new Date(latestSnapshot.fetchedAt).toLocaleString()
        : 'Fetch data to create the first snapshot',
      icon: Clock3,
    },
    {
      label: 'Snapshot history',
      value: `${history.length}`,
      hint: history.length === 1 ? '1 stored reading' : `${history.length} stored readings`,
      icon: Database,
    },
    {
      label: 'Project context',
      value: projectOverview?.type || projectOverview?.category || 'Project linked',
      hint: projectOverview?.title || projectOverview?.name || 'Risk monitoring workspace',
      icon: MapPinned,
    },
  ]

  return (
    <div className={`overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br ${riskTone.panel} p-5 shadow-sm`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskTone.pill}`}>
              {riskTone.label}
            </span>
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-600">
              Snapshot architecture enabled
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Risk monitoring that is easier to scan and safer to act on.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            This workspace keeps live hazard access, project context, trends, and archive history in one flow so users can move
            from overview to action without hunting around the page.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Project:</span>{' '}
            {projectOverview?.title || projectOverview?.name || 'Selected project'}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Live fetch:</span> {fetchLoading ? 'Running' : 'Ready'}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-slate-100 p-2">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              </div>
              <p className="mt-3 text-lg font-bold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{item.hint}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LoadingShell() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-r from-slate-50 via-white to-cyan-50 p-8 shadow-sm">
        <div className="space-y-4">
          <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-10 w-80 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded-lg bg-slate-100" />
          <div className="grid gap-3 md:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-100 bg-white" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr,1.1fr]">
        {[0, 1].map((item) => (
          <div key={item} className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
        ))}
      </div>

      <div className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-56 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
        <div className="h-56 animate-pulse rounded-3xl border border-slate-200 bg-white/80" />
      </div>
    </div>
  )
}

function RiskDataPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()

  const [latestSnapshot, setLatestSnapshot] = useState(null)
  const [history, setHistory] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [toasts, setToasts] = useState([])
  const [latestFetchError, setLatestFetchError] = useState('')
  const [projectOverview, setProjectOverview] = useState(null)
  const toastTimersRef = useRef({})

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
      } else if (latestResult.status === 'rejected') {
        pushToast(
          'warning',
          'Latest snapshot unavailable',
          getErrorMessage(latestResult.reason, 'History loaded, but the latest snapshot could not be retrieved.')
        )
      } else if (historyResult.status === 'rejected') {
        pushToast(
          'warning',
          'History unavailable',
          getErrorMessage(historyResult.reason, 'Latest snapshot loaded, but snapshot history could not be retrieved.')
        )
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

  const handleOpenHistoryPage = useCallback(() => {
    navigate(`/projects/${projectId}/risk-data/history`)
  }, [navigate, projectId])

  if (pageLoading) {
    return <LoadingShell />
  }

  const previousSnapshot = history.length > 1 ? history[1] : null
  const projectLocationData = projectOverview?.location || projectOverview?.coordinates || {}
  const projectLat =
    projectLocationData?.latitude ??
    projectLocationData?.lat ??
    projectOverview?.latitude ??
    projectOverview?.lat ??
    (Array.isArray(projectLocationData?.coordinates) ? projectLocationData.coordinates[1] : undefined)
  const projectLng =
    projectLocationData?.longitude ??
    projectLocationData?.lng ??
    projectLocationData?.lon ??
    projectOverview?.longitude ??
    projectOverview?.lng ??
    projectOverview?.lon ??
    (Array.isArray(projectLocationData?.coordinates) ? projectLocationData.coordinates[0] : undefined)

  const parsedProjectLat = Number(projectLat)
  const parsedProjectLng = Number(projectLng)
  const mapProjectLocation =
    Number.isFinite(parsedProjectLat) && Number.isFinite(parsedProjectLng)
      ? { latitude: parsedProjectLat, longitude: parsedProjectLng }
      : null

  return (
    <div className="relative mx-auto max-w-7xl space-y-8 pb-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="absolute right-0 top-52 h-72 w-72 rounded-full bg-emerald-100/45 blur-3xl" />
        <div className="absolute left-1/3 top-1/3 h-48 w-48 rounded-full bg-violet-100/35 blur-3xl" />
      </div>

      <div className="overflow-hidden rounded-4xl border border-slate-700/60 bg-linear-to-br from-[#0b1326] via-[#162033] to-[#22324a] px-6 py-7 text-white shadow-xl shadow-slate-900/20">
        <div className="absolute inset-0 opacity-20" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl [&_h1]:text-white [&_p]:text-slate-200">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-500/50 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Risk data workspace
            </div>
            <PageHeader
              title="Disaster Risk Intelligence"
              description="View, compare, and share environmental and seismic snapshots for this project from one streamlined dashboard."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-500/40 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Project</p>
              <p className="mt-1 text-sm font-semibold text-white">{projectOverview?.title || projectOverview?.name || 'Selected'}</p>
            </div>
            <div className="rounded-2xl border border-slate-500/40 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Snapshots</p>
              <p className="mt-1 text-sm font-semibold text-white">{history.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-500/40 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Updated</p>
              <p className="mt-1 text-sm font-semibold text-white">{formatRelativeTime(latestSnapshot?.fetchedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <SummaryStrip
        latestSnapshot={latestSnapshot}
        history={history}
        projectOverview={projectOverview}
        fetchLoading={fetchLoading}
      />

      <RiskDataPageTabs projectId={projectId} current="risk-data" />

      <div className="grid gap-4 xl:grid-cols-[1fr,1.1fr]">
        <SurfaceCard className="p-1">
          <ProjectSwitcherCard currentProjectId={projectId} onSwitchProject={handleSwitchProject} />
        </SurfaceCard>
        <SurfaceCard className="p-1">
          <ProjectInfoCard projectId={projectId} onProjectLoaded={handleProjectLoaded} />
        </SurfaceCard>
      </div>

      <SurfaceCard className="p-1">
        <PageContextCard projectId={projectId} />
      </SurfaceCard>

      <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      <SurfaceCard className="overflow-hidden p-4">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white p-2.5 shadow-sm">
              <RefreshCw className={`h-4 w-4 text-cyan-700 ${fetchLoading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Live data collection</p>
              <p className="text-xs leading-5 text-slate-600">
                Trigger a fresh risk snapshot, then review changes across history, trends, and project tools below.
              </p>
            </div>
          </div>
          <div className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs text-slate-600">
            Last snapshot: <span className="font-semibold text-slate-900">{formatRelativeTime(latestSnapshot?.fetchedAt)}</span>
          </div>
        </div>

        <RiskDataToolbar
          onFetch={handleFetchLatest}
          loading={fetchLoading}
          latestFetchedAt={latestSnapshot?.fetchedAt}
        />
      </SurfaceCard>

      {latestSnapshot ? (
        <>
          <RiskSummaryHero latestSnapshot={latestSnapshot} previousSnapshot={previousSnapshot} />

          <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
            <SurfaceCard className="p-4">
              <SectionHeader
                icon={MapPinned}
                title="Operational Tools"
                description="Open map and weather actions for the current project context."
                accent="text-cyan-700"
              />
              <div className="flex flex-wrap gap-3">
                <MapModal
                  projectLocation={mapProjectLocation}
                  projectName={projectOverview?.title || projectOverview?.name || 'Project'}
                  projectOverview={projectOverview}
                  latestSnapshot={latestSnapshot}
                />
                <WeatherDetailsModal snapshot={latestSnapshot} />
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-4">
              <SectionHeader
                icon={Share2}
                title="Quick Actions — Live Snapshot"
                description="Share the latest project risk snapshot for quick decision-making."
                accent="text-blue-700"
              />
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleOpenHistoryPage}
                  className="inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-white"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Open Snapshot History</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Open the archive page for historical records, reporting exports, and full snapshot review.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-600" />
                </button>

                <ShareFeatures
                  snapshot={latestSnapshot}
                  history={history}
                  projectName={projectOverview?.title || projectOverview?.name || 'Project'}
                  projectId={projectId}
                  projectOverview={projectOverview}
                  onFeedback={handleShareFeedback}
                  showExport={false}
                />
              </div>
            </SurfaceCard>
          </div>

          <SurfaceCard className="p-5">
            <SectionHeader
              icon={LineChart}
              title="Trend Intelligence"
              description="Compare the latest reading with previous snapshots and spot change over time."
              accent="text-violet-700"
            />
            <div className="space-y-6">
              <TrendComparison current={latestSnapshot} previous={previousSnapshot} />
              <SystemInsights snapshot={latestSnapshot} />
              <RiskTrendChart history={history} />
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-4">
            <SectionHeader
              icon={Gauge}
              title="Latest Snapshot"
              description="Current reading details for decision-making and quick review."
              accent="text-emerald-700"
            />
            <LatestRiskSnapshotCard snapshot={latestSnapshot} />
          </SurfaceCard>
        </>
      ) : (
        <SurfaceCard className="overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-cyan-50 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">No snapshots yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Start with a safe first fetch to populate the dashboard, timeline, and supporting tools.
            </p>
          </div>
          <div className="p-4">
            <EmptyStateCard onFetch={handleFetchLatest} loading={fetchLoading} />
          </div>
        </SurfaceCard>
      )}

      <SurfaceCard className="p-4">
        <SectionHeader
          icon={Info}
          title="Data Source and Diagnostics"
          description="Reference the source details and any fetch-related issues from the latest request."
          accent="text-emerald-700"
        />
        <DataSourceInfo snapshot={latestSnapshot} fetchErrorMessage={latestFetchError} />
      </SurfaceCard>
    </div>
  )
}

export default RiskDataPage
