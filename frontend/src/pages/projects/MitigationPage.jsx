import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { getLatestMitigationPlan, generateMitigationPlan, updateRecommendation } from '../../services/mitigationService'

function MitigationPage() {
  const { id: projectId } = useParams()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPlan()
  }, [projectId])

  const fetchPlan = async () => {
    try {
      setLoading(true)
      const data = await getLatestMitigationPlan(projectId)
      setPlan(data.mitigationPlan)
      setError(null)
    } catch (err) {
      if (err.response?.status === 404) {
        setPlan(null) // Empty state
      } else {
        setError(err.response?.data?.message || 'Failed to load mitigation plan')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      setError(null)
      const data = await generateMitigationPlan(projectId)
      setPlan(data.mitigationPlan)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate mitigation plan')
    } finally {
      setGenerating(false)
    }
  }

  const handleUpdateRec = async (recId, newStatus, newActionNote) => {
    try {
      const data = await updateRecommendation(plan._id, recId, {
        status: newStatus,
        actionNote: newActionNote
      })
      setPlan(data.mitigationPlan)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update recommendation')
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
          <span className="font-medium">Loading mitigation plan...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Mitigation Planning" 
          description="Generate AI-driven disaster mitigation tasks and track your project's resilience progress." 
        />
        {!plan && (
           <button 
             onClick={handleGenerate} 
             disabled={generating}
             className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
           >
             {generating && (
               <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             )}
             {generating ? 'Generating AI Plan...' : 'Generate AI Plan'}
           </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <span className="font-medium">{error}</span>
        </div>
      )}

      {!plan ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-16 text-center">
           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
             <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
             </svg>
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">No Mitigation Plan Found</h3>
           <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">This project doesn't have an active mitigation plan yet. Generate one to receive highly specific, action-oriented recommendations based on your risk data.</p>
           <button 
             onClick={handleGenerate} 
             disabled={generating}
             className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors flex items-center gap-2 mx-auto"
           >
             {generating && (
               <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             )}
             {generating ? 'Processing Risk Data...' : 'Generate Plan Now'}
           </button>
        </div>
      ) : (
        <div className="space-y-6">
           {/* Plan Summary Cards */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Plan Status</p>
                <StatusBadge label={plan.planStatus} variant={plan.planStatus === 'COMPLETED' ? 'success' : plan.planStatus === 'IN_PROGRESS' ? 'info' : 'warning'} />
             </div>
             <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Tasks</p>
                <p className="text-3xl font-black text-slate-900">{plan.totalRecommendations}</p>
             </div>
             <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Ongoing</p>
                <p className="text-3xl font-black text-amber-600">{plan.ongoingCount}</p>
             </div>
             <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Completed</p>
                <p className="text-3xl font-black text-green-600">{plan.completedCount}</p>
             </div>
           </div>

           {/* Recommendations List */}
           <div className="space-y-5">
             <h3 className="text-lg font-bold text-slate-800">Actionable Recommendations</h3>
             {plan.recommendations.map((rec, index) => (
                <div key={rec._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                          {index + 1}
                        </span>
                        <h4 className="text-xl font-bold text-slate-900">{rec.title}</h4>
                        <StatusBadge label={rec.category} variant="default" />
                      </div>
                      <p className="text-slate-600 text-base leading-relaxed max-w-3xl ml-11">{rec.details}</p>
                    </div>
                    
                    <div className="shrink-0 flex items-start -mt-1">
                       <select 
                         value={rec.status}
                         onChange={(e) => handleUpdateRec(rec._id, e.target.value, rec.actionNote)}
                         className={`px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold shadow-sm cursor-pointer ${
                            rec.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-700' :
                            rec.status === 'ONGOING' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                            'bg-slate-50 border-slate-200 text-slate-700'
                         }`}
                       >
                         <option value="PENDING">PENDING</option>
                         <option value="ONGOING">ONGOING</option>
                         <option value="COMPLETED">COMPLETED</option>
                       </select>
                    </div>
                  </div>

                  {/* Action Note Area */}
                  <div className="ml-11">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contractor Note / Progress Update</label>
                    <input 
                      type="text"
                      defaultValue={rec.actionNote}
                      placeholder="Add an action note (e.g., Materials ordered, site cleared...)"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                      onBlur={(e) => {
                        if(e.target.value !== rec.actionNote) {
                          handleUpdateRec(rec._id, undefined, e.target.value)
                        }
                      }}
                    />
                    <p className="text-xs text-slate-400 mt-2 font-medium">Auto-saves when you click outside the text box.</p>
                  </div>
                </div>
             ))}
           </div>
        </div>
      )}
    </div>
  )
}

export default MitigationPage