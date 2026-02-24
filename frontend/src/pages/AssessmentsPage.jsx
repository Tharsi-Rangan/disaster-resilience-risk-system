import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";

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
  updateAssessment,
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

// Demo project id (use any valid ObjectId)
const DEMO_PROJECT_ID = "65f000000000000000000001";

const clamp = (n) => Math.max(0, Math.min(100, Number(n || 0)));

export default function AssessmentsPage() {
  const [loading, setLoading] = useState(false);

  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);

  // create form
  const [scores, setScores] = useState({
    weatherScore: 60,
    floodScore: 75,
    earthquakeScore: 25,
  });

  // search
  const [query, setQuery] = useState("");

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    weatherScore: 0,
    floodScore: 0,
    earthquakeScore: 0,
  });

  const levelBadge = (level) => {
    if (level === "HIGH") return "bg-red-50 text-red-700 border-red-200";
    if (level === "MEDIUM") return "bg-amber-50 text-amber-700 border-amber-200";
    if (level === "LOW") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

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
      toast.error("Cannot load assessments. Check backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;

    return history.filter((x) => {
      const date = new Date(x.createdAt).toLocaleString().toLowerCase();
      const level = String(x.riskLevel || "").toLowerCase();
      const score = String(x.riskScore ?? "");
      return date.includes(q) || level.includes(q) || score.includes(q);
    });
  }, [history, query]);

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

  // CREATE
  const onRun = async () => {
    const payload = {
      weatherScore: clamp(scores.weatherScore),
      floodScore: clamp(scores.floodScore),
      earthquakeScore: clamp(scores.earthquakeScore),
    };

    setLoading(true);
    try {
      const created = await runAssessment(DEMO_PROJECT_ID, payload);
      toast.success(`Created: ${created.riskLevel} (${created.riskScore})`);
      await fetchData();
    } catch (err) {
      toast.error("Run failed. Check /api/assessments/run/:projectId");
    } finally {
      setLoading(false);
    }
  };

  // OPEN EDIT
  const openEdit = (x) => {
    setEditItem(x);
    setEditForm({
      weatherScore: x.weatherScore ?? 0,
      floodScore: x.floodScore ?? 0,
      earthquakeScore: x.earthquakeScore ?? 0,
    });
    setEditOpen(true);
  };

  // UPDATE
  const saveEdit = async () => {
    if (!editItem?._id) return;

    const payload = {
      weatherScore: clamp(editForm.weatherScore),
      floodScore: clamp(editForm.floodScore),
      earthquakeScore: clamp(editForm.earthquakeScore),
    };

    setLoading(true);
    try {
      const updated = await updateAssessment(editItem._id, payload);
      toast.success(`Updated: ${updated.riskLevel} (${updated.riskScore})`);
      setEditOpen(false);
      await fetchData();
      if (latest?._id === updated._id) setLatest(updated);
    } catch (err) {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const confirmDelete = async (id) => {
    const ok = window.confirm("Delete this assessment?");
    if (!ok) return;

    setLoading(true);
    try {
      await deleteAssessment(id);
      toast.success("Deleted");
      await fetchData();
    } catch (err) {
      toast.error("Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Risk Assessment & Scoring Engine (CRUD)
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Project: <span className="font-mono">{DEMO_PROJECT_ID}</span>
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
            Run Assessment (Create)
          </button>
        </div>
      </div>

      {/* top cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border p-4">
          <p className="text-xs font-medium text-slate-500">Latest Risk</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900">
              {latest?.riskScore ?? "-"}
            </span>
            <span className={`rounded-full border px-3 py-1 text-sm ${levelBadge(latest?.riskLevel)}`}>
              {latest?.riskLevel ?? "N/A"}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            LOW &lt; 40, MEDIUM 40–69, HIGH ≥ 70
          </p>
        </div>

        <div className="rounded-2xl border p-4 lg:col-span-2">
          <p className="text-sm font-medium text-slate-700">Factor Breakdown (Chart.js)</p>
          <div className="mt-3 h-64">
            <Doughnut data={doughnutData} />
          </div>
        </div>

        {/* history + CRUD table */}
        <div className="rounded-2xl border p-4 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">History (Read)</p>

            <div className="w-full max-w-sm">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by score, level, date..."
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-3 h-72">
            <Line data={lineData} />
          </div>

          {/* Create input controls */}
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["weatherScore", "floodScore", "earthquakeScore"].map((k) => (
              <div key={k} className="rounded-xl border p-3">
                <label className="text-xs font-medium text-slate-500">{k}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores[k]}
                  onChange={(e) => setScores((s) => ({ ...s, [k]: Number(e.target.value) }))}
                  className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Level</th>
                  <th className="py-2">Weather</th>
                  <th className="py-2">Flood</th>
                  <th className="py-2">Quake</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((x) => (
                  <tr key={x._id} className="border-t">
                    <td className="py-2">{new Date(x.createdAt).toLocaleString()}</td>
                    <td className="py-2 font-medium">{x.riskScore}</td>
                    <td className="py-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${levelBadge(x.riskLevel)}`}>
                        {x.riskLevel}
                      </span>
                    </td>
                    <td className="py-2">{x.weatherScore}</td>
                    <td className="py-2">{x.floodScore}</td>
                    <td className="py-2">{x.earthquakeScore}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(x)}
                          className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-50"
                        >
                          Edit (Update)
                        </button>
                        <button
                          onClick={() => confirmDelete(x._id)}
                          className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr className="border-t">
                    <td className="py-3 text-slate-500" colSpan={7}>
                      No records found. Click “Run Assessment”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {loading && (
            <p className="mt-3 text-sm text-slate-500">Loading…</p>
          )}
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} title="Edit Assessment (Update)" onClose={() => setEditOpen(false)}>
        <div className="grid gap-3 md:grid-cols-3">
          {["weatherScore", "floodScore", "earthquakeScore"].map((k) => (
            <div key={k}>
              <label className="text-xs font-medium text-slate-500">{k}</label>
              <input
                type="number"
                min="0"
                max="100"
                value={editForm[k]}
                onChange={(e) => setEditForm((s) => ({ ...s, [k]: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setEditOpen(false)}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}