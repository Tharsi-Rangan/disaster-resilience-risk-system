import { useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

function getPageTitle(pathname) {
  if (pathname.startsWith('/admin/risk-data/projects')) return 'All Projects Risk Data'
  if (pathname.startsWith('/admin/assessments/projects')) return 'All Projects Assessments'
  if (pathname.startsWith('/admin/mitigations/projects')) return 'All Projects Mitigations'
  if (pathname.startsWith('/admin/mitigations')) return 'Admin Mitigations'
  if (pathname.startsWith('/admin/assessments')) return 'Admin Assessments'
  if (pathname.startsWith('/admin/projects')) return 'Admin Projects'
  if (pathname.startsWith('/admin')) return 'Admin Dashboard'
  if (pathname.startsWith('/projects/new')) return 'Create Project'
  if (pathname.includes('/risk-data')) return 'Risk Data'
  if (pathname.includes('/assessment')) return 'Risk Assessment'
  if (pathname.includes('/mitigation')) return 'Mitigation Planning'
  if (pathname.includes('/edit')) return 'Edit Project'
  if (pathname.startsWith('/projects/')) return 'Project Details'
  if (pathname.startsWith('/projects')) return 'Projects'
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  return 'ResiliGuard'
}

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 heading-font">
            {getPageTitle(location.pathname)}
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Disaster Resilience Risk System
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden rounded-xl bg-slate-50 border border-slate-200 px-4 py-1.5 text-sm sm:flex gap-3 items-center shadow-inner">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-lg border border-slate-200">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{user?.role || 'No role'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-white text-rose-600 px-4 py-2 text-sm font-semibold transition hover:bg-rose-50 hover:border-rose-300 border border-slate-200 shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
