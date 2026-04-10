import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="mt-3 text-slate-600">Page not found.</p>

      <Link
        to="/login"
        className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Go to Login
      </Link>
    </div>
  )
}

export default NotFoundPage