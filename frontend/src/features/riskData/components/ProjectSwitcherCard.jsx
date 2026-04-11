import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, FolderKanban, RefreshCw } from 'lucide-react'
import { projectService } from '../../../services/projectService'

function normalizeProjects(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.projects)) return payload.projects
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

function getProjectId(project) {
  return project?._id || project?.id || null
}

function getProjectName(project) {
  return project?.title || project?.name || project?.projectName || 'Untitled Project'
}

function ProjectSwitcherCard({ currentProjectId, onSwitchProject }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        const response = await projectService.getProjects(1, 100)
        setProjects(normalizeProjects(response))
      } catch {
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  const currentIndex = useMemo(() => {
    return projects.findIndex((project) => String(getProjectId(project)) === String(currentProjectId))
  }, [projects, currentProjectId])

  const currentProject = currentIndex >= 0 ? projects[currentIndex] : null

  const handleSelect = (event) => {
    const nextProjectId = event.target.value
    if (!nextProjectId || String(nextProjectId) === String(currentProjectId)) return
    onSwitchProject?.(nextProjectId)
  }

  const goToPrev = () => {
    if (currentIndex <= 0) return
    const previousId = getProjectId(projects[currentIndex - 1])
    if (previousId) onSwitchProject?.(previousId)
  }

  const goToNext = () => {
    if (currentIndex < 0 || currentIndex >= projects.length - 1) return
    const nextId = getProjectId(projects[currentIndex + 1])
    if (nextId) onSwitchProject?.(nextId)
  }

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-100 p-2">
            <FolderKanban className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Project Switcher</p>
            <p className="text-xs text-slate-500">Change project to view risk data quickly.</p>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-2 md:max-w-xl">
          <button
            type="button"
            onClick={goToPrev}
            disabled={loading || currentIndex <= 0}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous project"
            title="Previous project"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="relative w-full">
            <select
              value={currentProjectId || ''}
              onChange={handleSelect}
              disabled={loading || projects.length === 0}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-700 shadow-xs outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              {!currentProject && <option value="">Select a project</option>}
              {projects.map((project) => {
                const optionProjectId = getProjectId(project)
                return (
                  <option key={optionProjectId} value={optionProjectId}>
                    {getProjectName(project)}
                  </option>
                )
              })}
            </select>
            {loading && <RefreshCw className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 animate-spin text-slate-400" />}
          </div>

          <button
            type="button"
            onClick={goToNext}
            disabled={loading || currentIndex < 0 || currentIndex >= projects.length - 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next project"
            title="Next project"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {currentProject
          ? `Currently viewing: ${getProjectName(currentProject)}`
          : 'Select a project from the list.'}
      </p>
    </div>
  )
}

export default ProjectSwitcherCard
