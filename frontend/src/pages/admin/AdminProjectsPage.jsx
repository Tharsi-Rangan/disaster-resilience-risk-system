import { useEffect, useMemo, useState } from 'react'
import { FolderKanban, CheckCircle, Activity, AlertTriangle, Search, Filter, RefreshCw, Trash2 } from 'lucide-react'
import { projectService } from '../../services/projectService'

const PROJECT_STATUSES = ['DRAFT', 'ANALYZING', 'APPROVED', 'HIGH_RISK']

const normalizeProjects = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.projects)) return payload.projects
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function AdminProjectsPage() {
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 w-full">

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl shadow-inner group-hover:bg-slate-800 group-hover:text-white transition-colors"><FolderKanban className="w-6 h-6" /></div>
            <p className="text-3xl font-extrabold text-slate-900 heading-font">{projectStats.total}</p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Projects</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-colors"><CheckCircle className="w-6 h-6" /></div>
            <p className="text-3xl font-extrabold text-emerald-600 heading-font">{projectStats.approved}</p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Approved</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-colors"><Activity className="w-6 h-6" /></div>
            <p className="text-3xl font-extrabold text-amber-600 heading-font">{projectStats.analyzing}</p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Analyzing</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shadow-inner group-hover:bg-rose-500 group-hover:text-white transition-colors"><AlertTriangle className="w-6 h-6" /></div>
            <p className="text-3xl font-extrabold text-rose-600 heading-font">{projectStats.highRisk}</p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">High Risk</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-5 shadow-md">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search database by title, description, or coordinates..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all text-sm font-semibold shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer text-sm font-bold text-slate-700 shadow-sm"
              >
                <option value="ALL">All Statuses</option>
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="w-full pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer text-sm font-bold text-slate-700 shadow-sm"
              >
                <option value="ALL">All Architectures</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => fetchProjects(true)}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center justify-center py-3 px-5 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold text-sm shadow-md shadow-slate-900/20 hover:shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 w-full sm:w-auto gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
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

      <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
              <p className="text-sm text-slate-500 font-bold animate-pulse tracking-widest uppercase">Fetching Global Nodes...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-16 text-center bg-slate-50">
             <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <p className="text-lg font-bold text-slate-700 mb-1">No Projects Found</p>
             <p className="text-sm text-slate-500">Try refining your search or filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Project Identity</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Schema Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Geographical Node</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Budget Allocation</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">State</th>
                  <th className="sticky right-0 z-20 w-56 whitespace-nowrap border-l border-slate-200 bg-slate-100/95 px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500 backdrop-blur">
                    Root Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/80">
                {filteredProjects.map((project) => {
                  const projectId = project?._id || project?.id
                  const projectStatus = String(project?.status || 'DRAFT').toUpperCase()
                  const isProjectUpdating = updatingProjectId === projectId

                  return (
                    <tr key={projectId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 align-top">
                        <p className="font-extrabold text-slate-900 heading-font text-lg tracking-tight mb-0.5">{project?.title || 'Untitled Project'}</p>
                        <p className="max-w-xs truncate text-[13px] font-medium text-slate-500">
                          {project?.description || 'No description available'}
                        </p>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold capitalize border border-slate-200/60 shadow-sm">{project?.projectType || 'N/A'}</span>
                      </td>

                      <td className="px-6 py-5 align-top text-sm font-medium text-slate-700">
                        <div className="max-w-[200px] truncate">{project?.location?.address || 'Location not set'}</div>
                      </td>

                      <td className="px-6 py-5 align-top whitespace-nowrap text-sm font-bold text-slate-700">
                        LKR {Number.isFinite(Number(project?.budget)) ? Number(project.budget).toLocaleString() : '0'}
                      </td>

                      <td className="px-6 py-5 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold border shadow-sm tracking-wider uppercase ${statusBadgeClass(projectStatus).replace('bg-', 'bg-opacity-20 bg-').concat(` border-${statusBadgeClass(projectStatus).split(' ')[0].split('-')[1]}-200`)}`}
                        >
                          {projectStatus}
                        </span>
                      </td>

                      <td className="sticky right-0 z-10 w-56 border-l border-slate-200 bg-white px-6 py-5 align-top group-hover:bg-slate-50/50">
                        <div className="flex flex-col items-end justify-start gap-2 sm:flex-row sm:items-center sm:justify-end">
                          <select
                            value={projectStatus}
                            onChange={(event) => handleStatusChange(projectId, event.target.value)}
                            disabled={isProjectUpdating}
                            className={`rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none transition focus:border-slate-500 disabled:opacity-50 cursor-pointer shadow-sm ${isProjectUpdating ? 'animate-pulse' : 'bg-white hover:bg-slate-50'}`}
                          >
                            {PROJECT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteProject(projectId)}
                            disabled={isProjectUpdating}
                            className="p-2 rounded-xl border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all disabled:opacity-50"
                            title="Purge Project"
                          >
                            <Trash2 className="w-4 h-4 cursor-pointer" />
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
