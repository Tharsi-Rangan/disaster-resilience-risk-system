import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { USER_ROLES } from '../../utils/constants'
import { authService } from '../../services/authService'
import getApiErrorMessage from '../../utils/getApiErrorMessage'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, user } = useAuth()

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  })
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.role === USER_ROLES.ADMIN) {
      navigate('/admin', { replace: true })
    } else if (isAuthenticated && user?.role === USER_ROLES.CONTRACTOR) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFormError('')
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      return 'Email is required.'
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Please enter a valid email address.'
    }

    if (!formData.password.trim()) {
      return 'Password is required.'
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      setLoading(true)
      setFormError('')

      const response = await authService.login({
        email: formData.email.trim(),
        password: formData.password,
      })

      login(response.user, response.token)

      if (response.user?.role === USER_ROLES.ADMIN) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Login failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f9] px-6 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-10 shadow-xl relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 dark-pro-gradient rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-slate-900/20">
            🏗️
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 heading-font text-center">Welcome Back</h1>
        <p className="mt-2 text-sm font-medium text-slate-500 text-center mb-8 tracking-tight">
          Sign in to access the Disaster Resilience Risk System.
        </p>

        {formError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-widest">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-500/20 font-medium"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-slate-600 hover:text-slate-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-500/20 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl dark-pro-gradient px-4 py-4 text-sm font-bold text-white transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/40 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 tracking-wide mt-2"
          >
            {loading ? 'Authenticating User...' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-slate-600 hover:text-slate-500 transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
