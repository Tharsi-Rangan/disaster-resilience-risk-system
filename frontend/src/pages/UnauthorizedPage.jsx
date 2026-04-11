import { Link } from 'react-router-dom'
import { ShieldAlert, LogIn } from 'lucide-react'

function UnauthorizedPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.2),transparent_45%),radial-gradient(circle_at_bottom,rgba(234,88,12,0.18),transparent_40%)]" />

      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-lg sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">403</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Access Denied</h1>
        <p className="mt-3 text-sm text-slate-200 sm:text-base">
          You do not have permission to view this page. Please sign in with an authorized account.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            <LogIn className="h-4 w-4" />
            Back to Login
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
