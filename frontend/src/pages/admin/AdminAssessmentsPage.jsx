import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
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
    <div className="space-y-6">
      <PageHeader
        title="Admin Assessments"
        description="Monitor the latest risk assessments across all projects."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Projects</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.totalProjects}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Projects Assessed</p>
          <p className="mt-2 text-2xl font-semibold text-sky-700">{stats.assessedProjects}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">High Risk Projects</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{stats.highRiskCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Average Risk Score</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{stats.avgRiskScore}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by project, type, or location"
            className="md:col-span-3 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          />

          <select
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          >
            {RISK_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'All Risk Levels' : option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => fetchAssessmentRows(true)}
            disabled={isLoading || isRefreshing}
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
          <div className="p-6 text-sm text-slate-500">Loading assessment monitoring data...</div>
        ) : filteredRows.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No projects found for the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Risk Score</th>
                  <th className="px-4 py-3 font-medium">Risk Level</th>
                  <th className="px-4 py-3 font-medium">Assessed At</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => {
                  const assessmentId = row?.latest?._id || ''
                  const isDeleting = deletingAssessmentId === assessmentId

                  return (
                    <tr key={row.projectId || row.title} className="border-b border-slate-100 text-sm text-slate-700">
                      <td className="px-4 py-4 align-top font-medium text-slate-900">{row.title}</td>
                      <td className="px-4 py-4 align-top">{row.projectType}</td>
                      <td className="px-4 py-4 align-top">{row.location}</td>
                      <td className="px-4 py-4 align-top font-semibold text-slate-900">
                        {row?.latest ? row.latest.riskScore : '-'}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRiskBadgeClass(
                            row?.latest?.riskLevel
                          )}`}
                        >
                          {row?.latest?.riskLevel || 'NOT ASSESSED'}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-600">
                        {formatDateTime(row?.latest?.createdAt)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        {assessmentId ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteAssessment(assessmentId)}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
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