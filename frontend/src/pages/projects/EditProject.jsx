import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectForm from '../../components/ProjectForm'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import SuccessAlert from '../../components/SuccessAlert'
import { useProjectStore } from '../../store/projectStore'
import { projectService } from '../../services/projectService'
import './EditProject.css'

const EditProject = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentProject, setCurrentProject, updateProjectLocal, setLoading, loading, error, setError, clearError } = useProjectStore()
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

  const handleSubmit = async (formData) => {
    setLoading(true)
    clearError()
    try {
      const updatedProject = await projectService.updateProject(id, formData)
      updateProjectLocal(id, updatedProject)
      setSuccess('Project updated successfully!')
      setTimeout(() => {
        navigate(`/projects/${id}`)
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to update project')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoad) {
    return <LoadingSpinner />
  }

  if (!currentProject) {
    return (
      <div className="edit-project-page">
        <ErrorAlert 
          message="Project not found" 
          onClose={() => navigate('/projects')}
        />
      </div>
    )
  }

  return (
    <div className="edit-project-page">
      <div className="page-header">
        <h1>Edit Project</h1>
        <p>Update the project details below</p>
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

      <ProjectForm 
        initialData={currentProject}
        onSubmit={handleSubmit} 
        isLoading={loading} 
      />
    </div>
  )
}

export default EditProject
