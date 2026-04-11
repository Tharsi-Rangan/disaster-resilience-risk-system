import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { projectService } from '../../services/projectService'
import PageHeader from '../../components/common/PageHeader'

const PROJECT_STATUSES = ['DRAFT', 'ANALYZING', 'APPROVED', 'HIGH_RISK']

const normalizeProjects = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.projects)) return payload.projects
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function AdminProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingProjectId, setUpdatingProjectId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchProjects = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError('')
      const response = await projectService.getProjects(1, 200)
      setProjects(normalizeProjects(response))
    } catch (fetchError) {
      setError(fetchError?.message || 'Failed to fetch projects.')
      setProjects([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const projectTypes = useMemo(() => {
    const types = Array.from(
      new Set(
        (Array.isArray(projects) ? projects : [])
          .map((project) => String(project?.projectType || '').trim())
          .filter(Boolean)
      )
    )
    return types.sort((left, right) => left.localeCompare(right))
  }, [projects])

  const filteredProjects = useMemo(() => {
    return (Array.isArray(projects) ? projects : []).filter((project) => {
      const title = String(project?.title || '').toLowerCase()
      const description = String(project?.description || '').toLowerCase()
      const location = String(project?.location?.address || '').toLowerCase()
      const status = String(project?.status || 'DRAFT').toUpperCase()
      const type = String(project?.projectType || '').toUpperCase()
      const search = searchTerm.trim().toLowerCase()

      const matchesSearch =
        !search ||
        title.includes(search) ||
        description.includes(search) ||
        location.includes(search)
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter
      const matchesType =
        typeFilter === 'ALL' || type === String(typeFilter).toUpperCase()

      return matchesSearch && matchesStatus && matchesType
    })
  }, [projects, searchTerm, statusFilter, typeFilter])

  const projectStats = useMemo(() => {
    const all = Array.isArray(projects) ? projects : []
    return {
      total: all.length,
      approved: all.filter((project) => String(project?.status || '').toUpperCase() === 'APPROVED').length,
      analyzing: all.filter((project) => String(project?.status || '').toUpperCase() === 'ANALYZING').length,
      highRisk: all.filter((project) => String(project?.status || '').toUpperCase() === 'HIGH_RISK').length,
    }
  }, [projects])

  const handleStatusChange = async (projectId, nextStatus) => {
    if (!projectId || !nextStatus) return

    try {
      setUpdatingProjectId(projectId)
      setError('')
      setSuccess('')
      await projectService.updateProjectStatus(projectId, nextStatus)

      setProjects((previousProjects) =>
        previousProjects.map((project) => {
          const id = project?._id || project?.id
          if (id !== projectId) return project
          return { ...project, status: nextStatus }
        })
      )
      setSuccess('Project status updated successfully.')
    } catch (updateError) {
      setError(updateError?.message || 'Failed to update status.')
    } finally {
      setUpdatingProjectId('')
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!projectId) return
    const confirmed = window.confirm('Are you sure you want to delete this project? This action cannot be undone.')
    if (!confirmed) return

    try {
      setUpdatingProjectId(projectId)
      setError('')
      setSuccess('')
      await projectService.deleteProject(projectId)
      setProjects((previousProjects) =>
        previousProjects.filter((project) => (project?._id || project?.id) !== projectId)
      )
      setSuccess('Project deleted successfully.')
    } catch (deleteError) {
      setError(deleteError?.message || 'Failed to delete project.')
    } finally {
      setUpdatingProjectId('')
    }
  }

  const statusBadgeClass = (status) => {
    const normalizedStatus = String(status || 'DRAFT').toUpperCase()
    if (normalizedStatus === 'APPROVED') return 'bg-emerald-100 text-emerald-700'
    if (normalizedStatus === 'ANALYZING') return 'bg-amber-100 text-amber-700'
    if (normalizedStatus === 'HIGH_RISK') return 'bg-rose-100 text-rose-700'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Projects"
        description="Monitor all projects, update statuses, and take admin actions."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Projects</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{projectStats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{projectStats.approved}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Analyzing</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{projectStats.analyzing}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">High Risk</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{projectStats.highRisk}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            placeholder="Search by title, description, or location"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="md:col-span-2 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          >
            <option value="ALL">All Statuses</option>
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          >
            <option value="ALL">All Types</option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => fetchProjects(true)}
            disabled={isRefreshing || isLoading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6 text-sm text-slate-500">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No projects found for the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProjects.map((project) => {
                  const projectId = project?._id || project?.id
                  const projectStatus = String(project?.status || 'DRAFT').toUpperCase()
                  const isProjectUpdating = updatingProjectId === projectId

                  return (
                    <tr key={projectId} className="border-b border-slate-100 text-sm text-slate-700">
                      <td className="px-4 py-4 align-top">
                        <p className="font-medium text-slate-900">{project?.title || 'Untitled Project'}</p>
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {project?.description || 'No description available'}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-top">{project?.projectType || 'N/A'}</td>

                      <td className="px-4 py-4 align-top">
                        {project?.location?.address || 'Location not set'}
                      </td>

                      <td className="px-4 py-4 align-top">
                        LKR {Number.isFinite(Number(project?.budget)) ? Number(project.budget).toLocaleString() : '0'}
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(projectStatus)}`}
                        >
                          {projectStatus}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <select
                            value={projectStatus}
                            onChange={(event) => handleStatusChange(projectId, event.target.value)}
                            disabled={isProjectUpdating}
                            className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {PROJECT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                Mark as {status}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => navigate(`/projects/${projectId}/risk-data`)}
                            disabled={isProjectUpdating}
                            title="View disaster risk data for this project"
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-sky-200 px-2 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <Activity className="h-3.5 w-3.5" />
                            View Risk Data
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProject(projectId)}
                            disabled={isProjectUpdating}
                            className="rounded-lg border border-rose-200 px-2 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProjectsPage