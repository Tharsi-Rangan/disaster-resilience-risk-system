import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Target, AlertTriangle, Activity, Search, Filter, RefreshCw, Trash2, FolderKanban } from 'lucide-react'
import { projectService } from '../../services/projectService'
import { deleteAssessment, getLatestAssessment } from '../../services/assessmentService'
import getApiErrorMessage from '../../utils/getApiErrorMessage'

const RISK_FILTERS = ['ALL', 'HIGH', 'MEDIUM', 'LOW', 'NONE']

const normalizeProjects = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.projects)) return payload.projects
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const getRiskBadgeClass = (riskLevel) => {
  const level = String(riskLevel || '').toUpperCase()
  if (level === 'HIGH') return 'bg-rose-100 text-rose-700'
  if (level === 'MEDIUM') return 'bg-amber-100 text-amber-700'
  if (level === 'LOW') return 'bg-emerald-100 text-emerald-700'
  return 'bg-slate-100 text-slate-600'
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

function AdminAssessmentsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deletingAssessmentId, setDeletingAssessmentId] = useState('')

  const fetchAssessmentRows = useCallback(async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setError('')
      setSuccess('')

      const projectsResponse = await projectService.getProjects(1, 200)
      const projects = normalizeProjects(projectsResponse)

      const nextRows = await Promise.all(
        projects.map(async (project) => {
          const projectId = project?._id || project?.id
          let latest = null

          if (projectId) {
            try {
              latest = await getLatestAssessment(projectId)
            } catch {
              latest = null
            }
          }

          return {
            projectId,
            title: project?.title || 'Untitled Project',
            projectType: project?.projectType || 'N/A',
            location: project?.location?.address || 'N/A',
            latest,
          }
        })
      )

      setRows(nextRows)
    } catch (fetchError) {
      setRows([])
      setError(getApiErrorMessage(fetchError, 'Failed to load assessment monitoring data.'))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAssessmentRows()
  }, [fetchAssessmentRows])

  const filteredRows = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return rows
      .filter((row) => {
        const title = String(row?.title || '').toLowerCase()
        const type = String(row?.projectType || '').toLowerCase()
        const location = String(row?.location || '').toLowerCase()
        const latestRisk = String(row?.latest?.riskLevel || '').toUpperCase()
        const rowRisk = latestRisk || 'NONE'

        const matchesSearch =
          !search || title.includes(search) || type.includes(search) || location.includes(search)
        const matchesRisk = riskFilter === 'ALL' || rowRisk === riskFilter

        return matchesSearch && matchesRisk
      })
      .sort((left, right) => {
        const leftTime = left?.latest?.createdAt ? new Date(left.latest.createdAt).getTime() : 0
        const rightTime = right?.latest?.createdAt ? new Date(right.latest.createdAt).getTime() : 0
        return rightTime - leftTime
      })
  }, [rows, searchTerm, riskFilter])

  const stats = useMemo(() => {
    const assessed = rows.filter((row) => row?.latest)
    const totalScore = assessed.reduce((sum, row) => sum + Number(row.latest?.riskScore || 0), 0)

    return {
      totalProjects: rows.length,
      assessedProjects: assessed.length,
      highRiskCount: assessed.filter(
        (row) => String(row.latest?.riskLevel || '').toUpperCase() === 'HIGH'
      ).length,
      avgRiskScore: assessed.length ? (totalScore / assessed.length).toFixed(1) : '0.0',
    }
  }, [rows])

  const handleDeleteAssessment = async (assessmentId) => {
    if (!assessmentId) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this assessment record? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      setDeletingAssessmentId(assessmentId)
      setError('')
      setSuccess('')

      await deleteAssessment(assessmentId)

      setRows((previousRows) =>
        previousRows.map((row) => {
          if (row?.latest?._id !== assessmentId) return row
          return { ...row, latest: null }
        })
      )

      setSuccess('Assessment deleted successfully.')
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Failed to delete assessment.'))
    } finally {
      setDeletingAssessmentId('')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 w-full">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl shadow-inner group-hover:bg-slate-800 group-hover:text-white transition-colors"><Target className="w-6 h-6" /></div>
            <p className="text-3xl font-extrabold text-slate-900 heading-font">{stats.totalProjects}</p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Projects</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl shadow-inner group-hover:bg-sky-500 group-hover:text-white transition-colors"><ShieldCheck className="w-6 h-6" /></div>
            <p className="text-3xl font-extrabold text-sky-600 heading-font">{stats.assessedProjects}</p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Projects Assessed</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shadow-inner group-hover:bg-rose-500 group-hover:text-white transition-colors"><AlertTriangle className="w-6 h-6" /></div>
            <p className="text-3xl font-extrabold text-rose-600 heading-font">{stats.highRiskCount}</p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">High Risk Projects</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 shadow-sm hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-colors"><Activity className="w-6 h-6" /></div>
            <p className="text-3xl font-extrabold text-amber-600 heading-font">{stats.avgRiskScore}</p>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Risk Score</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-5 shadow-md">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search assessment database by project, type, or coordinates..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all text-sm font-semibold shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-56">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value)}
                className="w-full pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer text-sm font-bold text-slate-700 shadow-sm"
              >
                {RISK_FILTERS.map((option) => (
                  <option key={option} value={option}>
                    {option === 'ALL' ? 'All Risk Levels' : option}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => fetchAssessmentRows(true)}
              disabled={isLoading || isRefreshing}
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
        ) : filteredRows.length === 0 ? (
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Risk Metric</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status Level</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Last Pulse</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Root Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/80">
                {filteredRows.map((row) => {
                  const assessmentId = row?.latest?._id || ''
                  const isDeleting = deletingAssessmentId === assessmentId
                  const hasProjectRoute = Boolean(row?.projectId)

                  return (
                    <tr
                      key={row.projectId || row.title}
                      className={`group transition-colors ${hasProjectRoute ? 'cursor-pointer hover:bg-slate-50/50' : ''}`}
                      onClick={() => {
                        if (!hasProjectRoute) return
                        navigate(`/projects/${row.projectId}/assessment`)
                      }}
                    >
                      <td className="px-6 py-5 align-top">
                        <p className="font-extrabold text-slate-900 heading-font text-lg tracking-tight mb-0.5">{row.title}</p>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold capitalize border border-slate-200/60 shadow-sm">{row.projectType}</span>
                      </td>
                      <td className="px-6 py-5 align-top text-sm font-medium text-slate-700">
                        <div className="max-w-[200px] truncate">{row.location}</div>
                      </td>
                      <td className="px-6 py-5 align-top font-bold text-slate-900">
                        {row?.latest ? row.latest.riskScore : '-'}
                      </td>
                      <td className="px-6 py-5 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold border shadow-sm tracking-wider uppercase ${getRiskBadgeClass(row?.latest?.riskLevel).replace('bg-', 'bg-opacity-20 bg-').concat(` border-${getRiskBadgeClass(row?.latest?.riskLevel).split(' ')[0].split('-')[1]}-200`)}`}
                        >
                          {row?.latest?.riskLevel || 'NOT ASSESSED'}
                        </span>
                      </td>
                      <td className="px-6 py-5 align-top text-slate-500 text-sm font-medium whitespace-nowrap">
                        {formatDateTime(row?.latest?.createdAt)}
                      </td>
                      <td className="px-6 py-5 align-top text-right">
                        {assessmentId ? (
                          <div className="flex justify-end opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDeleteAssessment(assessmentId)
                              }}
                              disabled={isDeleting}
                              className="p-2 rounded-xl border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all disabled:opacity-50"
                              title="Purge Assessment Record"
                            >
                              <Trash2 className="w-4 h-4 cursor-pointer" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 block text-right pr-4">-</span>
                        )}
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

export default AdminAssessmentsPage
