import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { USER_ROLES } from '../../utils/constants'

function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user?.role === USER_ROLES.ADMIN) {
      navigate('/admin', { replace: true })
    } else if (isAuthenticated && user?.role === USER_ROLES.CONTRACTOR) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleMockLogin = (role) => {
    if (role === USER_ROLES.ADMIN) {
      login(
        {
          name: 'Admin User',
          email: 'admin@resiliguard.com',
          role: USER_ROLES.ADMIN,
          isVerified: true,
        },
        'mock-admin-token'
      )
      navigate('/admin')
      return
    }

    login(
      {
        name: 'Contractor User',
        email: 'contractor@resiliguard.com',
        role: USER_ROLES.CONTRACTOR,
        isVerified: true,
      },
      'mock-contractor-token'
    )
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>
        <p className="mt-2 text-sm text-slate-500">
          Temporary auth testing screen. Real API login will be connected in the next step.
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleMockLogin(USER_ROLES.CONTRACTOR)}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Continue as Contractor
          </button>

          <button
            onClick={() => handleMockLogin(USER_ROLES.ADMIN)}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Continue as Admin
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage