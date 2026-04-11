import { NavLink } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { APP_NAME, USER_ROLES } from '../../utils/constants'

function Sidebar() {
  const { user } = useAuth()

  const contractorLinks = [
    { label: 'Dashboard', to: '/dashboard', end: true },
    { label: 'Projects', to: '/projects', end: true },
    { label: 'Create Project', to: '/projects/new', end: true },
  ]

  const adminLinks = [
    { label: 'Admin Dashboard', to: '/admin', end: true },
    { label: 'Projects', to: '/admin/projects', end: true },
    { label: 'Assessments', to: '/admin/assessments', end: true },
    { label: 'Mitigations', to: '/admin/mitigations', end: true },
  ]

  const links = user?.role === USER_ROLES.ADMIN ? adminLinks : contractorLinks

  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
      <div className="border-b border-slate-200 px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900">{APP_NAME}</h1>
        <p className="mt-1 text-sm text-slate-500">Disaster resilience platform</p>
      </div>

      <nav className="space-y-2 p-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar