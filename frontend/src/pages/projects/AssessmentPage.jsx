import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import AssessmentCard from "../../components/assessments/AssessmentCard";
import AssessmentHistoryTable from "../../components/assessments/AssessmentHistoryTable";
import {
  runAssessment,
  getLatestAssessment,
  getAssessmentHistory,
  deleteAssessment,
} from "../../services/assessmentService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function AssessmentPage() {
  const { id: projectId } = useParams();

  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("scoring");
  const [showGraphs, setShowGraphs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const loadAssessments = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setMessage("");

      const [latestData, historyData] = await Promise.all([
        getLatestAssessment(projectId),
        getAssessmentHistory(projectId),
      ]);

      setLatest(latestData || null);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load assessments");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, [projectId]);

  const handleRunAssessment = async () => {
    try {
      setLoading(true);
      setMessage("");
      setShowGraphs(false);

      await runAssessment(projectId);

      setMessage("Assessment completed successfully");
      setMessageType("success");
      setActiveTab("scoring");

      await loadAssessments();

      setTimeout(() => {
        setShowGraphs(true);
      }, 400);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to run assessment");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assessmentId) => {
    const ok = window.confirm("Are you sure you want to delete this assessment?");
    if (!ok) return;

    try {
      setLoading(true);
      setMessage("");

      await deleteAssessment(assessmentId);

      setMessage("Assessment deleted successfully");
      setMessageType("success");

      await loadAssessments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete assessment");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!latest) {
      setMessage("No assessment available to download");
      setMessageType("error");
      return;
    }

    const doc = new jsPDF();
    const snapshot = latest.snapshotId;

    doc.setFontSize(18);
    doc.text("Disaster Resilience Risk Assessment Report", 14, 18);

    doc.setFontSize(10);
    doc.text(`Project ID: ${projectId}`, 14, 28);
    doc.text(`Generated At: ${new Date().toLocaleString()}`, 14, 34);

    autoTable(doc, {
      startY: 44,
      head: [["Metric", "Value"]],
      body: [
        ["Overall Risk Score", `${latest.riskScore}/100`],
        ["Risk Level", latest.riskLevel],
        ["Weather Score", latest.weatherScore ?? 0],
        ["Flood Score", latest.floodScore ?? 0],
        ["Earthquake Score", latest.earthquakeScore ?? 0],
        ["Flood Base Input", latest.floodBase ?? snapshot?.floodRiskIndex ?? "N/A"],
        [
          "Elevation Adjustment",
          latest.elevation != null
            ? `${latest.elevation} m`
            : snapshot?.elevation != null
            ? `${snapshot.elevation} m`
            : "N/A",
        ],
        [
          "Assessment Date",
          latest.createdAt ? new Date(latest.createdAt).toLocaleString() : "N/A",
        ],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [15, 23, 42] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [["Score Type", "Formula / Logic"]],
      body: [
        ["Weather Score", "weatherScore = calcWeatherScore(snapshot)"],
        ["Flood Score", "floodScore = adjustFloodByElevation(floodBase, elevation)"],
        ["Earthquake Score", "earthquakeScore = calcEarthquakeScore(snapshot)"],
        ["Final Score", "riskScore = calcRiskScore(weatherScore, floodScore, earthquakeScore)"],
        ["Risk Level", "riskLevel = levelFromScore(riskScore)"],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    if (history.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        head: [["Date", "Risk Score", "Risk Level", "Weather", "Flood", "Earthquake"]],
        body: history.slice(0, 10).map((item) => [
          item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A",
          item.riskScore ?? "-",
          item.riskLevel ?? "-",
          item.weatherScore ?? "-",
          item.floodScore ?? "-",
          item.earthquakeScore ?? "-",
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [51, 65, 85] },
      });
    }

    doc.setFontSize(9);
    doc.text("Generated by Component 3 - Risk Assessment & Scoring Engine", 14, 285);

    doc.save(`risk-assessment-${projectId}.pdf`);
  };

  const messageStyles =
    messageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : message.toLowerCase().includes("not found")
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className="space-y-7">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />

        <div className="p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">
                Component 3
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Risk Assessment & Scoring Engine
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Run backend simulations, calculate disaster risk scores, review
                scoring logic, and monitor assessment history.
              </p>

              <p className="mt-4 w-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
                Project ID: {projectId}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleDownloadPdf}
                disabled={!latest}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download PDF Report
              </button>

              <button
                onClick={handleRunAssessment}
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Processing..." : "Run Assessment Simulation"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`rounded-2xl border p-4 text-sm font-bold shadow-sm ${messageStyles}`}>
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <MiniStat title="Current Score" value={latest?.riskScore ?? "-"} tone="indigo" />
        <MiniStat title="Risk Level" value={latest?.riskLevel ?? "Pending"} tone="emerald" />
        <MiniStat title="Total Runs" value={history.length} tone="sky" />
        <MiniStat
          title="Last Updated"
          value={latest?.createdAt ? new Date(latest.createdAt).toLocaleDateString() : "-"}
          tone="amber"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-2 md:grid-cols-2">
          <button
            onClick={() => setActiveTab("scoring")}
            className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
              activeTab === "scoring"
                ? "bg-gradient-to-r from-slate-950 to-indigo-950 text-white shadow-md"
                : "bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            Scoring Dashboard
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
              activeTab === "history"
                ? "bg-gradient-to-r from-slate-950 to-indigo-950 text-white shadow-md"
                : "bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            Assessment History
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
          <p className="text-sm font-bold text-indigo-700">Loading assessment data...</p>
        </div>
      )}

      {activeTab === "scoring" && (
        <div className="space-y-7">
          <AssessmentCard latest={latest} />
          <AssessmentInputSummary latest={latest} />

          <VisualAnalysisToggle
            latest={latest}
            showGraphs={showGraphs}
            setShowGraphs={setShowGraphs}
          />

          {showGraphs && <AssessmentGraphs latest={latest} history={history} />}

          <LevelScale latest={latest} />
          <CalculationPanel latest={latest} />
        </div>
      )}

      {activeTab === "history" && (
        <AssessmentHistoryTable
          history={history}
          onDelete={handleDelete}
          canDelete={false}
        />
      )}
    </div>
  );
}

