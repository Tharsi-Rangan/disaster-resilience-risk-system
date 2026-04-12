import apiClient from './api'

export const generateMitigationPlan = async (projectId, data = {}) => {
  const response = await apiClient.post(`/mitigation/generate/${projectId}`, data)
  return response.data
}

export const getLatestMitigationPlan = async (projectId) => {
  const response = await apiClient.get(`/mitigation/${projectId}/latest`)
  return response.data
}

export const getMitigationHistory = async (projectId) => {
  const response = await apiClient.get(`/mitigation/${projectId}/history`)
  return response.data
}

export const getAllMitigationPlans = async () => {
  const response = await apiClient.get('/mitigation/all')
  return response.data
}

export const updateRecommendation = async (planId, recId, data) => {
  const response = await apiClient.patch(`/mitigation/${planId}/recommendations/${recId}`, data)
  return response.data
}

export const deleteRecommendation = async (planId, recId) => {
  const response = await apiClient.delete(`/mitigation/${planId}/recommendations/${recId}`)
  return response.data
}

export const deleteMitigationPlan = async (planId) => {
  const response = await apiClient.delete(`/mitigation/${planId}`)
  return response.data
}

export const chatWithAiAssistant = async (message, contextTitle, contextDetails) => {
  const response = await apiClient.post('/mitigation/chat', { message, contextTitle, contextDetails })
  return response.data
}
