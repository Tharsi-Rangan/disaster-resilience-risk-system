import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, ArrowRight, Building, CheckCircle, FolderKanban, MapPin } from 'lucide-react'
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

  const stats = [
    { title: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
    { title: 'High Risk', value: projects.filter(p => p.status === 'HIGH_RISK').length, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    { title: 'In Progress', value: projects.filter(p => ['DRAFT', 'ANALYZING'].includes(p.status)).length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { title: 'Approved', value: projects.filter(p => p.status === 'APPROVED').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
  ]

  const modules = [
    {
      title: 'Project Management',
      description: 'Create, view, edit, and manage projects in the system.',
      to: '/projects',
      icon: Building,
    },
    {
      title: 'Risk Data Collection',
      description: 'Fetch and review comprehensive project risk snapshots.',
      to: primaryProjectId ? `/projects/${primaryProjectId}/risk-data` : null,
      icon: Activity,
    },
    {
      title: 'Risk Assessment',
      description: 'Run simulations and review project risk assessments.',
      to: primaryProjectId ? `/projects/${primaryProjectId}/assessment` : null,
      icon: AlertTriangle,
    },
    {
      title: 'Mitigation Planning',
      description: 'Generate, track, and align mitigation action plans.',
      to: primaryProjectId ? `/projects/${primaryProjectId}/mitigation` : null,
      icon: CheckCircle,
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 dark-pro-gradient p-8 rounded-3xl border border-slate-800 shadow-xl shadow-slate-900/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-white heading-font mb-2 tracking-tight">Contractor Dashboard</h1>
          <p className="text-slate-300 font-medium">Welcome back, <span className="text-white font-bold">{user?.name}</span>. Here's what's happening with your projects.</p>
        </div>
        <div className="flex-shrink-0 relative z-10">
          <StatusBadge label="Contractor Access Active" variant="info" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`rounded-3xl border ${stat.border} bg-white/90 glass-panel p-6 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-5">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <span className="text-4xl font-extrabold text-slate-900 heading-font">{stat.value}</span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon
          return (
              <div
              key={module.title}
              className="group relative rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-8 shadow-sm hover:shadow-2xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-bl-full -z-10 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="mb-6 inline-flex p-4 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white transition-all duration-300">
                <Icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-900 heading-font leading-tight mb-3 group-hover:text-slate-700 transition-colors">
                {module.title}
              </h3>
              
              <p className="text-sm text-slate-500 flex-1 leading-relaxed mb-8 font-medium">{module.description}</p>

              {module.to ? (
                <Link
                  to={module.to}
                  className="mt-auto flex items-center justify-between w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg group/btn"
                >
                  <span>Launch Module</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <span className="mt-auto flex items-center justify-center w-full rounded-2xl bg-slate-100 px-5 py-4 text-sm font-bold text-slate-400 cursor-not-allowed border border-slate-200">
                  Select Project First
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <MapPin className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 heading-font">Global Project Activity</h3>
            <p className="text-sm text-slate-500 font-medium">Tracking {projectsWithCoordinates.length} active geographical nodes</p>
          </div>
        </div>

        {isLoadingMapData ? (
          <div className="flex h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-slate-600"></div>
              <p className="text-sm text-slate-500 font-medium animate-pulse">Initializing map data...</p>
            </div>
          </div>
        ) : selectedProject ? (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm relative group/map">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-500 to-blue-500 z-10"></div>
              <iframe
                title="Registered project location"
                src={getGoogleEmbedUrl(selectedProject.location.lat, selectedProject.location.lng)}
                className="h-[500px] w-full border-0 grayscale-[20%] group-hover/map:grayscale-0 transition-all duration-700"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="h-[500px] flex flex-col rounded-2xl border border-slate-200 bg-slate-50 shadow-inner overflow-hidden">
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">Select Node</span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-bold">{projectsWithCoordinates.length} Points</span>
              </div>
              <div className="overflow-y-auto p-3 space-y-2 flex-1 scrollbar-hide flex-shrink-0">
                {projectsWithCoordinates.map((project) => {
                  const isSelected = project._id === selectedProject._id
                  return (
                    <button
                      key={project._id}
                      type="button"
                      onClick={() => setSelectedProjectId(project._id)}
                      className={`w-full rounded-xl border p-3 text-left transition-all duration-300 flex items-start gap-3 ${
                        isSelected
                          ? 'border-slate-600 bg-slate-600 text-white shadow-md shadow-slate-200'
                          : 'border-white bg-white text-slate-700 hover:border-slate-200 shadow-sm'
                      }`}
                    >
                      <MapPin className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold tracking-tight">{project.title}</p>
                        <p className={`truncate text-xs mt-1 font-medium ${isSelected ? 'text-slate-100' : 'text-slate-500'}`}>
                          {project.location?.address || 'Address unavailable'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <MapPin className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-700 mb-2">No Geographic Data Available</h4>
            <p className="text-slate-500 max-w-sm mx-auto">
              None of your registered projects have mapped coordinates. Update project details to view them here.
            </p>
          </div>
        )}

        <p className="text-sm text-slate-500">
          Showing {projects.length} registered project(s). {projectsWithCoordinates.length} have mappable coordinates.
        </p>
      </div>

      
    </div>
  )
}

export default DashboardPage
