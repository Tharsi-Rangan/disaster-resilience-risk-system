export default function AssessmentCard({ latest }) {
  if (!latest) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Latest Assessment</h2>
        <p className="mt-3 text-sm text-slate-500">No assessment available yet.</p>
      </div>
    );
  }

  const levelStyle =
    latest.riskLevel === "HIGH"
      ? "bg-red-100 text-red-700"
      : latest.riskLevel === "MEDIUM"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Latest Assessment</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${levelStyle}`}>
          {latest.riskLevel}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-slate-500">Overall Risk Score</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{latest.riskScore}</p>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <p>Weather Score: {latest.weatherScore}</p>
          <p>Flood Score: {latest.floodScore}</p>
          <p>Earthquake Score: {latest.earthquakeScore}</p>
        </div>
      </div>
    </div>
  );
}
