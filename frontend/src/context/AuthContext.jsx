import { createContext, useEffect, useMemo, useState } from 'react'
import { storage } from '../utils/storage'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const savedToken = storage.getToken()
    const savedUser = storage.getUser()

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(savedUser)
    }

    setAuthLoading(false)
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