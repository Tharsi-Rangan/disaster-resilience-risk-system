import { NavLink, Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { APP_NAME, USER_ROLES } from '../../utils/constants'
import { LayoutDashboard, FolderKanban, PlusSquare, ShieldAlert, GitBranch, LogOut, ChevronRight } from 'lucide-react'

function Sidebar() {
  const { user } = useAuth()

  const contractorLinks = [
    { label: 'Dashboard', to: '/dashboard', end: true, icon: LayoutDashboard },
    { label: 'Projects', to: '/projects', end: true, icon: FolderKanban },
    { label: 'Create Project', to: '/projects/new', end: true, icon: PlusSquare },
  ]

  const adminLinks = [
    { label: 'Admin Dashboard', to: '/admin', end: true, icon: LayoutDashboard },
    { label: 'Projects', to: '/admin/projects', end: true, icon: FolderKanban },
    { label: 'Assessments', to: '/admin/assessments', end: true, icon: ShieldAlert },
    { label: 'Mitigations', to: '/admin/mitigations', end: true, icon: GitBranch },
  ]

  const links = user?.role === USER_ROLES.ADMIN ? adminLinks : contractorLinks

  return (
    <aside className="fixed inset-y-0 left-0 w-72 flex-col dark-pro-gradient shadow-[4px_0_24px_rgba(0,0,0,0.15)] hidden lg:flex z-50 overflow-hidden">
      <div className="border-b border-slate-900/50 px-6 py-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-2xl">🏗️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white heading-font tracking-tight">{APP_NAME}</h1>
            <p className="text-xs text-slate-200 mt-0.5 opacity-80 font-medium">Risk Control Platform</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2 p-5 flex-1 relative z-10 overflow-y-auto scrollbar-hide">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400/80 mb-3 px-3">Main Menu</p>
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-slate-600 shadow-lg shadow-slate-900/40 text-white font-semibold'
                    : 'text-slate-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'text-slate-300 group-hover:text-slate-100'}`} />
                  <span className="flex-1">{link.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-slate-200" />}
                </>
              )}
            </NavLink>
          )
        })}

        {/* Quick Action Button for Sidebar */}
        <div className="mt-8 px-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-500/20 to-blue-600/10 border border-slate-400/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h4 className="text-sm font-bold text-white mb-1 relative z-10">Have a new plan?</h4>
                <p className="text-xs text-slate-200 mb-4 relative z-10">Setup a new risk framework node.</p>
                <Link to="/projects/new" className="flex items-center justify-center gap-2 w-full py-2 bg-slate-500 hover:bg-slate-400 text-white text-xs font-bold rounded-xl transition-colors relative z-10 shadow-sm">
                    <PlusSquare className="w-4 h-4" /> 
                    New Project
                </Link>
            </div>
        </div>
      </nav>

      <div className="p-4 mt-auto mb-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 w-full backdrop-blur-sm shadow-inner">
           <p className="text-xs text-slate-200 uppercase tracking-widest font-bold mb-2">System Status</p>
           <div className="flex items-center gap-3 bg-white/5 rounded-xl p-2 px-3 border border-slate-500/20">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
             <p className="text-sm font-semibold text-white">All Systems Nominal</p>
           </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
