/* eslint-disable no-unused-vars */
import { MapPin, Calendar, MapPinned } from 'lucide-react'
import { useState, useEffect } from 'react'
import { projectService } from '../../../services/projectService'

function ProjectInfoCard({ projectId }) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await projectService.getProjectById(projectId)
        // Handle different response structures from API
        const projectData = response.data?.project || response.project || response.data || response
        setProject(projectData)
      } catch (_) {
        setError('Could not load project details')
        setProject(null)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200"></div>
          <div className="h-4 w-48 animate-pulse rounded bg-slate-100"></div>
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
    (hasCoordinates
      ? `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`
      : 'N/A')

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-indigo-100 p-2">
            <MapPinned className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project Name</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{projectDisplayName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{locationText}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-emerald-100 p-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{createdDate}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectInfoCard
