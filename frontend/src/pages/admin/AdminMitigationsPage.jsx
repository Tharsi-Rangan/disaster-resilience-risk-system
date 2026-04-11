import { useState, useEffect } from 'react'
import { Trash2, AlertTriangle, Cpu, FolderKanban } from 'lucide-react'
import StatusBadge from '../../components/common/StatusBadge'
import { getAllMitigationPlans, deleteMitigationPlan } from '../../services/mitigationService'

function AdminMitigationsPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
      await deleteMitigationPlan(id)
      setPlans(prev => prev.filter(plan => plan._id !== id))
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to delete plan')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
          <p className="text-sm text-slate-500 font-bold animate-pulse tracking-widest uppercase">Fetching AI Mitigation Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 w-full">

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
           <AlertTriangle className="w-5 h-5" />
           <span className="font-medium">{error}</span>
        </div>
      )}

      {plans.length === 0 && !error ? (
        <div className="p-16 text-center bg-slate-50 rounded-3xl border border-slate-200/80">
             <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-700 mb-1">No Plans Generated</h3>
             <p className="text-sm text-slate-500">There are currently no AI mitigation plans active in the system.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Project Information</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">AI Engine</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Metrics Mapping</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Plan Progress</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Root Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 align-top">
                      <p className="font-extrabold text-slate-900 heading-font text-lg tracking-tight mb-0.5">{plan.projectId?.title || 'System Orphaned Plan'}</p>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Architect: {plan.createdBy?.name || 'System'}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest border border-indigo-100 shadow-sm gap-1.5"><Cpu className="w-3 h-3" /> {plan.aiProvider || "RULE-BASED"}</span>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <StatusBadge 
                        label={plan.priorityLevel} 
                        variant={plan.priorityLevel === 'HIGH' ? 'danger' : plan.priorityLevel === 'MEDIUM' ? 'warning' : 'success'} 
                      />
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-5 text-xs font-bold text-slate-500">
                        <div className="text-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-inner">
                          <span className="block text-lg text-slate-900 font-extrabold">{plan.totalRecommendations}</span>
                          Total
                        </div>
                        <div className="text-center bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60 shadow-inner">
                          <span className="block text-lg text-amber-600 font-extrabold">{plan.ongoingCount}</span>
                          WIP
                        </div>
                        <div className="text-center bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60 shadow-inner">
                          <span className="block text-lg text-emerald-600 font-extrabold">{plan.completedCount}</span>
                          Done
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <StatusBadge 
                        label={plan.planStatus} 
                        variant={plan.planStatus === 'COMPLETED' ? 'success' : plan.planStatus === 'IN_PROGRESS' ? 'info' : 'warning'} 
                      />
                    </td>
                    <td className="px-6 py-5 align-top text-right">
                      <div className="flex justify-end opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(plan._id)}
                          disabled={deletingId === plan._id}
                          className="p-2 rounded-xl border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all disabled:opacity-50"
                          title="Purge Plan"
                        >
                          <Trash2 className="w-4 h-4 cursor-pointer" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMitigationsPage
