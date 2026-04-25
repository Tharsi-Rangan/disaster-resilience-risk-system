export default function AssessmentHistoryTable({
  history,
  onDelete,
  canDelete = false,
}) {
  const getTrend = (index) => {
    if (index === history.length - 1) return null;

    const current = Number(history[index]?.riskScore || 0);
    const previous = Number(history[index + 1]?.riskScore || 0);
    const diff = current - previous;

    if (diff > 0) {
      return {
        text: `Increased +${diff}`,
        className: "border-red-100 bg-red-50 text-red-700",
        symbol: "↑",
      };
    }

    if (diff < 0) {
      return {
        text: `Decreased ${Math.abs(diff)}`,
        className: "border-emerald-100 bg-emerald-50 text-emerald-700",
        symbol: "↓",
      };
    }

    return {
      text: "No change",
      className: "border-slate-100 bg-slate-50 text-slate-500",
      symbol: "–",
    };
  };

  const badgeClass = (level) => {
    if (level === "HIGH") return "bg-red-100 text-red-700";
    if (level === "MEDIUM") return "bg-amber-100 text-amber-700";
    if (level === "LOW") return "bg-emerald-100 text-emerald-700";
    return "bg-slate-100 text-slate-500";
  };

  const scoreColor = (level) => {
    if (level === "HIGH") return "text-red-600";
    if (level === "MEDIUM") return "text-amber-600";
    if (level === "LOW") return "text-emerald-600";
    return "text-slate-700";
  };

  const progressColor = (level) => {
    if (level === "HIGH") return "bg-red-500";
    if (level === "MEDIUM") return "bg-amber-500";
    if (level === "LOW") return "bg-emerald-500";
    return "bg-slate-300";
  };

  if (!history || history.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900">
          Assessment History
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          No assessment history found. Run an assessment to create records.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Assessment History
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Card-based timeline of previous risk assessment runs.
          </p>
        </div>

        <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
          {history.length} Records
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {history.map((item, index) => {
          const trend = getTrend(index);
          const level = item.riskLevel || "N/A";
          const score = Number(item.riskScore || 0);

          return (
            <div
              key={item._id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Assessment Run
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass(
                    level
                  )}`}
                >
                  {level}
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Risk Score
                </p>

                <div className="mt-2 flex items-end justify-between">
                  <p className={`text-5xl font-extrabold ${scoreColor(level)}`}>
                    {item.riskScore}
                  </p>

                  <p className="pb-1 text-xs font-bold text-slate-400">
                    / 100
                  </p>
                </div>

                <div className="mt-4 h-2.5 rounded-full bg-slate-100">
                  <div
                    className={`h-2.5 rounded-full ${progressColor(level)}`}
                    style={{ width: `${Math.min(score, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <MiniScore title="Weather" value={item.weatherScore} />
                <MiniScore title="Flood" value={item.floodScore} />
                <MiniScore title="Quake" value={item.earthquakeScore} />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                {trend ? (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${trend.className}`}
                  >
                    {trend.symbol} {trend.text}
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-400">
                    First record
                  </span>
                )}

                {canDelete && (
                  <button
                    onClick={() => {
                      const ok = window.confirm(
                        "Are you sure you want to delete this assessment?"
                      );
                      if (ok) onDelete(item._id);
                    }}
                    className="rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniScore({ title, value }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-lg font-extrabold text-slate-900">
        {value ?? 0}
      </p>
    </div>
  );
}