function MiniStat({ title, value, tone = "indigo" }) {
  const styles = {
    indigo: "from-indigo-50 to-white border-indigo-100 text-indigo-700",
    emerald: "from-emerald-50 to-white border-emerald-100 text-emerald-700",
    sky: "from-sky-50 to-white border-sky-100 text-sky-700",
    amber: "from-amber-50 to-white border-amber-100 text-amber-700",
  };

  return (
    <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${styles[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
        {title}
      </p>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </div>
  );
}

function VisualAnalysisToggle({ latest, showGraphs, setShowGraphs }) {
  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">
            Optional Analytics
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            Visual Assessment Analysis
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Open visual charts only when needed to keep the scoring dashboard clean.
          </p>
        </div>

        <button
          onClick={() => setShowGraphs((prev) => !prev)}
          disabled={!latest}
          className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showGraphs ? "Hide Visual Analysis" : "Show Visual Analysis"}
        </button>
      </div>
    </div>
  );
}

function AssessmentInputSummary({ latest }) {
  if (!latest) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-black text-slate-900">
          Assessment Input Summary
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Run an assessment to view the snapshot inputs used by the scoring engine.
        </p>
      </div>
    );
  }

  const snapshot = latest.snapshotId;

  const elevation =
    latest.elevation != null
      ? latest.elevation
      : snapshot?.elevation != null
      ? snapshot.elevation
      : null;

  const floodBase =
    latest.floodBase != null
      ? latest.floodBase
      : snapshot?.floodRiskIndex != null
      ? snapshot.floodRiskIndex
      : null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">
            Snapshot Inputs
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            Assessment Input Summary
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Shows only selected snapshot values used by the scoring engine.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-700">
          Component 2 Snapshot Input
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InputCard
          title="Flood Base Input"
          value={floodBase != null ? floodBase : "N/A"}
          note="Base flood risk value before assessment adjustment."
          tone="blue"
        />

        <InputCard
          title="Elevation Adjustment"
          value={elevation != null ? `${elevation} m` : "N/A"}
          note="Used to adjust flood risk according to project elevation."
          tone="emerald"
        />

        <InputCard
          title="Adjusted Flood Score"
          value={latest.floodScore ?? "N/A"}
          note="Final flood score after applying elevation adjustment."
          tone="indigo"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="text-sm font-black text-indigo-900">
          Assessment Formula Flow
        </p>

        <p className="mt-2 text-sm font-semibold text-indigo-800">
          RiskSnapshot → weatherScore + floodScore + earthquakeScore → weighted
          riskScore → LOW / MEDIUM / HIGH riskLevel
        </p>
      </div>
    </div>
  );
}

