import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FolderKanban, MapPin } from 'lucide-react'
import PageHeader from '../../../components/common/PageHeader'
import { projectService } from '../../../services/projectService'

const normalizeProjects = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.projects)) return payload.projects
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function statusBadgeClass(status) {
  const normalized = String(status || 'DRAFT').toUpperCase()
  if (normalized === 'APPROVED') return 'bg-emerald-100 text-emerald-700'
  if (normalized === 'ANALYZING') return 'bg-amber-100 text-amber-700'
  if (normalized === 'HIGH_RISK') return 'bg-rose-100 text-rose-700'
  return 'bg-slate-100 text-slate-700'
}

function ModuleProjectsHub({ title, description, actionLabel, buildPath }) {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    const loadProjects = async () => {
      try {
        setIsLoading(true)
        setError('')
        const response = await projectService.getProjects(1, 200)

        if (!isCancelled) {
          setProjects(normalizeProjects(response))
        }
      } catch (loadError) {
        if (!isCancelled) {
          setProjects([])
          setError(loadError?.message || 'Failed to load projects.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      isCancelled = true
    }
  }, [])

  const sortedProjects = useMemo(() => {
    return [...projects].sort((left, right) => {
      const leftDate = left?.createdAt ? new Date(left.createdAt).getTime() : 0
      const rightDate = right?.createdAt ? new Date(right.createdAt).getTime() : 0
      return rightDate - leftDate
    })
  }, [projects])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title={title} description={description} />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur md:p-6">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading projects...</div>
        ) : sortedProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <FolderKanban className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 text-base font-semibold text-slate-700">No projects available</p>
            <p className="mt-1 text-sm text-slate-500">Create a project first to use this module.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedProjects.map((project) => {
              const projectId = project?._id || project?.id
              const projectPath = projectId ? buildPath(projectId) : ''

              return (
                <div
                  key={projectId || project?.title}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-lg font-bold text-slate-900 heading-font">
                      {project?.title || 'Untitled Project'}
                    </h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(project?.status)}`}>
                      {String(project?.status || 'DRAFT').toUpperCase()}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {project?.description || 'No description available.'}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="line-clamp-1">{project?.location?.address || 'Location not set'}</span>
                  </div>

                  {projectPath ? (
                    <Link
                      to={projectPath}
                      className="mt-5 inline-flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <span>{actionLabel}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400">
                      Project unavailable
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ModuleProjectsHub
