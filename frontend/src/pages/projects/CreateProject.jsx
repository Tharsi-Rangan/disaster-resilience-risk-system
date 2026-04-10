import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectForm from '../../components/ProjectForm'
import ErrorAlert from '../../components/ErrorAlert'
import SuccessAlert from '../../components/SuccessAlert'
import { useProjectStore } from '../../store/projectStore'
import { projectService } from '../../services/projectService'
import './CreateProject.css'

const CreateProject = () => {
  const navigate = useNavigate()
  const { addProject, setLoading, loading, error, setError, clearError } = useProjectStore()
  const [success, setSuccess] = useState('')

  const handleSubmit = async (formData) => {
    setLoading(true)
    clearError()
    try {
      const newProject = await projectService.createProject(formData)
      addProject(newProject)
      setSuccess('Project created successfully!')
      setTimeout(() => {
        navigate(`/projects/${newProject._id}`)
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-project-page">
      <div className="page-header">
        <h1>Create New Project</h1>
        <p>Fill in the project details below to create a new resilience project</p>
      </div>

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

      <ProjectForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  )
}

export default CreateProject
