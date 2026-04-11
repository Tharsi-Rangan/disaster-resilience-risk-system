import { Link } from 'react-router-dom'
import StatusBadge from '../../components/common/StatusBadge'
import useAuth from '../../hooks/useAuth'
import { Activity, FolderKanban, ShieldAlert, Users, TrendingUp } from 'lucide-react'

function AdminDashboardPage() {
  const { user } = useAuth()

  const cards = [
    { title: 'Global Projects', description: 'Monitor all recorded project infrastructures across the ecosystem.', icon: FolderKanban, link: '/admin/projects', color: 'text-slate-500', bg: 'bg-slate-50' },
    { title: 'Risk Assessments', description: 'Review risk models, threat simulations & assessment outputs.', icon: Activity, link: '/admin/assessments', color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Mitigation Actions', description: 'Manage compliance, AI resolution plans and mitigation tracking.', icon: ShieldAlert, link: '/admin/mitigations', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 glass-panel p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 heading-font tracking-tight">System Control Panel</h1>
          <p className="mt-2 text-slate-500 font-medium">Welcome back, <span className="text-slate-600 font-bold">{user?.name}</span>. Monitor the global disaster risk grid.</p>
        </div>
        <StatusBadge label="Admin Privilege Active" variant="info" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              to={card.link}
              className="group rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-24 h-24" />
              </div>
              <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 heading-font mb-2 group-hover:text-slate-700 transition-colors">{card.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed relative z-10">{card.description}</p>
            </Link>
          )
        })}
      </div>

      {/* Global Activity Analytics Mock */}
      <div className="rounded-3xl border border-slate-200/80 bg-slate-900 p-8 shadow-lg shadow-slate-900/20 relative overflow-hidden mt-8 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/20 blur-3xl rounded-full"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-white heading-font mb-2 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-slate-400" />
                Network Analytics Tracker
              </h3>
              <p className="text-slate-200/80 text-sm font-medium">System activity is currently healthy. Background risk simulation services are polling appropriately.</p>
            </div>
            
            <div className="flex items-center gap-6 p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
               <div className="text-center">
                 <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Global Users</p>
                 <p className="text-2xl font-extrabold text-white">1,204</p>
               </div>
               <div className="w-px h-10 bg-white/20"></div>
               <div className="text-center">
                 <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Nodes</p>
                 <p className="text-2xl font-extrabold text-white animate-pulse">Online</p>
               </div>
            </div>
          </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