function InputCard({ title, value, note, tone }) {
  const styles = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    indigo: "border-indigo-100 bg-indigo-50 text-indigo-700",
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${styles[tone]}`}>
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-black">{value}</p>

      <p className="mt-3 text-sm font-semibold text-slate-500">{note}</p>
    </div>
  );
}

function AssessmentGraphs({ latest, history }) {
  if (!latest) return null;

  const scoreBarData = {
    labels: ["Weather", "Flood", "Earthquake"],
    datasets: [
      {
        label: "Risk Score",
        data: [
          latest.weatherScore || 0,
          latest.floodScore || 0,
          latest.earthquakeScore || 0,
        ],
        backgroundColor: [
          "rgba(14, 165, 233, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        borderRadius: 12,
      },
    ],
  };

  const trendHistory = [...history].reverse();

  const lineData = {
    labels: trendHistory.map((item, index) =>
      item.createdAt ? new Date(item.createdAt).toLocaleDateString() : `Run ${index + 1}`
    ),
    datasets: [
      {
        label: "Risk Score Trend",
        data: trendHistory.map((item) => item.riskScore || 0),
        borderColor: "rgba(79, 70, 229, 0.95)",
        backgroundColor: "rgba(79, 70, 229, 0.12)",
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartPanel
        title="Disaster Score Comparison"
        description="Compares calculated weather, flood, and earthquake scores."
      >
        <Bar data={scoreBarData} options={options} />
      </ChartPanel>

      <ChartPanel
        title="Risk Score Trend"
        description="Shows how the final assessment score changes across runs."
      >
        {history.length > 1 ? (
          <Line data={lineData} options={options} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-500">
            Run more assessments to generate trend graph.
          </div>
        )}
      </ChartPanel>
    </div>
  );
}

function ChartPanel({ title, description, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
      <div className="mt-6 h-80 rounded-2xl bg-slate-50 p-4">{children}</div>
    </div>
  );
}

function LevelScale({ latest }) {
  const score = latest?.riskScore ?? 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">
            Risk Level Classification
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            The final score is converted into LOW, MEDIUM, or HIGH.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
          levelFromScore()
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ScaleBox active={score < 40} title="LOW" range="0 - 39" color="emerald" />
        <ScaleBox active={score >= 40 && score < 70} title="MEDIUM" range="40 - 69" color="amber" />
        <ScaleBox active={score >= 70} title="HIGH" range="70 - 100" color="rose" />
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-600">
        Formula: riskLevel = levelFromScore(finalRiskScore)
      </div>
    </div>
  );
}

function ScaleBox({ active, title, range, color }) {
  const styles = {
    emerald: active
      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
      : "border-slate-200 bg-white text-slate-500",
    amber: active
      ? "border-amber-300 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-white text-slate-500",
    rose: active
      ? "border-rose-300 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-white text-slate-500",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[color]}`}>
      <p className="text-sm font-black uppercase tracking-widest">{title}</p>
      <p className="mt-3 text-3xl font-black">{range}</p>
      <p className="mt-2 text-xs font-bold">
        {active ? "Current classification" : "Classification range"}
      </p>
    </div>
  );
}

function CalculationPanel({ latest }) {
  if (!latest) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">
          Calculation Breakdown
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Run an assessment to view formula breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 text-center">
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1 text-xs font-black text-indigo-700">
          Assessment Calculation Pipeline
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormulaCard
          title="Weather Score"
          value={latest.weatherScore}
          formula="weatherScore = calcWeatherScore(snapshot)"
          note="Uses snapshot weather indicators only as scoring input."
        />

        <FormulaCard
          title="Flood Score"
          value={latest.floodScore}
          formula="floodScore = adjustFloodByElevation(floodBase, elevation)"
          note="Uses flood base input and elevation adjustment."
        />

        <FormulaCard
          title="Earthquake Score"
          value={latest.earthquakeScore}
          formula="earthquakeScore = calcEarthquakeScore(snapshot)"
          note="Uses seismic inputs from the selected snapshot."
        />
      </div>

      <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-indigo-700">
          Final Weighted Score
        </h3>

        <div className="mt-4 rounded-xl bg-white p-4 text-sm font-black text-slate-700 shadow-sm">
          riskScore = calcRiskScore(weatherScore, floodScore, earthquakeScore)
        </div>

        <p className="mt-5 text-5xl font-black text-indigo-900">
          {latest.riskScore}
        </p>

        <p className="mt-2 text-sm font-black text-indigo-700">
          Final level: {latest.riskLevel}
        </p>
      </div>
    </div>
  );
}

function FormulaCard({ title, value, formula, note }) {
  const score = Number(value || 0);

  const level =
    score >= 70 ? "High Impact" : score >= 40 ? "Caution" : "Safe";

  const style =
    score >= 70
      ? "border-red-200 bg-red-50 text-red-700"
      : score >= 40
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${style}`}>
      <div className="flex justify-between gap-3">
        <h3 className="font-black text-slate-900">{title}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black">
          {level}
        </span>
      </div>

      <p className="mt-4 text-4xl font-black">{score}</p>

      <div className="mt-4 h-2 rounded-full bg-white">
        <div
          className="h-2 rounded-full bg-current"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      <div className="mt-4 rounded-xl bg-white p-3 text-xs font-black text-slate-600 shadow-sm">
        {formula}
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-500">{note}</p>
    </div>
  );
}