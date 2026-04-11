import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react'

function PageContextCard({ projectId }) {
  return (
    <div className="mb-6 rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-50 to-blue-50 p-6 shadow-sm">
      <div className="flex gap-4">
      <div className="shrink-0">
          <BookOpen className="h-6 w-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-2">About This Page</h3>
          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            This page helps you monitor real-time environmental and seismic data collected for this project.
            Use the information below to understand current weather conditions and earthquake activity that
            may affect your project's safety and resilience.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-white/60 border border-indigo-100 p-3">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">Project Reference</p>
                  <p className="text-slate-600 font-mono">{projectId}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white/60 border border-indigo-100 p-3">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">Purpose</p>
                  <p className="text-slate-600">Assess environmental hazards</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white/60 border border-indigo-100 p-3">
              <div className="flex items-start gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">Next Step</p>
                  <p className="text-slate-600">Use data for risk assessment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageContextCard
