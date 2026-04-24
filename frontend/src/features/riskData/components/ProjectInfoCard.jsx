import { MapPin, Calendar, MapPinned } from 'lucide-react'
import { useState, useEffect } from 'react'
import { projectService } from '../../../services/projectService'

function formatCoordinatesHumanReadable(latitude, longitude) {
  const latNum = Number(latitude)
  const lonNum = Number(longitude)

  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return 'N/A'

  const latDir = latNum >= 0 ? 'N' : 'S'
  const lonDir = lonNum >= 0 ? 'E' : 'W'

  return `${Math.abs(latNum).toFixed(4)}° ${latDir}, ${Math.abs(lonNum).toFixed(4)}° ${lonDir}`
}

function toLabel(value, fallback = 'N/A') {
  if (!value && value !== 0) return fallback
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getStatusBadgeClass(status) {
  const normalized = String(status || 'DRAFT').toUpperCase()

  if (normalized === 'APPROVED') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (normalized === 'ANALYZING') return 'border-amber-200 bg-amber-50 text-amber-700'
  if (normalized === 'HIGH_RISK') return 'border-rose-200 bg-rose-50 text-rose-700'
  return 'border-slate-200 bg-slate-100 text-slate-700'
}

function InfoBlock({ icon, label, value, hint, iconClassName, accentClassName }) {
  const BlockIcon = icon

  return (
    <div className={`group rounded-2xl border bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 ${accentClassName}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-xl p-2.5 transition ${iconClassName}`}>
          <BlockIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-900 md:text-base">{value}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
        </div>
      </div>
    </div>
  )
}

function ProjectInfoCard({ projectId, onProjectLoaded = null }) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await projectService.getProjectById(projectId)
        const projectData = response.data?.project || response.project || response.data || response
        setProject(projectData)
        onProjectLoaded?.(projectData)
      } catch {
        setError('Could not load project details')
        setProject(null)
        onProjectLoaded?.(null)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId, onProjectLoaded])

  if (loading) {
    return (
      <div className="mb-6 overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-sm">
        <div className="h-1 w-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400"></div>
        <div className="grid gap-4 p-6 md:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm">
              <div className="h-4 w-24 animate-pulse rounded bg-amber-100"></div>
              <div className="mt-3 h-6 w-40 animate-pulse rounded bg-orange-100"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !project) {
    return null
  }

  const createdDate = project?.createdAt
    ? new Date(project.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : project?.created_at
      ? new Date(project.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A'

  const location = project?.location || project?.coordinates || {}
  const projectDisplayName =
    project?.title || project?.name || project?.projectName || project?.project_name || 'Unnamed Project'
  const projectType = toLabel(project?.projectType || project?.type)
  const projectStatus = toLabel(project?.status || 'DRAFT', 'Draft')

  const latitude =
    location?.latitude ??
    location?.lat ??
    project?.latitude ??
    project?.lat ??
    (Array.isArray(location?.coordinates) ? location.coordinates[1] : undefined)

  const longitude =
    location?.longitude ??
    location?.lng ??
    location?.lon ??
    project?.longitude ??
    project?.lng ??
    project?.lon ??
    (Array.isArray(location?.coordinates) ? location.coordinates[0] : undefined)

  const hasCoordinates = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
  const locationText =
    project?.address ||
    project?.locationName ||
    project?.location_name ||
    (hasCoordinates ? formatCoordinatesHumanReadable(latitude, longitude) : 'N/A')

  const projectInitial = String(projectDisplayName || 'P').trim().charAt(0).toUpperCase() || 'P'

  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-amber-100/90 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-sm">
      <div className="h-1 w-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400"></div>

      <div className="border-b border-amber-100 bg-linear-to-r from-amber-50/80 via-white to-orange-50/70 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-orange-200 text-sm font-bold text-orange-900 shadow-sm">
              {projectInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">Project Overview</p>
              <p className="truncate text-base font-semibold text-slate-900">{projectDisplayName}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm ${getStatusBadgeClass(projectStatus)}`}
          >
            {projectStatus}
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Key project details are grouped here so users can quickly confirm location, type, and creation date before
          reviewing risk data.
        </p>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
        <InfoBlock
          icon={MapPinned}
          label="Project Name"
          value={projectDisplayName}
          hint="Primary project reference used across this page"
          accentClassName="border-amber-100 hover:border-amber-200 hover:bg-amber-50/70"
          iconClassName="bg-amber-100 text-amber-700 group-hover:bg-amber-200"
        />

        <InfoBlock
          icon={MapPinned}
          label="Type"
          value={projectType}
          hint="Helps users interpret the risk context"
          accentClassName="border-orange-100 hover:border-orange-200 hover:bg-orange-50/70"
          iconClassName="bg-orange-100 text-orange-700 group-hover:bg-orange-200"
        />

        <InfoBlock
          icon={MapPin}
          label="Location"
          value={locationText}
          hint="Readable project address or coordinates"
          accentClassName="border-cyan-100 hover:border-cyan-200 hover:bg-cyan-50/70"
          iconClassName="bg-cyan-100 text-cyan-700 group-hover:bg-cyan-200"
        />

        <InfoBlock
          icon={Calendar}
          label="Created"
          value={createdDate}
          hint="Useful for tracing project lifecycle and updates"
          accentClassName="border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/70"
          iconClassName="bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200"
        />
      </div>
    </div>
  )
}

export default ProjectInfoCard
