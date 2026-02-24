import { Link } from "react-router-dom";

export default function DashboardHome() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            Infrastructure Risk Assessor for contractors.
          </p>
        </div>

        <Link
          to="/assessments"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          Go to Assessments
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-4">
          <p className="text-xs font-medium text-slate-500">Status</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Frontend running ✅
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Next: connect to backend endpoints.
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-xs font-medium text-slate-500">Component 3</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Risk Assessment & Scoring
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Chart.js visuals + history tracking.
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-xs font-medium text-slate-500">Tip</p>
          <p className="mt-2 text-sm text-slate-600">
            Keep commits small and frequent to show GitHub history clearly.
          </p>
        </div>
      </div>
    </div>
  );
}