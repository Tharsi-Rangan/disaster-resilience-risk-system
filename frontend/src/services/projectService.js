import apiClient from './api'

export const projectService = {
  getMapsApiKey: async () => {
    try {
      const response = await apiClient.get('/projects/maps-api-key')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get all projects with pagination and filters
  getProjects: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = {
        page,
        limit,
        ...filters
      }
      const response = await apiClient.get('/projects', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get single project
  getProjectById: async (id) => {
    try {
      const response = await apiClient.get(`/projects/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      const response = await apiClient.post('/projects', projectData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update project
  updateProject: async (id, projectData) => {
    try {
      const response = await apiClient.put(`/projects/${id}`, projectData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete project
  deleteProject: async (id) => {
    try {
      await apiClient.delete(`/projects/${id}`)
      return true
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update project status (admin only)
  updateProjectStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/projects/${id}/status`, { status })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}
