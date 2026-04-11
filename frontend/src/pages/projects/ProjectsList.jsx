import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProjectCard from '../../components/ProjectCard'
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
    <div className="projects-list-container">
      <div className="page-header">
        <h1>Projects</h1>
        <Link to="/projects/new" className="btn btn-create">
          + New Project
        </Link>
      </div>

      {success && (
        <SuccessAlert 
          message={success} 
          onClose={() => setSuccess('')}
        />
      )}

      {error && (
        <ErrorAlert 
          message={error} 
          onClose={clearError}
        />
      )}

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search projects..."
            value={filters.search}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="bridge">Bridge</option>
            <option value="road">Road</option>
            <option value="building">Building</option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="ANALYZING">Analyzing</option>
            <option value="APPROVED">Approved</option>
            <option value="HIGH_RISK">High Risk</option>
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && projects.length === 0 && (
        <div className="empty-state">
          <p>📭 No projects found</p>
          <Link to="/projects/new" className="btn btn-primary">
            Create your first project
          </Link>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <>
          <div className="projects-grid">
            {projects.map(project => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                ← Previous
              </button>

              <div className="page-info">
                Page {page} of {totalPages}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProjectsList
