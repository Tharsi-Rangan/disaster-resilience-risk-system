import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/common/StatusBadge'
import useAuth from '../../hooks/useAuth'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building,
  CheckCircle,
  FolderKanban,
  MapPin,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import { projectService } from '../../services/projectService'

const getGoogleEmbedUrl = (lat, lng) =>
  `https://www.google.com/maps?q=${lat},${lng}&z=13&output=embed`

function AdminDashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [isLoadingMapData, setIsLoadingMapData] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  useEffect(() => {
    let isCancelled = false

    const loadDashboardData = async () => {
      try {
        const pageSize = 100
        let currentPage = 1
        let totalPages = 1
        const allProjects = []

        do {
          const projectsResponse = await projectService.getProjects(currentPage, pageSize)

          if (isCancelled) return

          const pageProjects = Array.isArray(projectsResponse?.projects) ? projectsResponse.projects : []
          allProjects.push(...pageProjects)
          totalPages = Number(projectsResponse?.totalPages || 1)
          currentPage += 1
        } while (currentPage <= totalPages)

        setProjects(allProjects)
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

  const stats = [
    {
      title: 'Global Projects',
      value: projects.length,
      icon: FolderKanban,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-100',
    },
    {
      title: 'High Risk',
      value: projects.filter((p) => p.status === 'HIGH_RISK').length,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
    {
      title: 'In Progress',
      value: projects.filter((p) => ['DRAFT', 'ANALYZING'].includes(p.status)).length,
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      title: 'Approved',
      value: projects.filter((p) => p.status === 'APPROVED').length,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
  ]

  const cards = [
    {
      title: 'Global Projects',
      description: 'Monitor all recorded project infrastructures across the ecosystem.',
      icon: FolderKanban,
      link: '/admin/projects',
      color: 'text-slate-500',
      bg: 'bg-slate-50',
    },
    {
      title: 'Risk Assessments',
      description: 'Review risk models, threat simulations & assessment outputs.',
      icon: Activity,
      link: '/admin/assessments',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      title: 'Mitigation Actions',
      description: 'Manage compliance, AI resolution plans and mitigation tracking.',
      icon: ShieldAlert,
      link: '/admin/mitigations',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm glass-panel md:flex-row md:items-center md:justify-between">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-slate-50/50 blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 heading-font">System Control Panel</h1>
          <p className="mt-2 font-medium text-slate-500">
            Welcome back, <span className="font-bold text-slate-600">{user?.name}</span>. Monitor the global disaster risk grid.
          </p>
        </div>
        <StatusBadge label="Admin Privilege Active" variant="info" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`rounded-2xl border ${stat.border} bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md`}>
            <div className="mb-5 flex items-center justify-between">
              <div className={`rounded-xl ${stat.bg} p-4 ${stat.color}`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <span className="text-4xl font-extrabold text-slate-900">{stat.value}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              to={card.link}
              className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl glass-panel"
            >
              <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <Icon className="h-24 w-24" />
              </div>
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg} ${card.color} shadow-inner transition-transform group-hover:scale-110`}>
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-slate-900 heading-font transition-colors group-hover:text-slate-700">{card.title}</h3>
              <p className="relative z-10 text-sm font-medium leading-relaxed text-slate-500">{card.description}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2.5">
            <MapPin className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 heading-font">Global Project Activity</h3>
            <p className="text-sm font-medium text-slate-500">Tracking {projectsWithCoordinates.length} active geographical nodes</p>
          </div>
        </div>

        {isLoadingMapData ? (
          <div className="flex h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-slate-600"></div>
              <p className="animate-pulse text-sm font-medium text-slate-500">Initializing map data...</p>
            </div>
          </div>
        ) : selectedProject ? (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="group/map relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <iframe
                title="Registered project location"
                src={getGoogleEmbedUrl(selectedProject.location.lat, selectedProject.location.lng)}
                className="h-[500px] w-full border-0 grayscale-[10%] transition-all duration-500 group-hover/map:grayscale-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
                <span className="text-sm font-bold text-slate-800">Select Node</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{projectsWithCoordinates.length} Points</span>
              </div>
              <div className="scrollbar-hide flex flex-1 flex-shrink-0 flex-col gap-2 overflow-y-auto p-3">
                {projectsWithCoordinates.map((project) => {
                  const isSelected = project._id === selectedProject._id
                  return (
                    <button
                      key={project._id}
                      type="button"
                      onClick={() => setSelectedProjectId(project._id)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-slate-700 bg-slate-800 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <MapPin className={`mt-0.5 h-5 w-5 flex-shrink-0 ${isSelected ? 'text-slate-200' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold tracking-tight">{project.title}</p>
                        <p className={`mt-1 truncate text-xs font-medium ${isSelected ? 'text-slate-100' : 'text-slate-500'}`}>
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
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm">
              <MapPin className="h-8 w-8 text-slate-300" />
            </div>
            <h4 className="mb-2 text-lg font-bold text-slate-700">No Geographic Data Available</h4>
            <p className="mx-auto max-w-sm text-slate-500">
              None of the registered projects have mapped coordinates yet.
            </p>
          </div>
        )}

        <p className="text-sm text-slate-500">
          Showing {projects.length} registered project(s). {projectsWithCoordinates.length} have mappable coordinates.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-slate-900 p-8 shadow-lg shadow-slate-900/20 relative overflow-hidden mt-8 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/20 blur-3xl rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <h3 className="mb-2 flex items-center gap-3 text-2xl font-black text-white heading-font">
              <TrendingUp className="w-6 h-6 text-slate-400" />
              Network Analytics Tracker
            </h3>
            <p className="text-sm font-medium text-slate-200/80">System activity is currently healthy. Background risk simulation services are polling appropriately.</p>
          </div>

          <div className="flex items-center gap-6 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-center">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-300">Global Users</p>
              <p className="text-2xl font-extrabold text-white">1,204</p>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div className="text-center">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-300">Nodes</p>
              <p className="animate-pulse text-2xl font-extrabold text-white">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
