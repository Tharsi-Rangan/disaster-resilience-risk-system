import api from '../api/axios'

const riskDataService = {
  fetchRiskData: async (projectId, payload = {}) => {
    const response = await api.post(`/risk-data/fetch/${projectId}`, payload)
    return response.data
  },

  getLatestRiskData: async (projectId) => {
    const response = await api.get(`/risk-data/${projectId}/latest`)
    return response.data
  },

  getRiskHistory: async (projectId) => {
    const response = await api.get(`/risk-data/${projectId}/history`)
    return response.data
  },

  deleteRiskSnapshot: async (snapshotId) => {
    const response = await api.delete(`/risk-data/${snapshotId}`)
    return response.data
  },
}

export default riskDataService