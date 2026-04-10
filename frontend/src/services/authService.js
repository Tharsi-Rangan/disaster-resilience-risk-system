import api from '../api/axios'

export const authService = {
  register: async (payload) => {
    const response = await api.post('/auth/register', payload)
    return response.data
  },

  verifyEmail: async (payload) => {
    const response = await api.post('/auth/verify-email', payload)
    return response.data
  },

  login: async (payload) => {
    const response = await api.post('/auth/login', payload)
    return response.data
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  forgotPassword: async (payload) => {
    const response = await api.post('/auth/forgot-password', payload)
    return response.data
  },

  resetPassword: async (payload) => {
    const response = await api.post('/auth/reset-password', payload)
    return response.data
  },
}