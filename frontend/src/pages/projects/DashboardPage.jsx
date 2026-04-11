import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import useAuth from '../../hooks/useAuth'
import { projectService } from '../../services/projectService'

const getGoogleEmbedUrl = (lat, lng) =>
  `https://www.google.com/maps?q=${lat},${lng}&z=13&output=embed`

function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [isLoadingMapData, setIsLoadingMapData] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  useEffect(() => {
    let isCancelled = false

    const loadDashboardData = async () => {
      try {
        const projectsResponse = await projectService.getProjects(1, 100)

        if (!isCancelled) {
          setProjects(Array.isArray(projectsResponse?.projects) ? projectsResponse.projects : [])
        }
      } catch (_error) {
        if (!isCancelled) {
          setProjects([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMapData(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      isCancelled = true
    }
  }, [])

  const projectsWithCoordinates = useMemo(
    () =>
      projects.filter(
        (project) =>
          Number.isFinite(Number(project?.location?.lat)) &&
          Number.isFinite(Number(project?.location?.lng))
      ),
    [projects]
  )

  useEffect(() => {
    if (!projectsWithCoordinates.length) {
      setSelectedProjectId(null)
      return
    }

    setSelectedProjectId((prev) => {
      if (prev && projectsWithCoordinates.some((project) => project._id === prev)) {
        return prev
      }
      return projectsWithCoordinates[0]._id
    })
  }, [projectsWithCoordinates])

  const selectedProject = useMemo(
    () => projectsWithCoordinates.find((project) => project._id === selectedProjectId) || null,
    [projectsWithCoordinates, selectedProjectId]
  )

  const primaryProjectId = useMemo(() => {
    if (selectedProjectId) return selectedProjectId
    return projects[0]?._id || null
  }, [selectedProjectId, projects])

  const modules = [
    {
      title: 'Project Management',
      description: 'Create, view, edit, and manage projects.',
      to: '/projects',
    },
    {
      title: 'Risk Data Collection',
      description: 'Fetch and review project risk snapshots.',
      to: primaryProjectId ? `/projects/${primaryProjectId}/risk-data` : null,
    },
    {
      title: 'Risk Assessment',
      description: 'Run and review project assessments.',
      to: primaryProjectId ? `/projects/${primaryProjectId}/assessment` : null,
    },
    {
      title: 'Mitigation Planning',
      description: 'Generate and review mitigation plans.',
      to: primaryProjectId ? `/projects/${primaryProjectId}/mitigation` : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Contractor Dashboard"
        description={`Welcome, ${user?.name}. Use the shared module navigation below.`}
      />

      <div className="mb-6">
        <StatusBadge label="Contractor Access" variant="success" />
      </div>

      <div className="mb-8 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Registered Project Locations</h3>

        {isLoadingMapData ? (
          <div className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        ) : selectedProject ? (
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <iframe
                title="Registered project location"
                src={getGoogleEmbedUrl(selectedProject.location.lat, selectedProject.location.lng)}
                className="h-[420px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="space-y-2">
                {projectsWithCoordinates.map((project) => {
                  const isSelected = project._id === selectedProject._id
                  return (
                    <button
                      key={project._id}
                      type="button"
                      onClick={() => setSelectedProjectId(project._id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <p className="truncate text-sm font-semibold">{project.title}</p>
                      <p className={`truncate text-xs ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                        {project.location?.address || 'Address unavailable'}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
            No projects with saved coordinates yet. Add project locations to view them on the map.
          </div>
        )}

        <p className="text-sm text-slate-500">
          Showing {projects.length} registered project(s). {projectsWithCoordinates.length} have mappable coordinates.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <div
            key={module.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{module.description}</p>

            {module.to ? (
              <Link
                to={module.to}
                className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Open Module
              </Link>
            ) : (
              <span className="mt-4 inline-block cursor-not-allowed rounded-xl bg-slate-300 px-4 py-2 text-sm font-medium text-slate-600">
                Add a Project First
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage