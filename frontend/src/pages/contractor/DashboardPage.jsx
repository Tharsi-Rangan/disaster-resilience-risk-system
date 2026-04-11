import { Link } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import useAuth from '../../hooks/useAuth'

function DashboardPage() {
  const { user } = useAuth()

  const modules = [
    {
      title: 'Project Management',
      description: 'Create, view, edit, and manage projects.',
      to: '/projects',
      status: 'Available',
    },
    {
      title: 'Risk Data Collection',
      description: 'Fetch and review project risk snapshots.',
      to: '/projects/placeholder/risk-data',
      status: 'Depends on project selection',
    },
    {
      title: 'Risk Assessment',
      description: 'Run and review project assessments.',
      to: '/contractor/assessments',
      status: 'Available',
    },
    {
      title: 'Mitigation Planning',
      description: 'Generate and review mitigation plans.',
      to: '/projects/placeholder/mitigation',
      status: 'Depends on project selection',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contractor Dashboard"
        description={`Welcome, ${user?.name || 'Contractor'}. Use the module navigation below.`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge label="Contractor Access" variant="success" />
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Disaster Resilience Risk System
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <div
            key={module.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {module.status}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {module.description}
            </p>

            <Link
              to={module.to}
              className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Open Module
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage