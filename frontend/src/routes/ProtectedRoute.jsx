import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingSpinner from '../components/feedback/LoadingSpinner'
import useAuth from '../hooks/useAuth'

function ProtectedRoute() {
  const { isAuthenticated, authLoading } = useAuth()
  const location = useLocation()

  if (authLoading) {
    return <LoadingSpinner message="Checking session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
