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
    },
    {
      title: 'Risk Data Collection',
      description: 'Fetch and review project risk snapshots.',
      to: '/projects/placeholder/risk-data',
    },
    {
      title: 'Risk Assessment',
      description: 'Run and review project assessments.',
      to: '/projects/placeholder/assessment',
    },
    {
      title: 'Mitigation Planning',
      description: 'Generate and review mitigation plans.',
      to: '/projects/placeholder/mitigation',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Contractor Dashboard"
        description={`Welcome, ${user?.name}. Use the shared module navigation below.`}
      />

      <div className="mb-6">
        <StatusBadge label="Contractor Access" variant="success" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <div
            key={module.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{module.description}</p>

            <Link
              to={module.to}
              className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
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