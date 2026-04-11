import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AssessmentCard from "../../components/assessments/AssessmentCard";
import AssessmentHistoryTable from "../../components/assessments/AssessmentHistoryTable";
import {
  runAssessment,
  getLatestAssessment,
  getAssessmentHistory,
  deleteAssessment,
} from "../../services/assessmentService";

export default function AssessmentPage() {
  const { id: projectId } = useParams();

  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
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
    if (projectId) {
      loadAssessments();
    }
  }, [projectId]);

  const handleRunAssessment = async () => {
    if (!projectId) {
      setMessage("Project ID not found");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const result = await runAssessment(projectId);

      if (result?.assessment) {
        setLatest(result.assessment);
      }

      setMessage("Assessment completed successfully");
      setMessageType("success");

      await loadAssessments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to run assessment");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assessmentId) => {
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

  if (!projectId) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm font-medium text-red-700">Project ID not found</p>
      </div>
    );
  }

  const messageStyles =
    messageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : messageType === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-slate-200 bg-white text-slate-600";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-8 shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 heading-font tracking-tight">
              Risk Assessment Engine
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Component 3 — Run simulations and monitor infrastructure risk scores.
            </p>
          </div>

          <button
            onClick={handleRunAssessment}
            disabled={loading}
            className="rounded-xl dark-pro-gradient px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/40 hover:-translate-y-0.5 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? "Processing..." : "Run Assessment Simulation"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-2xl border p-4 shadow-sm ${messageStyles}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {loading && !latest && history.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading assessment data...</p>
        </div>
      )}

      <AssessmentCard latest={latest} />

      <AssessmentHistoryTable history={history} onDelete={handleDelete} />
    </div>
  );
}
