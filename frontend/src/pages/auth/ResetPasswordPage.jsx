import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import getApiErrorMessage from '../../utils/getApiErrorMessage'

function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const prefilledEmail = useMemo(() => location.state?.email || '', [location.state])

  const [formData, setFormData] = useState({
    email: prefilledEmail,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState(
    location.state?.fromForgotPassword
      ? 'Reset OTP sent successfully. Enter the OTP and your new password.'
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

    if (!formData.newPassword.trim()) {
      return 'New password is required.'
    }

    if (formData.newPassword.length < 8) {
      return 'New password must be at least 8 characters.'
    }

    if (!formData.confirmPassword.trim()) {
      return 'Please confirm your new password.'
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return 'Passwords do not match.'
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

      const response = await authService.resetPassword({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
      })

      setSuccessMessage(response.message || 'Password reset successful.')

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { email: formData.email.trim() },
        })
      }, 1200)
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, 'Password reset failed. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email, OTP, and new password.
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

          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Resetting password...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Back to{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPasswordPage