export const APP_NAME = 'ResiliGuard'

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CONTRACTOR: 'CONTRACTOR',
}

const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL?.trim()
const rawApiBaseUrl = configuredApiBaseUrl || 'http://localhost:5000'

const hasProtocol = /^(https?:)?\/\//i.test(rawApiBaseUrl)
const normalizedBase = hasProtocol
  ? rawApiBaseUrl
  : `${rawApiBaseUrl.startsWith('localhost') || rawApiBaseUrl.startsWith('127.0.0.1') ? 'http' : 'https'}://${rawApiBaseUrl}`

export const API_BASE_URL = normalizedBase.endsWith('/api')
  ? normalizedBase
  : `${normalizedBase.replace(/\/$/, '')}/api`