import { useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

function getPageTitle(pathname) {
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
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {getPageTitle(location.pathname)}
          </h2>
          <p className="text-sm text-slate-500">
            Disaster Resilience Risk System
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm sm:block">
            <p className="font-medium text-slate-900">{user?.name || 'User'}</p>
            <p className="text-slate-500">{user?.role || 'No role'}</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar