import React from 'react'
import { Link } from 'react-router-dom'
import './ProjectCard.css'

const ProjectCard = ({ project, onDelete }) => {
  const getStatusBadgeClass = (status) => {
    const normalizedStatus = String(status || 'DRAFT').toLowerCase()
    return `status-badge status-${normalizedStatus}`
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
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDelete = (e) => {
    e.preventDefault()
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete(project._id)
    }
  }

  return (
    <Link to={`/projects/${project._id}`} className="project-card">
      <div className="card-header">
        <div className="card-title-section">
          <span className="project-type-icon">{getProjectTypeIcon(project.projectType)}</span>
          <h3 className="card-title">{project.title}</h3>
        </div>
        <span className={getStatusBadgeClass(project.status)}>{project.status}</span>
      </div>

      <p className="card-description">{project.description || 'No description'}</p>

      <div className="card-details">
        <div className="detail-item">
          <span className="detail-label">📍 Location:</span>
          <span className="detail-value">{project.location?.address || 'Location not set'}</span>
        </div>
        {project.budget && (
          <div className="detail-item">
            <span className="detail-label">💰 Budget:</span>
            <span className="detail-value">LKR {project.budget.toLocaleString()}</span>
          </div>
        )}
        {project.startDate && (
          <div className="detail-item">
            <span className="detail-label">📅 Start:</span>
            <span className="detail-value">{formatDate(project.startDate)}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="created-by">By {project.createdBy?.name || 'Unknown'}</span>
        <button 
          className="btn-delete"
          onClick={handleDelete}
          title="Delete project"
        >
          🗑️ Delete
        </button>
      </div>
    </Link>
  )
}

export default ProjectCard
