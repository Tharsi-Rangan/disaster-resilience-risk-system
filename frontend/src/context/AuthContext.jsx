import { createContext, useEffect, useMemo, useState } from 'react'
import { storage } from '../utils/storage'
import { authService } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = storage.getToken()

      if (!savedToken) {
        setAuthLoading(false)
        return
      }

      try {
        setToken(savedToken)

        const response = await authService.getMe()
        const restoredUser = response.user

        setUser(restoredUser)
        storage.setUser(restoredUser)
      } catch (error) {
        setUser(null)
        setToken(null)
        storage.clearAuth()
      } finally {
        setAuthLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    storage.setUser(userData)
    storage.setToken(authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    storage.clearAuth()
  }

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
    }),
    [user, token, authLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}