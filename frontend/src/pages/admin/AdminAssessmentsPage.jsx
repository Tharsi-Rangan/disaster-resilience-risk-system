import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { projectService } from "../../services/projectService";
import {
  getLatestAssessment,
  deleteAssessment,
} from "../../services/assessmentService";

function AdminAssessmentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const loadAdminAssessments = async () => {
    try {
      setLoading(true);
      setMessage("");

      const projectResponse = await projectService.getProjects();

      const projects = Array.isArray(projectResponse)
        ? projectResponse
        : Array.isArray(projectResponse?.projects)
        ? projectResponse.projects
        : Array.isArray(projectResponse?.data)
        ? projectResponse.data
        : [];

      const latestResults = await Promise.all(
        projects.map(async (project) => {
          try {
            const latest = await getLatestAssessment(project._id);
            return {
              project,
              assessment: latest,
            };
          } catch (error) {
            return {
              project,
              assessment: null,
            };
          }
        })
      );

      setRows(latestResults);
    } catch (error) {
      setMessage(
        error?.message || error?.response?.data?.message || "Failed to load admin assessments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminAssessments();
  }, []);

  const handleDelete = async (assessmentId) => {
    try {
      setMessage("");
      await deleteAssessment(assessmentId);
      setMessage("Assessment deleted successfully");
      await loadAdminAssessments();
    } catch (error) {
      setMessage(
        error?.message || error?.response?.data?.message || "Failed to delete assessment"
      );
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter(({ project, assessment }) => {
      const projectName = (project?.title || project?.name || "").toLowerCase();
      const projectType = (project?.projectType || project?.type || "").toLowerCase();
      const projectLocation = (project?.location?.address || "").toLowerCase();

      const term = search.toLowerCase();

      const matchesSearch =
        !term ||
        projectName.includes(term) ||
        projectType.includes(term) ||
        projectLocation.includes(term);

      const level = assessment?.riskLevel || "NOT_ASSESSED";
      const matchesLevel = riskFilter === "ALL" ? true : level === riskFilter;

      return matchesSearch && matchesLevel;
    });
  }, [rows, search, riskFilter]);

  const stats = useMemo(() => {
    const assessed = rows.filter((row) => row.assessment);
    const highRisk = assessed.filter(
      (row) => row.assessment?.riskLevel === "HIGH"
    );

    const avg =
      assessed.length > 0
        ? (
            assessed.reduce(
              (sum, row) => sum + (row.assessment?.riskScore || 0),
              0
            ) / assessed.length
          ).toFixed(1)
        : "0.0";

    return {
      totalProjects: rows.length,
      projectsAssessed: assessed.length,
      highRiskProjects: highRisk.length,
      averageRiskScore: avg,
    };
  }, [rows]);

  const badgeClass = (level) => {
    if (level === "HIGH") return "bg-red-100 text-red-700";
    if (level === "MEDIUM") return "bg-amber-100 text-amber-700";
    if (level === "LOW") return "bg-emerald-100 text-emerald-700";
    return "bg-slate-100 text-slate-500";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Assessments"
        description="Monitor assessment results, review project risk levels, and manage assessment records."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Total Projects
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {stats.totalProjects}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Projects Assessed
          </p>
          <p className="mt-3 text-3xl font-bold text-sky-600">
            {stats.projectsAssessed}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            High Risk Projects
          </p>
          <p className="mt-3 text-3xl font-bold text-rose-600">
            {stats.highRiskProjects}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Average Risk Score
          </p>
          <p className="mt-3 text-3xl font-bold text-orange-600">
            {stats.averageRiskScore}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            placeholder="Search by project, type, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
          />

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="NOT_ASSESSED">NOT ASSESSED</option>
          </select>

          <button
            onClick={loadAdminAssessments}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Sync
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading assessments...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-500">
                  <th className="px-6 py-4">Project Identity</th>
                  <th className="px-6 py-4">Schema Type</th>
                  <th className="px-6 py-4">Geographical Node</th>
                  <th className="px-6 py-4">Risk Metric</th>
                  <th className="px-6 py-4">Status Level</th>
                  <th className="px-6 py-4">Last Pulse</th>
                  <th className="px-6 py-4">Root Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                      No assessment records found
                    </td>
                  </tr>
                ) : (
                  filteredRows.map(({ project, assessment }) => (
                    <tr key={project._id} className="border-b last:border-0">
                      <td className="px-6 py-5 font-semibold text-slate-900">
                        {project.title || project.name || "Untitled Project"}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {project.projectType || project.type || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {project.location?.address || "N/A"}
                      </td>

                      <td className="px-6 py-5 font-bold text-slate-900">
                        {assessment?.riskScore ?? "-"}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                            assessment?.riskLevel || "NOT_ASSESSED"
                          )}`}
                        >
                          {assessment?.riskLevel || "NOT ASSESSED"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {assessment?.createdAt
                          ? new Date(assessment.createdAt).toLocaleString()
                          : "-"}
                      </td>

                      <td className="px-6 py-5">
                        {assessment?._id ? (
                          <button
                            onClick={() => handleDelete(assessment._id)}
                            className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAssessmentsPage;