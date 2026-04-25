import { Activity, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function RiskDataPageTabs({ projectId, current = 'risk-data' }) {
  const navigate = useNavigate()

  const tabs = [
    {
      key: 'risk-data',
      label: 'Risk Data',
      description: 'Live snapshot, tools, and trends',
      icon: Activity,
      onClick: () => navigate(`/projects/${projectId}/risk-data`),
    },
    {
      key: 'history',
      label: 'Snapshot History',
      description: 'Archive, comparison, and reporting',
      icon: History,
      onClick: () => navigate(`/projects/${projectId}/risk-data/history`),
    },
  ]

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-r from-slate-50 via-white to-slate-50 p-3 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-semibold text-slate-900">Quick Navigation</p>
          <p className="text-xs text-slate-500">Switch instantly between the live monitoring view and the full archive workspace.</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Module Switcher
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.key === current

          return (
            <button
              key={tab.key}
              type="button"
              onClick={tab.onClick}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                isActive
                  ? 'border-slate-900 bg-linear-to-r from-slate-900 to-slate-800 text-white shadow-sm'
                  : 'border-slate-200 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className={`rounded-xl p-2.5 ${isActive ? 'bg-white/10' : 'bg-slate-100'}`}>
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-700'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-900'}`}>{tab.label}</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                      isActive ? 'bg-white/10 text-slate-100' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isActive ? 'Current' : 'Open'}
                  </span>
                </div>
                <p className={`mt-1 text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>{tab.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default RiskDataPageTabs
