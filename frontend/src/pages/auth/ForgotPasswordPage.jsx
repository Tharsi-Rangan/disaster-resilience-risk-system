import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import getApiErrorMessage from '../../utils/getApiErrorMessage'

function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!email.trim()) {
      return 'Email is required.'
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address.'
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

      const response = await authService.forgotPassword({
        email: email.trim(),
      })

      setSuccessMessage(response.message || 'Reset OTP sent to email.')

      navigate('/reset-password', {
        replace: true,
        state: {
          email: email.trim(),
          fromForgotPassword: true,
        },
      })
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, 'Failed to send reset OTP. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email to receive a password reset OTP.
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
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setFormError('')
                setSuccessMessage('')
              }}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Sending OTP...' : 'Send Reset OTP'}
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

export default ForgotPasswordPage
