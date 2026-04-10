import { useEffect, useState } from "react";
import AssessmentCard from "../../components/assessments/AssessmentCard";
import AssessmentHistoryTable from "../../components/assessments/AssessmentHistoryTable";
import {
  runAssessment,
  getLatestAssessment,
  getAssessmentHistory,
  deleteAssessment,
} from "../../services/assessmentService";

export default function AssessmentsPage() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // temporary testing project id
  const projectId = "65f000000000000000000001";

  const loadAssessments = async () => {
    try {
      setLoading(true);
      setMessage("");

      const latestData = await getLatestAssessment(projectId);
      const historyData = await getAssessmentHistory(projectId);

      setLatest(latestData);
      setHistory(historyData || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const handleRunAssessment = async () => {
    try {
      setLoading(true);
      setMessage("");

      await runAssessment(projectId);
      setMessage("Assessment completed successfully");
      await loadAssessments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to run assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setMessage("");

      await deleteAssessment(id);
      setMessage("Assessment deleted successfully");
      await loadAssessments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Risk Assessment & Scoring Engine
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Component 3 — Run and monitor infrastructure risk
            </p>
          </div>

          <button
            onClick={handleRunAssessment}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Run Assessment"}
          </button>
        </div>

        {message && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            {message}
          </div>
        )}

        <AssessmentCard latest={latest} />
        <AssessmentHistoryTable history={history} onDelete={handleDelete} />
      </div>
    </div>
  );
}