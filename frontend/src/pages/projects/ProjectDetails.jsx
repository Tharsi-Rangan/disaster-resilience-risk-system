import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import SuccessAlert from '../../components/SuccessAlert'
import { useProjectStore } from '../../store/projectStore'
import { projectService } from '../../services/projectService'
import './ProjectDetails.css'

const ProjectDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentProject, setCurrentProject, deleteProjectLocal, setLoading, loading, error, setError, clearError } = useProjectStore()
  const [success, setSuccess] = useState('')
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const project = await projectService.getProjectById(id)
        setCurrentProject(project)
        setInitialLoad(false)
      } catch (err) {
        setError(err.message || 'Failed to fetch project')
        setInitialLoad(false)
      }
    }

    if (!currentProject || currentProject._id !== id) {
      fetchProject()
    } else {
      setInitialLoad(false)
    }
  }, [id, currentProject, setCurrentProject, setError])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    clearError()
    try {
      await projectService.deleteProject(id)
      deleteProjectLocal(id)
      setSuccess('Project deleted successfully!')
      setTimeout(() => {
        navigate('/projects')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to delete project')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`
  }

  const getProjectTypeIcon = (type) => {
    const icons = {
      bridge: '🌉',
      road: '🛣️',
      building: '🏢'
    }
    return icons[type] || '🏗️'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (initialLoad) {
    return <LoadingSpinner />
  }

  if (!currentProject) {
    return (
      <div className="project-details-page">
        <ErrorAlert 
          message="Project not found" 
          onClose={() => navigate('/projects')}
        />
      </div>
    )
  }

  const project = currentProject

  return (
    <div className="project-details-page">
      {success && (
        <SuccessAlert 
          message={success} 
          onClose={() => setSuccess('')}
          autoClose={false}
        />
      )}

      {error && (
        <ErrorAlert 
          message={error} 
          onClose={clearError}
        />
      )}

      <div className="details-header">
        <div className="header-content">
          <div className="header-title">
            <span className="project-type-icon">{getProjectTypeIcon(project.projectType)}</span>
            <div>
              <h1>{project.title}</h1>
              <p className="header-type">Project Type: {project.projectType.toUpperCase()}</p>
            </div>
          </div>
          <span className={getStatusBadgeClass(project.status)}>{project.status}</span>
        </div>

        <div className="header-actions">
          <Link to={`/projects/${project._id}/edit`} className="btn btn-edit">
            ✏️ Edit
          </Link>
          <button 
            onClick={handleDelete} 
            className="btn btn-delete"
            disabled={loading}
          >
            🗑️ Delete
          </button>
          <Link to="/projects" className="btn btn-secondary">
            ← Back to Projects
          </Link>
        </div>
      </div>

      <div className="details-content">
        <div className="details-section">
          <h2>Description</h2>
          <p className="description-text">
            {project.description || 'No description available'}
          </p>
        </div>

        <div className="details-grid">
          <div className="details-section">
            <h2>Location</h2>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{project.location.address}</span>
            </div>
            {project.location.lat && project.location.lng && (
              <div className="detail-item">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">
                  {project.location.lat.toFixed(4)}, {project.location.lng.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          <div className="details-section">
            <h2>Financial Information</h2>
            {project.budget ? (
              <div className="detail-item">
                <span className="detail-label">Budget:</span>
                <span className="detail-value">${project.budget.toLocaleString()}</span>
              </div>
            ) : (
              <p className="no-data">No budget specified</p>
            )}
          </div>

          <div className="details-section">
            <h2>Timeline</h2>
            {project.startDate && (
              <div className="detail-item">
                <span className="detail-label">Start Date:</span>
                <span className="detail-value">{formatDate(project.startDate)}</span>
              </div>
            )}
            {project.endDate && (
              <div className="detail-item">
                <span className="detail-label">End Date:</span>
                <span className="detail-value">{formatDate(project.endDate)}</span>
              </div>
            )}
            {!project.startDate && !project.endDate && (
              <p className="no-data">No dates specified</p>
            )}
          </div>

          <div className="details-section">
            <h2>Project Creator</h2>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{project.createdBy?.name || 'Unknown'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{project.createdBy?.email || 'Unknown'}</span>
            </div>
          </div>

          <div className="details-section">
            <h2>Dates</h2>
            <div className="detail-item">
              <span className="detail-label">Created:</span>
              <span className="detail-value">{formatDate(project.createdAt)}</span>
            </div>
            {project.updatedAt && (
              <div className="detail-item">
                <span className="detail-label">Last Updated:</span>
                <span className="detail-value">{formatDate(project.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetails
