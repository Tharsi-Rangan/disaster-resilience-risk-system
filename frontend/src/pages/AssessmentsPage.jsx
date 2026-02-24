import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import {
  runAssessment,
  getLatestAssessment,
  getAssessmentHistory,
  deleteAssessment,
} from "../services/assessments";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

// Use a valid ObjectId for demo
const DEMO_PROJECT_ID = "65f000000000000000000001";

export default function AssessmentsPage() {
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [scores, setScores] = useState({
    weatherScore: 60,
    floodScore: 75,
    earthquakeScore: 25,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [l, h] = await Promise.all([
        getLatestAssessment(DEMO_PROJECT_ID),
        getAssessmentHistory(DEMO_PROJECT_ID),
      ]);
      setLatest(l);
      setHistory(Array.isArray(h) ? h : []);
    } catch (err) {
      toast.error("Cannot load data. Check backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const levelBadge = (level) => {
    if (level === "HIGH") return "bg-red-50 text-red-700 border-red-200";
    if (level === "MEDIUM") return "bg-amber-50 text-amber-700 border-amber-200";
    if (level === "LOW") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const doughnutData = useMemo(() => {
    const w = latest?.weatherScore ?? scores.weatherScore;
    const f = latest?.floodScore ?? scores.floodScore;
    const e = latest?.earthquakeScore ?? scores.earthquakeScore;

    return {
      labels: ["Weather", "Flood", "Earthquake"],
      datasets: [{ label: "Risk Factors", data: [w, f, e] }],
    };
  }, [latest, scores]);

  const lineData = useMemo(() => {
    const sorted = [...history].reverse(); // oldest -> newest
    return {
      labels: sorted.map((x) => new Date(x.createdAt).toLocaleString()),
      datasets: [{ label: "Risk Score", data: sorted.map((x) => x.riskScore) }],
    };
  }, [history]);

  const onRun = async () => {
    setLoading(true);
    try {
      const created = await runAssessment(DEMO_PROJECT_ID, scores);
      toast.success(`Assessment created: ${created.riskLevel} (${created.riskScore})`);
      await fetchData();
    } catch (err) {
      toast.error("Run failed. Check /api/assessments/run/:projectId endpoint.");
      setLoading(false);
    }
  };

  const onDeleteLatest = async () => {
    if (!latest?._id) return;
    setLoading(true);
    try {
      await deleteAssessment(latest._id);
      toast.success("Latest assessment deleted");
      await fetchData();
    } catch (err) {
      toast.error("Delete failed. Check backend endpoint.");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Risk Assessment & Scoring Engine
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Component 3 — Demo Project ID:{" "}
            <span className="font-mono">{DEMO_PROJECT_ID}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={onRun}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Run Risk Assessment
          </button>
          <button
            onClick={onDeleteLatest}
            disabled={loading || !latest?._id}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Delete Latest
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border p-4">
          <p className="text-xs font-medium text-slate-500">Latest Risk</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900">
              {latest?.riskScore ?? "-"}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-sm ${levelBadge(
                latest?.riskLevel
              )}`}
            >
              {latest?.riskLevel ?? "N/A"}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            LOW &lt; 40, MEDIUM 40–69, HIGH ≥ 70
          </p>
        </div>

        <div className="rounded-2xl border p-4 lg:col-span-2">
          <p className="text-sm font-medium text-slate-700">Factor Breakdown</p>
          <div className="mt-3 h-64">
            <Doughnut data={doughnutData} />
          </div>
        </div>

        <div className="rounded-2xl border p-4 lg:col-span-3">
          <p className="text-sm font-medium text-slate-700">Risk Score History</p>
          <div className="mt-3 h-72">
            <Line data={lineData} />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Level</th>
                  <th className="py-2">Weather</th>
                  <th className="py-2">Flood</th>
                  <th className="py-2">Earthquake</th>
                </tr>
              </thead>
              <tbody>
                {history.map((x) => (
                  <tr key={x._id} className="border-t">
                    <td className="py-2">{new Date(x.createdAt).toLocaleString()}</td>
                    <td className="py-2">{x.riskScore}</td>
                    <td className="py-2">{x.riskLevel}</td>
                    <td className="py-2">{x.weatherScore}</td>
                    <td className="py-2">{x.floodScore}</td>
                    <td className="py-2">{x.earthquakeScore}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr className="border-t">
                    <td className="py-3 text-slate-500" colSpan={6}>
                      No history yet. Click “Run Risk Assessment”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["weatherScore", "floodScore", "earthquakeScore"].map((k) => (
              <div key={k} className="rounded-xl border p-3">
                <label className="text-xs font-medium text-slate-500">{k}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores[k]}
                  onChange={(e) =>
                    setScores((s) => ({ ...s, [k]: Number(e.target.value) }))
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}