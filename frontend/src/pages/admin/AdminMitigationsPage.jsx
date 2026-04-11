import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { getAllMitigationPlans, deleteMitigationPlan } from '../../services/mitigationService'

function AdminMitigationsPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const data = await getAllMitigationPlans()
      setPlans(data.mitigationPlans)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch mitigation plans')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this mitigation plan?")) return;
    
    try {
      setDeletingId(id)
      setError(null)
      await deleteMitigationPlan(id)
      setPlans(prev => prev.filter(plan => plan._id !== id))
      setSuccess("Mitigation plan deleted successfully.")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete plan')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium">Loading mitigation plans...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Mitigation Overview"
        description="Monitor and manage disaster mitigation progress across all active projects."
      />

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             <span className="font-medium">{error}</span>
           </div>
           <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 px-2 font-bold text-lg">&times;</button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             <span className="font-medium">{success}</span>
           </div>
           <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700 px-2 font-bold text-lg">&times;</button>
        </div>
      )}

      {plans.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-16 text-center">
           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
             <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path d="M12 14l9-5-9-5-9 5 9 5z" />
               <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
             </svg>
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">No Plans Generated</h3>
           <p className="text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">There are currently no AI mitigation plans active in the system.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Project Information</th>
                <th className="px-6 py-4">AI Engine</th>
                <th className="px-6 py-4">Priority Level</th>
                <th className="px-6 py-4">Progress Map</th>
                <th className="px-6 py-4">Plan Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {plans.map((plan) => (
                <tr key={plan._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 mb-1">{plan.projectId?.title || 'Unknown/Deleted Project'}</p>
                    <p className="text-xs text-slate-400">Owner: {plan.createdBy?.name || 'Unknown'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge label={plan.aiProvider || "RULE-BASED"} variant="default" />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge 
                      label={plan.priorityLevel} 
                      variant={plan.priorityLevel === 'HIGH' ? 'danger' : plan.priorityLevel === 'MEDIUM' ? 'warning' : 'success'} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                      <div className="text-center">
                        <span className="block text-lg text-slate-900">{plan.totalRecommendations}</span>
                        Total
                      </div>
                      <div className="text-center">
                        <span className="block text-lg text-amber-600">{plan.ongoingCount}</span>
                        WIP
                      </div>
                      <div className="text-center">
                        <span className="block text-lg text-green-600">{plan.completedCount}</span>
                        Done
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge 
                      label={plan.planStatus} 
                      variant={plan.planStatus === 'COMPLETED' ? 'success' : plan.planStatus === 'IN_PROGRESS' ? 'info' : 'warning'} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-4">
                      {plan.projectId?._id && (
                        <Link
                          to={`/projects/${plan.projectId._id}/mitigation`}
                          className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                        >
                          View Details
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(plan._id)}
                        disabled={deletingId === plan._id}
                        className="text-red-500 hover:text-red-700 font-medium disabled:opacity-50 flex items-center gap-1"
                      >
                        {deletingId === plan._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminMitigationsPage