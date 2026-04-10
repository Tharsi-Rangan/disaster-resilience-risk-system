import useAuth from '../../hooks/useAuth'

function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contractor Dashboard</h1>
        <p className="text-slate-600">
          Welcome, {user?.name}. Project, risk data, assessment, and mitigation flow will appear here.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Contractor protected route is working successfully.</p>
      </div>
    </div>
  )
}

export default DashboardPage