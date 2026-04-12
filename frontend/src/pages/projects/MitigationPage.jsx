import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import confetti from 'canvas-confetti'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  getLatestMitigationPlan, 
  generateMitigationPlan, 
  updateRecommendation,
  deleteRecommendation,
  deleteMitigationPlan,
  getMitigationHistory,
  chatWithAiAssistant
} from '../../services/mitigationService'
import useAuth from '../../hooks/useAuth'

const isValidProjectId = (projectId) => /^[a-f\d]{24}$/i.test(String(projectId || ''))

function MitigationPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const navigate = useNavigate()
  const { id: projectId } = useParams()
  const [activeTab, setActiveTab] = useState('LATEST') // 'LATEST' | 'HISTORY'
  
  const [plan, setPlan] = useState(null)
  const [historyPlans, setHistoryPlans] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // AI Chat Drawer State
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false)
  const [chatContext, setChatContext] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Kanban Drag State
  const [draggedRecId, setDraggedRecId] = useState(null)

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

  const handleGenerate = async (isRegeneration = false) => {
    if (!isValidProjectId(projectId)) {
      navigate('/projects', { replace: true })
      return
    }

    let customFocus = null;
    if (isRegeneration) {
      customFocus = window.prompt("What specific area should the new AI plan focus on? (e.g. 'Focus on budget-friendly ideas' or 'Focus on immediate weather threats')");
      if (customFocus === null) return; 
    }

    try {
      setGenerating(true)
      setError(null)
      setSuccess(null)
      const data = await generateMitigationPlan(projectId, customFocus ? { customFocus } : {})
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
      
      // Feature 1: Gamified Gamification
      if (newStatus === 'COMPLETED') {
        const rec = plan.recommendations.find(r => r._id === recId)
        if (rec && rec.status !== 'COMPLETED') {
           confetti({
             particleCount: 150,
             spread: 70,
             origin: { y: 0.6 },
             colors: ['#10B981', '#3B82F6', '#F59E0B', '#F472B6']
           });
        }
      }

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
      if (activeTab === 'VIEW_HISTORICAL_PLAN') {
        setActiveTab('HISTORY')
      }
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete plan')
    }
  }

  // Feature: Boardroom PDF Export
  const exportToPDF = () => {
    if (!plan) return;
    const doc = new jsPDF()
    
    // Branding & Header
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.setTextColor(15, 23, 42) // slate-900
    doc.text("Disaster Mitigation Executive Report", 14, 22)
    
    // Sub-metadata
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(71, 85, 105) // slate-500
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32)
    doc.text(`AI Risk Engine: ${plan.aiProvider || 'N/A'}`, 14, 38)
    
    doc.setFont("helvetica", "bold")
    doc.text(`Overall Status:`, 14, 44)
    doc.setFont("helvetica", "normal")
    doc.text(`${plan.planStatus} | Priority: ${plan.priorityLevel}`, 45, 44)
    
    doc.setFont("helvetica", "bold")
    doc.text(`Task Progression:`, 14, 50)
    doc.setFont("helvetica", "normal")
    doc.text(`${plan.completedCount} Completed / ${plan.ongoingCount} Ongoing / ${plan.recommendations.length - plan.completedCount - plan.ongoingCount} Pending`, 49, 50)
    
    // AutoTable for Tasks
    const tableColumn = ["Task", "Category", "Status", "Contractor Note"]
    const tableRows = []

    plan.recommendations.forEach(rec => {
      const recData = [
        rec.title,
        rec.category,
        rec.status,
        rec.actionNote || "No current updates."
      ]
      tableRows.push(recData)
    })

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 58,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5, textColor: [51, 65, 85] },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    })

    doc.save(`Mitigation_Plan_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Feature 2: Native HTML5 Drag & Drop
  const handleDragStart = (e, recId) => {
    setDraggedRecId(recId)
    e.dataTransfer.setData('recId', recId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetStatus) => {
    e.preventDefault()
    const recId = e.dataTransfer.getData('recId')
    setDraggedRecId(null)
    if (!recId) return
    
    const rec = plan.recommendations.find(r => r._id === recId)
    if (rec && rec.status !== targetStatus) {
      handleUpdateRec(rec._id, targetStatus, rec.actionNote)
    }
  }

  // Feature 3: AI Co-Pilot Logic
  const openAIChat = (rec) => {
    setChatContext(rec)
    setChatMessages([
      { role: 'ai', text: `Hi! I'm your AI Mitigation Advisor. You're currently viewing the task: "${rec.title}". How can I assist you with completing or planning this task?` }
    ])
    setChatDrawerOpen(true)
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !chatContext) return
    const msg = chatInput
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: msg }])
    setChatLoading(true)
    
    try {
      const data = await chatWithAiAssistant(msg, chatContext.title, chatContext.details)
      setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }])
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Error: Connection to AI core lost. Please check your network and try again.' }])
    } finally {
      setChatLoading(false)
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
    <div className="space-y-6 relative overflow-hidden min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Mitigation Planning" 
          description="Manage AI-driven disaster mitigation tasks with Drag & Drop Kanban workflow." 
        />
        <div className="flex gap-2">
           {!plan && activeTab === 'LATEST' && (
              <button onClick={() => handleGenerate(false)} disabled={generating} className="px-6 py-3 dark-pro-gradient text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2">
                {generating ? 'Generating AI Plan...' : 'Generate AI Action Plan'}
              </button>
           )}
           {plan && (activeTab === 'LATEST' || activeTab === 'VIEW_HISTORICAL_PLAN') && (
              <>
                <button onClick={exportToPDF} className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Export PDF
                </button>
                <button onClick={() => handleGenerate(true)} disabled={generating} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2">
                  {generating ? 'Processing...' : 'Re-Generate'}
                </button>
              </>
           )}
           {plan && (activeTab === 'LATEST' || activeTab === 'VIEW_HISTORICAL_PLAN') && isAdmin && (
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
              activeTab === 'HISTORY' || activeTab === 'VIEW_HISTORICAL_PLAN'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Historical Archives
          </button>
        </nav>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center justify-between mb-2 shadow-sm animate-pulse">
          <span className="font-medium">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 px-2 font-bold text-lg">&times;</button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center justify-between mb-2 shadow-sm">
          <span className="font-medium">{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700 px-2 font-bold text-lg">&times;</button>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          {historyPlans.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-medium">No historical mitigation plans found.</p>
            </div>
          ) : (
            historyPlans.map((histPlan) => (
              <div key={histPlan._id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-blue-300 transition-colors">
                <div>
                  <p className="font-bold text-slate-900 text-lg">Plan Generated: {new Date(histPlan.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Engine: <span className="text-slate-800">{histPlan.aiProvider}</span> | Priority: <span className="text-slate-800">{histPlan.priorityLevel}</span> | Tasks: <span className="text-slate-800">{histPlan.totalRecommendations}</span></p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <StatusBadge label={histPlan.planStatus} variant={histPlan.planStatus === 'COMPLETED' ? 'success' : 'default'} />
                  <button 
                    onClick={() => { setPlan(histPlan); setActiveTab('VIEW_HISTORICAL_PLAN'); }}
                    className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 font-bold text-sm shadow-sm transition-colors w-full sm:w-auto text-center"
                  >
                    View Board
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* NO ACTIVE PLAN VIEW */}
      {activeTab === 'LATEST' && !plan && !loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-16 text-center">
           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
             <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
             </svg>
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Mitigation Plan</h3>
           <p className="text-slate-500 mb-8 max-w-sm mx-auto">Generate one to receive highly specific, action-oriented recommendations based on your unique risk profile.</p>
           <button onClick={() => handleGenerate(false)} disabled={generating} className="px-8 py-3.5 dark-pro-gradient shadow-lg shadow-slate-900/20 text-white font-bold rounded-xl hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 transition-all mx-auto flex items-center justify-center gap-2">
             {generating ? 'Processing Risk Intelligence...' : 'Generate Advanced AI Plan Now'}
           </button>
        </div>
      )}

      {/* PLAN VIEW (KANBAN BOARD) */}
      {(activeTab === 'LATEST' || activeTab === 'VIEW_HISTORICAL_PLAN') && plan && (
        <div className="space-y-6">
           {activeTab === 'VIEW_HISTORICAL_PLAN' && (
             <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                 <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 <span className="font-medium">You are viewing an older plan from the Historical Archives. Updates here will modify this specific historical record.</span>
               </div>
               <button onClick={() => setActiveTab('HISTORY')} className="shrink-0 text-sm font-bold text-amber-700 hover:text-amber-900 underline">Back to Archives</button>
             </div>
           )}

           {/* Metrics Component */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-6 bg-white/90 glass-panel rounded-2xl border border-slate-200/80 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Overall Status</p><StatusBadge label={plan.planStatus} variant={plan.planStatus === 'COMPLETED' ? 'success' : plan.planStatus === 'IN_PROGRESS' ? 'info' : 'warning'} /></div>
             <div className="p-6 bg-white/90 glass-panel rounded-2xl border border-slate-200/80 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total Tasks</p><p className="text-4xl font-extrabold text-slate-900 heading-font">{plan.totalRecommendations}</p></div>
             <div className="p-6 bg-white/90 glass-panel rounded-2xl border border-slate-200/80 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Ongoing Tasks</p><p className="text-4xl font-extrabold text-slate-600 heading-font">{plan.ongoingCount}</p></div>
             <div className="p-6 bg-white/90 glass-panel rounded-2xl border border-slate-200/80 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Completed</p><p className="text-4xl font-extrabold text-emerald-500 heading-font">{plan.completedCount}</p></div>
           </div>

           {/* Kanban Board Container */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {[
                { id: 'PENDING', title: 'Pending Pipeline', border: 'border-slate-200', bg: 'bg-slate-100/50', text: 'text-slate-700', badge: 'bg-slate-200 text-slate-700' },
                { id: 'ONGOING', title: 'Active Progress', border: 'border-blue-200', bg: 'bg-blue-50/50', text: 'text-blue-800', badge: 'bg-blue-200 text-blue-800' },
                { id: 'COMPLETED', title: 'Finished Work', border: 'border-green-200', bg: 'bg-green-50/50', text: 'text-green-800', badge: 'bg-green-200 text-green-800' }
              ].map(column => (
                <div 
                  key={column.id} 
                  className={`flex flex-col rounded-3xl border-2 border-dashed ${column.border} ${column.bg} p-4 min-h-[500px] transition-colors`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className={`text-sm font-extrabold tracking-widest uppercase ${column.text}`}>{column.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${column.badge}`}>
                      {plan.recommendations.filter(r => r.status === column.id).length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4">
                    {plan.recommendations.filter(r => r.status === column.id).map((rec) => (
                      <div 
                        key={rec._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, rec._id)}
                        onDragEnd={() => setDraggedRecId(null)}
                        className={`bg-white rounded-2xl p-5 border ${draggedRecId === rec._id ? 'border-blue-400 shadow-xl opacity-50 scale-95' : 'border-slate-200 shadow-sm hover:shadow-md'} transition-all cursor-grab active:cursor-grabbing group relative`}
                      >
                         <div className="flex justify-between items-start mb-2 gap-2">
                            <h4 className="font-bold text-slate-900 leading-tight">{rec.title}</h4>
                            <button onClick={() => openAIChat(rec)} className="shrink-0 p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors" title="Ask AI Co-Pilot">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </button>
                         </div>
                         <p className="text-xs text-slate-500 mb-4 line-clamp-3">{rec.details}</p>
                         
                         <div className="border-t border-slate-100 pt-3">
                            <input 
                              type="text"
                              defaultValue={rec.actionNote}
                              placeholder="Add progress note..."
                              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              onBlur={(e) => {
                                if (e.target.value !== rec.actionNote) handleUpdateRec(rec._id, rec.status, e.target.value)
                              }}
                            />
                            {rec.updatedBy && rec.updatedAt && (
                              <div className="mt-2 text-[10px] font-medium text-slate-400">
                                Last: <span className="text-slate-600">{rec.updatedBy.role === 'ADMIN' ? 'Admin' : 'Contractor'} {rec.updatedBy.name ? `(${rec.updatedBy.name})` : ''}</span>
                              </div>
                            )}
                         </div>

                         <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleDeleteRec(rec._id)} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-600 hover:text-white shadow-sm" title="Delete Task">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                         </div>
                      </div>
                    ))}
                    
                    {plan.recommendations.filter(r => r.status === column.id).length === 0 && (
                      <div className="h-full flex items-center justify-center p-8 text-center text-slate-400 text-sm font-medium border-2 border-dashed border-transparent rounded-2xl">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Feature 3: Sliding AI Co-Pilot Drawer Overlay */}
      {chatDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
             onClick={() => setChatDrawerOpen(false)}
          ></div>
          
          {/* Drawer content */}
          <div className="relative w-full max-w-md h-full bg-slate-900 flex flex-col shadow-2xl animate-slide-in shadow-black/50 border-l border-slate-700">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
               <div className="flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl dark-pro-gradient border border-blue-400/30 text-white shadow-lg">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <div>
                   <h3 className="text-white font-bold leading-tight">AI Risk Co-Pilot</h3>
                   <p className="text-blue-400 text-xs font-medium">Gemini Advisor Online</p>
                 </div>
               </div>
               <button onClick={() => setChatDrawerOpen(false)} className="text-slate-400 hover:text-white p-2">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-sm">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-2 items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-slate-800/80 border-t border-white/10">
               <form 
                 onSubmit={(e) => { e.preventDefault(); sendChatMessage() }} 
                 className="flex gap-2"
               >
                 <input 
                   type="text" 
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   placeholder="Ask about materials, budget, timeline..."
                   className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                 />
                 <button 
                   type="submit" 
                   disabled={chatLoading || !chatInput.trim()}
                   className="px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                 >
                   Send
                 </button>
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MitigationPage
