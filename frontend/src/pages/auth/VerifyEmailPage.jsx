import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import getApiErrorMessage from '../../utils/getApiErrorMessage'

function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const prefilledEmail = useMemo(() => location.state?.email || '', [location.state])

  const [formData, setFormData] = useState({
    email: prefilledEmail,
    otp: '',
  })
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState(
    location.state?.fromRegister
      ? 'Registration successful. Please check your email and enter the OTP.'
      : ''
  )
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFormError('')
    setSuccessMessage('')
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      return 'Email is required.'
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Please enter a valid email address.'
    }

    if (!formData.otp.trim()) {
      return 'OTP is required.'
    }

    if (!/^\d{6}$/.test(formData.otp.trim())) {
      return 'OTP must be 6 digits.'
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
      setSuccessMessage('')

      const response = await authService.verifyEmail({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
      })

      setSuccessMessage(response.message || 'Email verified successfully.')

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { email: formData.email.trim() },
        })
      }, 1200)
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, 'Email verification failed. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Verify Email</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter the 6-digit OTP sent to your email.
        </p>

        {formError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </div>

          <div>
            <label htmlFor="otp" className="mb-2 block text-sm font-medium text-slate-700">
              OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter 6-digit OTP"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm tracking-[0.3em] outline-none transition focus:border-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already verified?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Go to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default VerifyEmailPage
