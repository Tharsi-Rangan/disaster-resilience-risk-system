import React, { useState, useEffect } from 'react'
import './ProjectForm.css'

const ProjectForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: 'bridge',
    location: {
      address: ''
    },
    budget: '',
    startDate: '',
    endDate: '',
    ...initialData
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ''
      }))
    }
  }, [initialData])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.location.address.trim()) {
      newErrors.location = 'Location address is required'
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.dateRange = 'Start date must be before end date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'location.address') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          address: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2>Project Information</h2>

        <div className="form-group">
          <label htmlFor="title">Project Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter project title"
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter project description"
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="projectType">Project Type *</label>
            <select
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
            >
              <option value="bridge">Bridge</option>
              <option value="road">Road</option>
              <option value="building">Building</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="budget">Budget ($)</label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="Enter budget"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Location & Duration</h2>

        <div className="form-group">
          <label htmlFor="location">Location Address *</label>
          <input
            type="text"
            id="location"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            placeholder="Enter location address"
            className={errors.location ? 'error' : ''}
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {errors.dateRange && (
          <div className="error-message form-error">{errors.dateRange}</div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </form>
  )
}

export default ProjectForm
