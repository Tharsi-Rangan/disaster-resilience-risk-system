import { Link } from 'react-router-dom'
import { Compass, Home, LogIn } from 'lucide-react'

function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_40%)]" />

      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <Compass className="h-7 w-7" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Page Not Found</h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          The page you are looking for may have been moved, renamed, or does not exist.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LogIn className="h-4 w-4" />
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage