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
      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-blue-500 to-cyan-500"></div>
        <div className="grid gap-4 p-6 md:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200"></div>
              <div className="mt-3 h-6 w-40 animate-pulse rounded bg-slate-100"></div>
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
        day: 'numeric'
      })
    : project?.created_at
    ? new Date(project.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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
    <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-sky-500 to-teal-500"></div>

      <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 via-white to-slate-50 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
            {projectInitial}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Project Overview</p>
            <p className="truncate text-base font-semibold text-slate-900">{projectDisplayName}</p>
          </div>
          </div>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusBadgeClass(projectStatus)}`}>
            {projectStatus}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-600">You are viewing risk data for this project.</p>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-4">
        <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-indigo-100 p-2.5 transition group-hover:bg-indigo-200">
              <MapPinned className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project Name</p>
              <p className="mt-1 truncate text-lg font-bold text-slate-900">{projectDisplayName}</p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-violet-200 hover:bg-violet-50/40">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-violet-100 p-2.5 transition group-hover:bg-violet-200">
              <MapPinned className="h-5 w-5 text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">{projectType}</p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5 transition group-hover:bg-blue-200">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">{locationText}</p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-100 p-2.5 transition group-hover:bg-emerald-200">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{createdDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectInfoCard
