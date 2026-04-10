import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import useAuth from '../../hooks/useAuth'

function AdminDashboardPage() {
  const { user } = useAuth()

  const cards = [
    { title: 'Projects', description: 'Monitor all projects in the system.' },
    { title: 'Assessments', description: 'Review risk assessment outputs.' },
    { title: 'Mitigations', description: 'Manage mitigation plans and actions.' },
  ]

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description={`Welcome, ${user?.name}. Monitor the overall system from here.`}
      />

      <div className="mb-6">
        <StatusBadge label="Admin Access" variant="info" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboardPage