import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const ScoreBar = ({ label, value, colorClass, barClass }) => {
  const safeValue = Math.min(Number(value) || 0, 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className={`font-extrabold ${colorClass}`}>{value ?? 0}</span>
      </div>

      <div className="h-2.5 rounded-full bg-slate-100">
        <div
          className={`h-2.5 rounded-full ${barClass}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
};

export default function AssessmentCard({ latest }) {
  if (!latest) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900">
          Awaiting Assessment
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Run a simulation to generate the latest risk score.
        </p>
      </div>
    );
  }

  const isHigh = latest.riskLevel === "HIGH";
  const isMed = latest.riskLevel === "MEDIUM";

  const levelStyle = isHigh
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : isMed
    ? "border-amber-200 bg-amber-50 text-amber-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

  const scoreColor = isHigh
    ? "text-rose-600"
    : isMed
    ? "text-amber-600"
    : "text-emerald-600";

  const Icon = isHigh ? AlertTriangle : isMed ? ShieldAlert : ShieldCheck;

  const dominantRisk = [
    { name: "Weather", value: latest.weatherScore || 0 },
    { name: "Flood", value: latest.floodScore || 0 },
    { name: "Earthquake", value: latest.earthquakeScore || 0 },
  ].sort((a, b) => b.value - a.value)[0];

  const chartData = {
    labels: ["Weather Risk", "Flood Risk", "Seismic Risk"],
    datasets: [
      {
        data: [
          latest.weatherScore || 0,
          latest.floodScore || 0,
          latest.earthquakeScore || 0,
        ],
        backgroundColor: [
          "rgba(14, 165, 233, 0.85)",
          "rgba(59, 130, 246, 0.85)",
          "rgba(245, 158, 11, 0.85)",
        ],
        borderColor: [
          "rgba(14, 165, 233, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(245, 158, 11, 1)",
        ],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
          font: {
            family: "Inter, sans-serif",
            size: 12,
            weight: "bold",
          },
          color: "#64748b",
        },
      },
    },
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Latest Assessment
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest calculated disaster risk result for this project.
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-widest shadow-sm ${levelStyle}`}
        >
          <Icon className="h-4 w-4" />
          {latest.riskLevel}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-slate-400">
              Overall Composite Score
            </p>

            <p className={`mt-3 text-7xl font-black ${scoreColor}`}>
              {latest.riskScore}
            </p>

            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              out of 100
            </p>
          </div>

          <div className="mt-8 space-y-5 rounded-2xl bg-white p-5 shadow-sm">
            <ScoreBar
              label="Weather"
              value={latest.weatherScore}
              colorClass="text-sky-600"
              barClass="bg-sky-500"
            />

            <ScoreBar
              label="Flood"
              value={latest.floodScore}
              colorClass="text-blue-600"
              barClass="bg-blue-500"
            />

            <ScoreBar
              label="Earthquake"
              value={latest.earthquakeScore}
              colorClass="text-amber-600"
              barClass="bg-amber-500"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="grid h-full gap-6 lg:grid-cols-[1fr_260px]">
            <div className="relative min-h-[300px] rounded-2xl bg-white p-4 shadow-sm">
              <Doughnut data={chartData} options={chartOptions} />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-10">
                <div className="text-center">
                  <span className="block text-4xl font-black text-slate-900">
                    {latest.riskScore}
                  </span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Total Score
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  Risk Insight
                </p>

                <h3 className="mt-3 text-xl font-extrabold text-slate-900">
                  {latest.riskLevel} Risk Project
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  This project is classified as{" "}
                  <b className="text-slate-900">{latest.riskLevel}</b> risk
                  with an overall score of{" "}
                  <b className="text-slate-900">{latest.riskScore}</b>.
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The highest contributing factor is{" "}
                  <b className="text-slate-900">{dominantRisk.name}</b> risk
                  with a score of{" "}
                  <b className="text-slate-900">{dominantRisk.value}</b>.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Assessment Status
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700">
                  Latest result available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}