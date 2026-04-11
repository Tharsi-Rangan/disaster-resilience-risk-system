import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, FolderKanban } from 'lucide-react'
import ProjectCard from '../../components/ProjectCard'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import SuccessAlert from '../../components/SuccessAlert'
import { useProjectStore } from '../../store/projectStore'
import { projectService } from '../../services/projectService'


const ProjectsList = () => {
  const { projects, setProjects, deleteProjectLocal, setLoading, loading, error, setError, clearError } = useProjectStore()
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  })
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [page, filters])

  const fetchProjects = async () => {
    setLoading(true)
    clearError()
    try {
      const response = await projectService.getProjects(page, limit, filters)
      setProjects(response.projects)
      setTotalPages(response.totalPages)
      setSuccess('')
    } catch (err) {
      setError(err.message || 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      await projectService.deleteProject(id)
      deleteProjectLocal(id)
      setSuccess('Project deleted successfully')
    } catch (err) {
      setError(err.message || 'Failed to delete project')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setPage(1) // Reset to page 1 when filter changes
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setFilters(prev => ({
      ...prev,
      search: value
    }))
    setPage(1)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 w-full max-w-7xl mx-auto">
      <PageHeader
        title="Project Infrastructure"
        description="Search, manage and update disaster resilience project architectures."
      >
        <Link to="/projects/new" className="hidden sm:inline-flex items-center px-6 py-3 dark-pro-gradient text-white font-bold rounded-xl shadow-lg border-none hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center gap-2">
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </PageHeader>

      {success && <SuccessAlert message={success} onClose={() => setSuccess('')} />}
      {error && <ErrorAlert message={error} onClose={clearError} />}

      <div className="bg-white/90 glass-panel p-5 rounded-3xl border border-slate-200/80 shadow-md">
        <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects by title or description..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all text-sm font-semibold text-slate-800 shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full pl-11 pr-8 py-3.5 bg-white border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer text-sm font-bold text-slate-700 shadow-sm"
              >
                <option value="">All Types</option>
                <option value="bridge">Bridges</option>
                <option value="road">Roads</option>
                <option value="building">Buildings</option>
              </select>
            </div>

            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full pl-11 pr-8 py-3.5 bg-white border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer text-sm font-bold text-slate-700 shadow-sm"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="ANALYZING">Analyzing</option>
                <option value="APPROVED">Approved</option>
                <option value="HIGH_RISK">High Risk</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center p-12">
           <LoadingSpinner />
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="py-20 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
            <FolderKanban className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 heading-font mb-2">No Projects Initialized</h3>
          <p className="text-slate-500 font-medium mb-8">Get started by creating your first infrastructure project architecture.</p>
          <Link to="/projects/new" className="inline-flex items-center px-6 py-3 dark-pro-gradient text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all gap-2">
            <Plus className="w-5 h-5" />
            Create First Project
          </Link>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project._id} project={project} onDelete={handleDelete} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white/90 glass-panel rounded-2xl border border-slate-200/80 shadow-sm mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-5 py-2.5 bg-slate-100 font-bold text-sm text-slate-700 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                ← Previous
              </button>

              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest px-4">
                Page <span className="text-slate-800">{page}</span> of {totalPages}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-5 py-2.5 bg-slate-100 font-bold text-sm text-slate-700 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectsList
