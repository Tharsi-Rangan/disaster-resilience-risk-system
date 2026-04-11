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

  const loadAssessments = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setMessage("");

      const latestData = await getLatestAssessment(projectId);
      const historyData = await getAssessmentHistory(projectId);

      setLatest(latestData || null);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load assessments");
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
      await loadAssessments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to run assessment");
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
      await loadAssessments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete assessment");
    } finally {
      setLoading(false);
    }
  };

  if (!projectId) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">Project ID not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Run Assessment"}
          </button>
        </div>
      </div>

      {message && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      )}

      <div className="mt-6">
        <AssessmentCard latest={latest} />
      </div>

      <div className="mt-6">
        <AssessmentHistoryTable history={history} onDelete={handleDelete} />
      </div>
    </div>
  );
}