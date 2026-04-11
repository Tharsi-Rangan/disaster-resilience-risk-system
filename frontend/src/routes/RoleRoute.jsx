import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../components/feedback/LoadingSpinner'
import useAuth from '../hooks/useAuth'

function RoleRoute({ allowedRoles, children }) {
  const { user, authLoading } = useAuth()

  if (authLoading) {
    return <LoadingSpinner message="Checking access..." />
  }

  const userRole = String(user?.role || '').trim().toUpperCase()
  const normalizedAllowedRoles = (allowedRoles || []).map((role) =>
    String(role).trim().toUpperCase()
  )
  const roleAliases = {
    USER: 'CONTRACTOR',
    CONTRACTER: 'CONTRACTOR',
  }
  const normalizedUserRole = roleAliases[userRole] || userRole

  if (!user) {
    return <Navigate to="/unauthorized" replace />
  }

  // Backward compatibility for old accounts where role may be missing in stored profile.
  if (!normalizedUserRole) {
    return children
  }

  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default RoleRoute
