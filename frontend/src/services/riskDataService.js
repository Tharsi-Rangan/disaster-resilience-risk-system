import api from '../api/axios'

export const riskDataService = {
  fetchRiskData: async (projectId, payload = {}) => {
    try {
      const { data } = await api.post(`/risk-data/fetch/${projectId}`, payload)
      return data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getLatestRiskData: async (projectId) => {
    try {
      const { data } = await api.get(`/risk-data/${projectId}/latest`)
      return data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getRiskHistory: async (projectId) => {
    try {
      const { data } = await api.get(`/risk-data/${projectId}/history`)
      return data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteRiskSnapshot: async (snapshotId) => {
    try {
      const { data } = await api.delete(`/risk-data/${snapshotId}`)
      return data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}