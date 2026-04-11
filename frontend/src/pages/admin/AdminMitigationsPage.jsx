import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, AlertTriangle, Cpu, FolderKanban, Search, Filter, RefreshCw, CheckCircle2 } from 'lucide-react'
import StatusBadge from '../../components/common/StatusBadge'
import { getAllMitigationPlans, deleteMitigationPlan } from '../../services/mitigationService'
import { projectService } from '../../services/projectService'

const PLAN_FILTERS = ['ALL', 'NO_PLAN', 'PENDING', 'IN_PROGRESS', 'COMPLETED']

const normalizeProjects = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.projects)) return payload.projects
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function AdminMitigationsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchAllProjects = async () => {
    const pageSize = 100
    let currentPage = 1
    let totalPages = 1
    const allProjects = []

    do {
      const response = await projectService.getProjects(currentPage, pageSize)
      allProjects.push(...normalizeProjects(response))
      totalPages = Number(response?.totalPages || 1)
      currentPage += 1
    } while (currentPage <= totalPages)

    return allProjects
  }

  const fetchPlans = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const [plansResponse, projectsResponse] = await Promise.all([
        getAllMitigationPlans(),
        fetchAllProjects(),
      ])

      setPlans(Array.isArray(plansResponse?.mitigationPlans) ? plansResponse.mitigationPlans : [])
      setProjects(Array.isArray(projectsResponse) ? projectsResponse : [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch mitigation plans')
      setPlans([])
      setProjects([])
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this mitigation plan?")) return;
    
    try {
      setDeletingId(id)
      await deleteMitigationPlan(id)
      setPlans(prev => prev.filter(plan => plan._id !== id))
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to delete plan')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredPlans = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    const latestPlanByProjectId = new Map()

    plans.forEach((plan) => {
      const projectId = String(plan?.projectId?._id || plan?.projectId?.id || '')
      if (!projectId) return

      const previousPlan = latestPlanByProjectId.get(projectId)
      if (!previousPlan) {
        latestPlanByProjectId.set(projectId, plan)
        return
      }

      const prevTime = previousPlan?.updatedAt ? new Date(previousPlan.updatedAt).getTime() : 0
      const nextTime = plan?.updatedAt ? new Date(plan.updatedAt).getTime() : 0
      if (nextTime >= prevTime) {
        latestPlanByProjectId.set(projectId, plan)
      }
    })

    return projects
      .map((project) => {
        const projectId = String(project?._id || project?.id || '')
        return {
          project,
          plan: latestPlanByProjectId.get(projectId) || null,
        }
      })
      .filter(({ project, plan }) => {
        const projectTitle = String(project?.title || '').toLowerCase()
        const owner = String(plan?.createdBy?.name || project?.createdBy?.name || '').toLowerCase()
        const location = String(project?.location?.address || '').toLowerCase()
        const aiProvider = String(plan?.aiProvider || '').toLowerCase()
        const planStatus = String(plan?.planStatus || 'NO_PLAN').toUpperCase()

        const matchesSearch =
          !search ||
          projectTitle.includes(search) ||
          owner.includes(search) ||
          location.includes(search) ||
          aiProvider.includes(search)
        const matchesStatus = statusFilter === 'ALL' || planStatus === statusFilter

        return matchesSearch && matchesStatus
      })
      .sort((left, right) => {
        const leftTime = left?.plan?.updatedAt ? new Date(left.plan.updatedAt).getTime() : 0
        const rightTime = right?.plan?.updatedAt ? new Date(right.plan.updatedAt).getTime() : 0
        return rightTime - leftTime
      })
  }, [plans, projects, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const completed = plans.filter((plan) => String(plan?.planStatus || '').toUpperCase() === 'COMPLETED').length
    const inProgress = plans.filter((plan) => String(plan?.planStatus || '').toUpperCase() === 'IN_PROGRESS').length
    const highPriority = plans.filter((plan) => String(plan?.priorityLevel || '').toUpperCase() === 'HIGH').length
    const withPlans = projects.filter((project) =>
      plans.some((plan) => String(plan?.projectId?._id || plan?.projectId?.id || '') === String(project?._id || project?.id || ''))
    ).length

    return {
      total: projects.length,
      withPlans,
      completed,
      inProgress,
      highPriority,
    }
  }, [plans, projects])

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
          <p className="text-sm text-slate-500 font-bold animate-pulse tracking-widest uppercase">Fetching AI Mitigation Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 w-full">

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600 shadow-inner"><FolderKanban className="h-6 w-6" /></div>
            <p className="heading-font text-3xl font-extrabold text-slate-900">{stats.total}</p>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Projects</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 shadow-inner"><AlertTriangle className="h-6 w-6" /></div>
            <p className="heading-font text-3xl font-extrabold text-amber-600">{stats.highPriority}</p>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">High Priority</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-600 shadow-inner"><Cpu className="h-6 w-6" /></div>
            <p className="heading-font text-3xl font-extrabold text-sky-600">{stats.withPlans}</p>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Projects With Plans</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 shadow-inner"><CheckCircle2 className="h-6 w-6" /></div>
            <p className="heading-font text-3xl font-extrabold text-emerald-600">{stats.inProgress}</p>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">In Progress</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-5 shadow-md">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="relative w-full md:flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by project, architect, location, or AI engine..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold shadow-inner transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <div className="relative w-full sm:w-56">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-8 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                {PLAN_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All Plan Statuses' : status}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => fetchPlans(true)}
              disabled={loading || isRefreshing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-lg disabled:opacity-50 disabled:hover:bg-slate-900 sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
           <AlertTriangle className="w-5 h-5" />
           <span className="font-medium">{error}</span>
        </div>
      )}

      {filteredPlans.length === 0 && !error ? (
        <div className="p-16 text-center bg-slate-50 rounded-3xl border border-slate-200/80">
             <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-700 mb-1">No Projects Found</h3>
             <p className="text-sm text-slate-500">Try adjusting search keywords or status filters.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Project Information</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">AI Engine</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Metrics Mapping</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Plan Progress</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Root Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredPlans.map(({ project, plan }) => {
                  const projectId = project?._id || project?.id || ''
                  const canNavigate = Boolean(projectId)

                  return (
                  <tr
                    key={plan?._id || projectId}
                    className={`group transition-colors ${canNavigate ? 'cursor-pointer hover:bg-slate-50/50' : ''}`}
                    onClick={() => {
                      if (!canNavigate) return
                      navigate(`/projects/${projectId}/mitigation`)
                    }}
                  >
                    <td className="px-6 py-5 align-top">
                      <p className="font-extrabold text-slate-900 heading-font text-lg tracking-tight mb-0.5">{project?.title || 'Untitled Project'}</p>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Architect: {plan?.createdBy?.name || project?.createdBy?.name || 'System'}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      {plan ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest border border-indigo-100 shadow-sm gap-1.5"><Cpu className="w-3 h-3" /> {plan.aiProvider || "RULE-BASED"}</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest border border-slate-200 shadow-sm">NO PLAN</span>
                      )}
                    </td>
                    <td className="px-6 py-5 align-top">
                      <StatusBadge 
                        label={plan?.priorityLevel || 'N/A'} 
                        variant={
                          !plan
                            ? 'default'
                            : plan.priorityLevel === 'HIGH'
                            ? 'danger'
                            : plan.priorityLevel === 'MEDIUM'
                            ? 'warning'
                            : 'success'
                        } 
                      />
                    </td>
                    <td className="px-6 py-5 align-top">
                      {plan ? (
                        <div className="flex items-center gap-5 text-xs font-bold text-slate-500">
                          <div className="text-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-inner">
                            <span className="block text-lg text-slate-900 font-extrabold">{plan.totalRecommendations}</span>
                            Total
                          </div>
                          <div className="text-center bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60 shadow-inner">
                            <span className="block text-lg text-amber-600 font-extrabold">{plan.ongoingCount}</span>
                            WIP
                          </div>
                          <div className="text-center bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60 shadow-inner">
                            <span className="block text-lg text-emerald-600 font-extrabold">{plan.completedCount}</span>
                            Done
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">No metrics yet</span>
                      )}
                    </td>
                    <td className="px-6 py-5 align-top">
                      <StatusBadge 
                        label={plan?.planStatus || 'NO_PLAN'} 
                        variant={
                          !plan
                            ? 'default'
                            : plan.planStatus === 'COMPLETED'
                            ? 'success'
                            : plan.planStatus === 'IN_PROGRESS'
                            ? 'info'
                            : 'warning'
                        } 
                      />
                    </td>
                    <td className="px-6 py-5 align-top text-right">
                      {plan?._id ? (
                        <div className="flex justify-end opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDelete(plan._id)
                            }}
                            disabled={deletingId === plan._id}
                            className="p-2 rounded-xl border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all disabled:opacity-50"
                            title="Purge Plan"
                          >
                            <Trash2 className="w-4 h-4 cursor-pointer" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 block text-right pr-4">-</span>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMitigationsPage
