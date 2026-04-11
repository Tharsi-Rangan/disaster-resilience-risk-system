import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { 
  getLatestMitigationPlan, 
  generateMitigationPlan, 
  updateRecommendation,
  deleteRecommendation,
  deleteMitigationPlan,
  getMitigationHistory
} from '../../services/mitigationService'

const isValidProjectId = (projectId) => /^[a-f\d]{24}$/i.test(String(projectId || ''))

function MitigationPage() {
  const navigate = useNavigate()
  const { id: projectId } = useParams()
  const [activeTab, setActiveTab] = useState('LATEST') // 'LATEST' | 'HISTORY'
  
  const [plan, setPlan] = useState(null)
  const [historyPlans, setHistoryPlans] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!isValidProjectId(projectId)) {
      navigate('/projects', { replace: true })
      return
    }

    if (activeTab === 'LATEST') fetchPlan()
    else fetchHistory()
  }, [projectId, activeTab])

  const fetchPlan = async () => {
    try {
      setLoading(true)
      const data = await getLatestMitigationPlan(projectId)
      setPlan(data.mitigationPlan)
      setError(null)
    } catch (err) {
      if (err.response?.status === 404) {
        setPlan(null) 
      } else {
        setError(err.response?.data?.message || 'Failed to load mitigation plan')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const data = await getMitigationHistory(projectId)
      setHistoryPlans(data.mitigationPlans)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!isValidProjectId(projectId)) {
      navigate('/projects', { replace: true })
      return
    }

    try {
      setGenerating(true)
      setError(null)
      setSuccess(null)
      const data = await generateMitigationPlan(projectId)
      setPlan(data.mitigationPlan)
      setActiveTab('LATEST')
      setSuccess("AI Mitigation Plan generated successfully!")
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate mitigation plan')
    } finally {
      setGenerating(false)
    }
  }

  const handleUpdateRec = async (recId, newStatus, newActionNote) => {
    if (!plan) return
    setError(null)
    try {
      const data = await updateRecommendation(plan._id, recId, {
        status: newStatus,
        actionNote: newActionNote
      })
      setPlan(data.mitigationPlan)
      setSuccess("Task updated successfully.")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update recommendation')
    }
  }

  const handleDeleteRec = async (recId) => {
    if (!plan) return
    if (!window.confirm("Delete this specific recommendation permanently?")) return
    setError(null)
    try {
      const data = await deleteRecommendation(plan._id, recId)
      setPlan(data.mitigationPlan)
      setSuccess("Task deleted permanently.")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete recommendation')
    }
  }

  const handleDeletePlan = async () => {
    if (!plan) return
    if (!window.confirm("Are you sure you want to completely delete this AI plan and ALL its progress?")) return
    setError(null)
    try {
      await deleteMitigationPlan(plan._id)
      setPlan(null)
      setSuccess("Mitigation plan deleted successfully.")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete plan')
    }
  }

  if (loading && !plan && historyPlans.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
           <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           <span className="font-medium">Loading details...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Mitigation Planning" 
          description="Manage AI-driven disaster mitigation tasks and project resilience progress." 
        />
        <div className="flex gap-2">
          {!plan && activeTab === 'LATEST' && (
             <button onClick={handleGenerate} disabled={generating} className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2">
               {generating ? 'Generating AI Plan...' : 'Generate New Plan'}
             </button>
          )}
          {plan && activeTab === 'LATEST' && (
            <button onClick={handleDeletePlan} className="px-4 py-2.5 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 border border-red-200 transition-colors">
              Delete Plan
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('LATEST')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'LATEST'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Latest Action Plan
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'HISTORY'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Historical Archives
          </button>
        </nav>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center justify-between mb-2">
          <span className="font-medium">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 px-2 font-bold text-lg">&times;</button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center justify-between mb-2">
          <span className="font-medium">{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700 px-2 font-bold text-lg">&times;</button>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          {historyPlans.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 font-medium">No historical mitigation plans found.</p>
            </div>
          ) : (
            historyPlans.map((histPlan) => (
              <div key={histPlan._id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                   <p className="font-bold text-slate-900 text-lg">Plan Generated: {new Date(histPlan.createdAt).toLocaleDateString()}</p>
                   <p className="text-sm text-slate-500 mt-1 font-medium">Engine: <span className="text-slate-800">{histPlan.aiProvider}</span> | Priority: <span className="text-slate-800">{histPlan.priorityLevel}</span> | Tasks: <span className="text-slate-800">{histPlan.totalRecommendations}</span></p>
                </div>
                <div><StatusBadge label={histPlan.planStatus} variant={histPlan.planStatus === 'COMPLETED' ? 'success' : 'default'} /></div>
              </div>
            ))
          )}
        </div>
      )}

      {/* LATEST PLAN TAB */}
      {activeTab === 'LATEST' && !plan && !loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-16 text-center">
           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
             <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
             </svg>
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Mitigation Plan</h3>
           <p className="text-slate-500 mb-8 max-w-sm mx-auto">Generate one to receive highly specific, action-oriented recommendations based on your unique risk profile.</p>
           <button onClick={handleGenerate} disabled={generating} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors mx-auto flex items-center justify-center gap-2">
             {generating && (
               <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             )}
             {generating ? 'Processing Risk Data...' : 'Generate AI Plan Now'}
           </button>
        </div>
      )}

      {activeTab === 'LATEST' && plan && (
        <div className="space-y-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Status</p><StatusBadge label={plan.planStatus} variant={plan.planStatus === 'COMPLETED' ? 'success' : plan.planStatus === 'IN_PROGRESS' ? 'info' : 'warning'} /></div>
             <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Tasks</p><p className="text-3xl font-black text-slate-900">{plan.totalRecommendations}</p></div>
             <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Ongoing</p><p className="text-3xl font-black text-amber-600">{plan.ongoingCount}</p></div>
             <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Completed</p><p className="text-3xl font-black text-green-600">{plan.completedCount}</p></div>
           </div>

           <div className="space-y-5">
             <h3 className="text-lg font-bold text-slate-800">Actionable Recommendations</h3>
             {plan.recommendations.length === 0 ? (
                <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl text-slate-500 font-medium">All recommendations deleted from this plan.</div>
             ) : (
                plan.recommendations.map((rec, index) => (
                  <div key={rec._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">{index + 1}</span>
                          <h4 className="text-xl font-bold text-slate-900">{rec.title}</h4>
                          <StatusBadge label={rec.category} variant="default" />
                        </div>
                        <p className="text-slate-600 text-base leading-relaxed ml-11 max-w-3xl">{rec.details}</p>
                      </div>
                      
                      <div className="shrink-0 flex items-start gap-2 -mt-1">
                         <select 
                           value={rec.status}
                           onChange={(e) => handleUpdateRec(rec._id, e.target.value, rec.actionNote)}
                           className={`px-4 py-2.5 border rounded-xl outline-none font-bold text-sm shadow-sm cursor-pointer ${
                              rec.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-700' :
                              rec.status === 'ONGOING' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                              'bg-slate-50 border-slate-200 text-slate-700'
                           }`}
                         >
                           <option value="PENDING">PENDING</option>
                           <option value="ONGOING">ONGOING</option>
                           <option value="COMPLETED">COMPLETED</option>
                         </select>

                         <button 
                           onClick={() => handleDeleteRec(rec._id)} 
                           className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100" 
                           title="Delete Task"
                         >
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                    </div>

                    <div className="ml-11">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contractor Note / Progress Update</label>
                      <input 
                        type="text"
                        defaultValue={rec.actionNote}
                        placeholder="Add an action note (e.g., Materials ordered, site cleared...)"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                        onBlur={(e) => {
                          if (e.target.value !== rec.actionNote) handleUpdateRec(rec._id, undefined, e.target.value)
                        }}
                      />
                    </div>
                  </div>
                ))
             )}
           </div>
        </div>
      )}
    </div>
  )
}

export default MitigationPage