import useAuth from '../../hooks/useAuth'

function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600">
          Welcome, {user?.name}. Monitoring and management views will be added here.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Admin protected route is working successfully.</p>
      </div>
    </div>
  )
}

export default AdminDashboardPage